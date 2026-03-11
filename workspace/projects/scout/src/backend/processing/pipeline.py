"""
Intelligence processing pipeline.
Orchestrates: raw_content → extract → score → embed → save intelligence item.

Processes items sequentially with 1-second delay between LLM calls.
Triggers an email alert for items scoring >= 85.
"""

import asyncio
import logging
from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from models.raw_content import RawContent
from models.intelligence_item import IntelligenceItem

logger = logging.getLogger(__name__)


async def _get_gm_context(db: AsyncSession) -> str:
    """Load General Mills context document from the database."""
    from models.context_document import ContextDocument

    result = await db.execute(
        select(ContextDocument).where(ContextDocument.key == "gm_context")
    )
    doc = result.scalar_one_or_none()
    if doc:
        return doc.content
    return (
        "General Mills is a leading global food company with brands including "
        "Cheerios, Nature Valley, Häagen-Dazs, Betty Crocker, Pillsbury, Old El Paso, "
        "and Blue Buffalo. Key innovation priorities: bold flavors, familiar favorites, "
        "better-for-you. Core categories: cereal, snack bars, pet food, ice cream, "
        "Mexican food, dough, meals & soup, baking, hot snacks/frozen, fruit snacks."
    )


async def process_single_item(raw_content: RawContent, db: AsyncSession) -> bool:
    """
    Process one raw content item through the full pipeline.
    Returns True if an IntelligenceItem was created, False otherwise.
    """
    from processing.extractor import extract_intelligence
    from processing.scorer import score_item
    from processing.embedder import generate_embedding

    gm_context = await _get_gm_context(db)

    # Step 1: Extract
    extracted = await extract_intelligence(raw_content, gm_context)
    if not extracted:
        # Mark as processed even on failure to avoid re-processing
        await db.execute(
            update(RawContent).where(RawContent.id == raw_content.id).values(processed=True)
        )
        await db.commit()
        return False

    # Step 2: Score
    await asyncio.sleep(1)  # Rate limit between LLM calls
    score = await score_item(
        {
            "headline": extracted.headline,
            "summary": extracted.summary,
            "companies": extracted.companies,
            "categories": extracted.categories,
            "domain": extracted.domain,
            "strategic_relevance": extracted.strategic_relevance,
        },
        gm_context,
    )

    # Step 3: Embed
    await asyncio.sleep(1)
    embedding = await generate_embedding(
        extracted.headline,
        extracted.summary,
        extracted.strategic_relevance,
    )

    # Step 4: Save
    item = IntelligenceItem(
        raw_content_id=extracted.raw_content_id,
        headline=extracted.headline,
        summary=extracted.summary,
        companies=extracted.companies,
        brands=extracted.brands,
        categories=extracted.categories,
        domain=extracted.domain,
        claims=extracted.claims,
        sentiment=extracted.sentiment,
        strategic_relevance=extracted.strategic_relevance,
        relevance_score=score,
        embedding=embedding,
        source_url=extracted.source_url,
        source_name=extracted.source_name,
        published_at=extracted.published_at,
        processed_at=datetime.now(timezone.utc),
        alerted=False,
    )
    db.add(item)

    # Mark raw content as processed
    await db.execute(
        update(RawContent).where(RawContent.id == raw_content.id).values(processed=True)
    )
    await db.commit()
    await db.refresh(item)

    logger.info(
        "Processed item: headline='%s' score=%d domain=%s",
        extracted.headline[:60], score, extracted.domain,
    )

    # Step 5: Alert if score >= threshold
    from config import get_settings
    settings = get_settings()
    if score >= settings.alert_score_threshold:
        await _send_alert(item, db)

    return True


async def _send_alert(item: IntelligenceItem, db: AsyncSession) -> None:
    """Send an email alert for high-scoring items."""
    try:
        from synthesis.email_delivery import send_alert_email
        await send_alert_email(item)
        # Mark as alerted
        await db.execute(
            update(IntelligenceItem).where(IntelligenceItem.id == item.id).values(alerted=True)
        )
        await db.commit()
    except Exception as exc:
        logger.error("Alert email failed for item %s: %s", item.id, exc)


async def process_unprocessed_items() -> int:
    """
    Fetch all unprocessed raw_content records and run the pipeline.
    Returns the count of successfully processed items.
    """
    from database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(RawContent)
            .where(RawContent.processed == False)
            .order_by(RawContent.collected_at)
            .limit(100)  # Process in batches
        )
        items = result.scalars().all()

    if not items:
        logger.debug("No unprocessed items to process")
        return 0

    logger.info("Processing %d unprocessed raw content items", len(items))
    processed_count = 0

    for raw_content in items:
        try:
            async with AsyncSessionLocal() as db:
                # Reload within new session
                result = await db.execute(
                    select(RawContent).where(RawContent.id == raw_content.id)
                )
                fresh_content = result.scalar_one_or_none()
                if fresh_content and not fresh_content.processed:
                    success = await process_single_item(fresh_content, db)
                    if success:
                        processed_count += 1
        except Exception as exc:
            logger.error("Failed to process raw_content_id=%s: %s", raw_content.id, exc)
            continue

        # 1 second between items to respect LLM rate limits
        await asyncio.sleep(1)

    logger.info("Batch processing complete: %d/%d items processed", processed_count, len(items))
    return processed_count
