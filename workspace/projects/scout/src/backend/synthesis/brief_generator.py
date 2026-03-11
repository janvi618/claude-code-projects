"""
Daily brief synthesis using Claude Opus 4.
Generates a structured 400-700 word executive brief from the top-scored intelligence items.
"""

import logging
import re
from datetime import date, datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.daily_brief import DailyBrief
from models.intelligence_item import IntelligenceItem

logger = logging.getLogger(__name__)

BRIEF_SYSTEM_PROMPT = """You are an elite competitive intelligence analyst writing a daily brief for the Chief Innovation Officer of General Mills.

{gm_context}

Your brief must follow this EXACT structure:

**SCOUT Daily Brief — {weekday}, {month} {day}, {year}**

**Lead Signal**
[1 paragraph: The single most strategically important development. Frame as an implication or question for General Mills, not just a fact. This is the item the CIO reads even if they read nothing else.]

**New Products & Innovation**
• [Competitor] [action description] — [one-sentence impact assessment for General Mills' portfolio]
• [repeat 3-5 bullets total]

**Technology & Digital**
• [Tech development] — [frame in context of CAGNY 2026 AI divergence]
• [repeat 2-3 bullets]

**Science & Trends** *(include only if significant research was published)*
• [Research finding] — [connection to GM's three innovation priorities]
• [1-2 bullets max, or OMIT this section entirely]

**Worth Watching**
• [Emerging signal] — [brief context]
• [2-3 bullets]

---
*{item_count} intelligence items analyzed | {word_count_note}*

Rules:
- 400-700 words total (excluding header and footer)
- Every factual claim MUST reference a specific source item provided
- Active voice, lead with the action
- No marketing language or hedge words
- Be direct about competitive implications
- If fewer than 5 items exist, generate a shorter brief and note the quiet period"""

BRIEF_USER_PROMPT = """Generate the SCOUT Daily Brief based on these intelligence items from the past {hours} hours.

Items are ranked by relevance score (highest first):

{items_text}

Generate the brief now. Follow the exact format specified."""


def _format_items_for_prompt(items: list[IntelligenceItem]) -> str:
    """Format intelligence items for inclusion in the brief generation prompt."""
    lines = []
    for i, item in enumerate(items, 1):
        companies = ", ".join(item.companies or [])
        categories = ", ".join(item.categories or [])
        lines.append(
            f"[Item {i}] Score: {item.relevance_score} | Domain: {item.domain} | Companies: {companies}\n"
            f"Headline: {item.headline}\n"
            f"Summary: {item.summary or 'N/A'}\n"
            f"Strategic relevance: {item.strategic_relevance or 'N/A'}\n"
            f"Source: {item.source_name or 'Unknown'} | {item.published_at.strftime('%Y-%m-%d') if item.published_at else 'Unknown date'}\n"
            f"URL: {item.source_url or 'N/A'}\n"
        )
    return "\n".join(lines)


def _brief_to_html(text: str) -> str:
    """Convert markdown-style brief text to clean HTML."""
    html_lines = []
    lines = text.split("\n")
    in_section = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            html_lines.append("<br>")
            continue

        # Main title
        if stripped.startswith("**SCOUT Daily Brief"):
            title = stripped.strip("*").strip()
            html_lines.append(f'<h1 class="brief-title">{title}</h1>')

        # Section headers
        elif stripped.startswith("**") and stripped.endswith("**"):
            section = stripped.strip("*").strip()
            html_lines.append(f'<h2 class="brief-section">{section}</h2>')

        # Bullet points
        elif stripped.startswith("•") or stripped.startswith("-"):
            content = stripped.lstrip("•-").strip()
            # Bold the competitor name (before the first dash)
            if " — " in content:
                parts = content.split(" — ", 1)
                content = f"<strong>{parts[0]}</strong> — {parts[1]}"
            html_lines.append(f'<li>{content}</li>')

        # Footer line
        elif stripped.startswith("---"):
            html_lines.append('<hr class="brief-divider">')

        elif stripped.startswith("*") and stripped.endswith("*"):
            footer = stripped.strip("*")
            html_lines.append(f'<p class="brief-footer"><em>{footer}</em></p>')

        # Regular paragraph
        else:
            html_lines.append(f"<p>{stripped}</p>")

    # Wrap consecutive li elements in ul
    html = "\n".join(html_lines)
    html = re.sub(r"(<li>.*?</li>(\n<li>.*?</li>)*)", r"<ul>\1</ul>", html, flags=re.DOTALL)
    return f'<div class="scout-brief">{html}</div>'


