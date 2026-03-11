"""Research chat endpoint with RAG pipeline."""

import logging
import time
from typing import Optional

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from database import get_db
from middleware.auth import get_current_user
from models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["chat"])
settings = get_settings()


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=10)


class SourceCitation(BaseModel):
    title: str
    url: Optional[str]
    published_at: Optional[str]
    similarity: Optional[float]


class ChatResponse(BaseModel):
    response: str
    sources: list[SourceCitation]
    suggestions: list[str]


def _sanitize_input(text: str) -> str:
    """Basic sanitization to reduce prompt injection risk."""
    # Strip common injection patterns
    dangerous_patterns = [
        "ignore previous instructions",
        "ignore all instructions",
        "system prompt",
        "you are now",
        "forget your instructions",
        "<system>",
        "</system>",
        "[INST]",
        "[/INST]",
    ]
    sanitized = text
    for pattern in dangerous_patterns:
        sanitized = sanitized.replace(pattern, "[FILTERED]")
    return sanitized[:2000]  # Hard cap


async def _check_rate_limit(user_id: str) -> bool:
    """Check chat rate limit: 20 requests per user per hour."""
    try:
        r = aioredis.from_url(settings.redis_url)
        key = f"chat_ratelimit:{user_id}"
        count = await r.incr(key)
        if count == 1:
            await r.expire(key, 3600)
        await r.aclose()
        return count <= settings.chat_rate_limit_per_hour
    except Exception as exc:
        logger.warning("Rate limit check failed (allowing request): %s", exc)
        return True  # Fail open to avoid blocking on Redis issues


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Research chat using RAG:
    1. Embed query
    2. Semantic search in pgvector
    3. Synthesize response with Claude Sonnet
    """
    if not await _check_rate_limit(str(current_user.id)):
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Maximum {settings.chat_rate_limit_per_hour} chat requests per hour.",
        )

    sanitized_message = _sanitize_input(request.message)

    # Step 1: Generate query embedding
    from llm_client import embed, complete, LLMProviderError

    try:
        query_embedding = await embed(sanitized_message)
    except LLMProviderError as exc:
        logger.error("Embedding failed for chat query: %s", exc)
        raise HTTPException(status_code=503, detail="Embedding service unavailable")

    # Step 2: Semantic search
    from sqlalchemy import text

    embedding_literal = str(query_embedding)
    search_result = await db.execute(
        text(
            """
            SELECT
                id, headline, summary, source_url, source_name, published_at,
                strategic_relevance,
                1 - (embedding <=> :embedding ::vector) AS similarity
            FROM intelligence_items
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> :embedding ::vector
            LIMIT 10
            """
        ),
        {"embedding": embedding_literal},
    )
    rows = search_result.mappings().all()

    # Filter by minimum similarity threshold
    relevant_rows = [r for r in rows if float(r["similarity"]) >= 0.3]
    high_confidence_rows = [r for r in relevant_rows if float(r["similarity"]) >= 0.5]
    low_confidence = len(high_confidence_rows) < 3

    # Step 3: Load GM context
    from sqlalchemy import select as sa_select
    from models.context_document import ContextDocument

    ctx_result = await db.execute(
        sa_select(ContextDocument).where(ContextDocument.key == "gm_context")
    )
    ctx_doc = ctx_result.scalar_one_or_none()
    gm_context = ctx_doc.content if ctx_doc else "General Mills competitive intelligence platform."

    # Build context for Claude
    retrieved_context = ""
    sources_used = []
    if relevant_rows:
        retrieved_context = "\n\n".join(
            f"[{i+1}] {r['headline']}\n"
            f"Summary: {r['summary'] or 'N/A'}\n"
            f"Strategic relevance: {r['strategic_relevance'] or 'N/A'}\n"
            f"Source: {r['source_name'] or 'Unknown'} | {r['published_at'] or 'Unknown date'}\n"
            f"URL: {r['source_url'] or ''}"
            for i, r in enumerate(relevant_rows[:8])
        )
        sources_used = [
            {
                "title": r["headline"],
                "url": r["source_url"],
                "published_at": r["published_at"].isoformat() if r["published_at"] else None,
                "similarity": float(r["similarity"]),
            }
            for r in relevant_rows[:8]
        ]

    # Build conversation history (last 5 turns)
    history_turns = request.history[-10:]  # 5 turns = 10 messages
    messages = []
    for h in history_turns:
        messages.append({"role": h.role, "content": h.content})

    # Add the current query
    user_content = sanitized_message
    if retrieved_context:
        user_content = (
            f"Question: {sanitized_message}\n\n"
            f"--- Retrieved Intelligence Items ---\n{retrieved_context}\n---\n\n"
            f"Please answer based on the retrieved items above, citing them with [1], [2], etc."
        )
        if low_confidence:
            user_content += "\n\nNote: The knowledge base has limited data on this topic. Supplement with general knowledge where appropriate, and be explicit about what comes from the knowledge base vs. general knowledge."

    messages.append({"role": "user", "content": user_content})

    system_prompt = f"""You are a competitive intelligence analyst for General Mills.
You have access to a curated database of competitive intelligence about the food and CPG industry.

General Mills Context:
{gm_context}

Instructions:
- Answer the user's question directly and concisely
- Cite specific sources using bracketed references [1], [2], etc. when citing retrieved items
- If the knowledge base data is insufficient, say so explicitly
- End your response with exactly 2-3 follow-up questions formatted as:
  FOLLOW_UP_SUGGESTIONS:
  1. [question 1]
  2. [question 2]
  3. [question 3]
"""

    try:
        response = await complete(
            provider="anthropic",
            model="claude-sonnet-4-20250514",
            messages=messages,
            system=system_prompt,
            max_tokens=2048,
            temperature=0.1,
            task_type="research_chat",
        )
    except LLMProviderError as exc:
        logger.error("LLM call failed in chat: %s", exc)
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable")

    # Parse out follow-up suggestions
    content = response.content
    suggestions = []
    if "FOLLOW_UP_SUGGESTIONS:" in content:
        parts = content.split("FOLLOW_UP_SUGGESTIONS:")
        main_response = parts[0].strip()
        suggestions_text = parts[1].strip() if len(parts) > 1 else ""
        for line in suggestions_text.split("\n"):
            line = line.strip()
            if line and line[0].isdigit() and ". " in line:
                suggestion = line.split(". ", 1)[1].strip()
                if suggestion:
                    suggestions.append(suggestion)
    else:
        main_response = content

    return ChatResponse(
        response=main_response,
        sources=[SourceCitation(**s) for s in sources_used],
        suggestions=suggestions[:3],
    )
