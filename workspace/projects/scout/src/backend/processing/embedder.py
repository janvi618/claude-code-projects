"""
OpenAI text-embedding-3-small embedding generation.
Returns 1536-dimensional vectors for pgvector storage.
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


async def generate_embedding(headline: str, summary: str, strategic_relevance: str) -> Optional[list[float]]:
    """
    Generate a 1536-dim embedding for an intelligence item.
    Concatenates headline + summary + strategic_relevance.
    Returns None on failure.
    """
    from llm_client import embed, LLMProviderError

    text_parts = [p for p in [headline, summary, strategic_relevance] if p and p.strip()]
    if not text_parts:
        logger.warning("No text to embed — all fields empty")
        return None

    text = " ".join(text_parts)
    # Cap to avoid exceeding embedding model context limit
    text = text[:8000]

    try:
        vector = await embed(text)
        return vector
    except LLMProviderError as exc:
        logger.error("Embedding generation failed: %s", exc)
        return None
    except Exception as exc:
        logger.error("Unexpected embedding error: %s", exc)
        return None