def _count_words(text: str) -> int:
    return len(text.split())


async def generate_daily_brief(
    db_session: Optional[AsyncSession] = None,
    target_date: Optional[date] = None,
) -> Optional[DailyBrief]:
    """
    Generate the daily brief for `target_date` (default: today).
    Selects top-scored items from the past 24 hours (or 60h on Mondays).
    Saves the brief to the database.
    """
    from database import AsyncSessionLocal
    from models.context_document import ContextDocument

    if target_date is None:
        target_date = date.today()

    # Monday: cover Friday evening through Monday morning (~60 hours)
    weekday = target_date.weekday()  # 0=Monday
    hours_back = 60 if weekday == 0 else 24

    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours_back)

    ctx = db_session or AsyncSessionLocal()
    should_close = db_session is None

    try:
        if should_close:
            ctx = AsyncSessionLocal()
            db = await ctx.__aenter__()
        else:
            db = db_session

        # Check if brief already exists for today
        existing = await db.execute(
            select(DailyBrief).where(DailyBrief.brief_date == target_date)
        )
        if existing.scalar_one_or_none():
            logger.info("Brief already exists for %s — skipping", target_date)
            return None

        # Fetch top items
        result = await db.execute(
            select(IntelligenceItem)
            .where(
                IntelligenceItem.processed_at >= cutoff,
                IntelligenceItem.relevance_score >= 50,
            )
            .order_by(desc(IntelligenceItem.relevance_score))
            .limit(20)
        )
        items = result.scalars().all()

        # Load GM context
        ctx_result = await db.execute(
            select(ContextDocument).where(ContextDocument.key == "gm_context")
        )
        ctx_doc = ctx_result.scalar_one_or_none()
        gm_context = ctx_doc.content if ctx_doc else ""

        # Build prompts
        today = target_date
        weekday_name = today.strftime("%A")
        month_name = today.strftime("%B")
        day_num = today.strftime("%-d")
        year = today.strftime("%Y")

        item_count = len(items)
        word_count_note = "Quiet period — limited intelligence this window" if item_count < 5 else f"{item_count} items"

        system = BRIEF_SYSTEM_PROMPT.format(
            gm_context=gm_context,
            weekday=weekday_name,
            month=month_name,
            day=day_num,
            year=year,
            item_count=item_count,
            word_count_note=word_count_note,
        )

        items_text = _format_items_for_prompt(items)
        user_msg = BRIEF_USER_PROMPT.format(
            hours=hours_back,
            items_text=items_text if items_text else "No items found for this period.",
        )

        from llm_client import complete, LLMProviderError
        try:
            response = await complete(
                provider="anthropic",
                model="claude-opus-4-20250514",
                messages=[{"role": "user", "content": user_msg}],
                system=system,
                max_tokens=2000,
                temperature=0.1,
                task_type="brief_synthesis",
            )
        except LLMProviderError as exc:
            logger.error("Brief generation LLM failed: %s", exc)
            raise

        brief_text = response.content
        brief_html = _brief_to_html(brief_text)
        word_count = _count_words(brief_text)
        item_ids = [str(item.id) for item in items]

        brief = DailyBrief(
            brief_date=target_date,
            content_html=brief_html,
            content_text=brief_text,
            item_ids=item_ids,
            word_count=word_count,
            generated_at=datetime.now(timezone.utc),
            delivered_at=None,
            model_used="claude-opus-4-20250514",
            token_count_input=response.input_tokens,
            token_count_output=response.output_tokens,
        )
        db.add(brief)
        await db.commit()
        await db.refresh(brief)

        logger.info(
            "Brief generated for %s: %d words, %d items, %d input tokens",
            target_date, word_count, item_count, response.input_tokens,
        )
        return brief

    finally:
        if should_close:
            await ctx.__aexit__(None, None, None)
