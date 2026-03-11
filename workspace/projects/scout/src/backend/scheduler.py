"""
APScheduler setup — runs all collection and brief-generation jobs in-process.
Integrates with FastAPI lifespan events.

All times are in US/Central (America/Chicago) unless noted.
"""

import logging
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

_scheduler: AsyncIOScheduler | None = None


# ─── Collection runners ──────────────────────────────────────────────────────

async def _run_collection_for_type(source_type_filter: str | None = None, tier: int | None = None):
    """Run collection for all enabled sources matching the given filter."""
    from database import AsyncSessionLocal
    from models.source import Source
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        query = select(Source).where(Source.enabled == True)
        if source_type_filter:
            query = query.where(Source.source_type == source_type_filter)
        if tier is not None:
            # Join competitors to filter by tier
            from models.competitor import Competitor
            from sqlalchemy import and_
            query = query.join(Competitor, Source.competitor_id == Competitor.id, isouter=True)
            query = query.where(
                (Competitor.tier == tier) | (Source.competitor_id == None)
            )

        result = await db.execute(query)
        sources = result.scalars().all()

    for source in sources:
        await _collect_source(source)


async def _collect_source(source):
    """Collect content from a single source and run processing pipeline."""
    from database import AsyncSessionLocal
    from collectors.rss import RSSCollector
    from collectors.scraper import WebScraper
    from collectors.api_collector import APICollector
    from collectors.deduplication import Deduplicator

    logger.info("Starting collection: source=%s type=%s", source.name, source.source_type)
    async with AsyncSessionLocal() as db:
        try:
            if source.source_type == "rss":
                collector = RSSCollector(source, db)
            elif source.source_type == "scrape":
                collector = WebScraper(source, db)
            elif source.source_type == "api":
                collector = APICollector(source, db)
            else:
                logger.warning("Unknown source type: %s", source.source_type)
                return

            items = await collector.collect()
            dedup = Deduplicator(db)
            new_count = await dedup.save_new(items)
            logger.info(
                "Collected %d items (%d new) from source: %s",
                len(items), new_count, source.name,
            )
        except Exception as exc:
            logger.error("Collection failed for source %s: %s", source.name, exc)

    # Trigger processing pipeline for any new unprocessed content
    if new_count > 0:
        await _run_processing_pipeline()


async def _run_processing_pipeline():
    """Process all unprocessed raw_content through extraction → scoring → embedding."""
    try:
        from processing.pipeline import process_unprocessed_items
        await process_unprocessed_items()
    except Exception as exc:
        logger.error("Processing pipeline failed: %s", exc)


async def _run_tier1_newsrooms():
    """Collect Tier 1 competitor newsrooms (every 6 hours)."""
    logger.info("Scheduler: running Tier 1 newsroom collection")
    await _run_collection_for_type_and_tier_filter(tier_filter=1)


async def _run_trade_press():
    """Collect trade press RSS feeds (every 6 hours, offset by 1 hour)."""
    logger.info("Scheduler: running trade press RSS collection")
    # Trade press sources have no competitor_id
    from database import AsyncSessionLocal
    from models.source import Source
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Source).where(
                Source.enabled == True,
                Source.source_type == "rss",
                Source.competitor_id == None,
            )
        )
        sources = result.scalars().all()

    for source in sources:
        await _collect_source(source)


async def _run_collection_for_type_and_tier_filter(tier_filter: int | None = None):
    from database import AsyncSessionLocal
    from models.source import Source
    from models.competitor import Competitor
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        query = select(Source).where(Source.enabled == True)
        if tier_filter is not None:
            query = (
                query.join(Competitor, Source.competitor_id == Competitor.id)
                .where(Competitor.tier == tier_filter)
            )
        result = await db.execute(query)
        sources = result.scalars().all()

    for source in sources:
        await _collect_source(source)


async def _run_edgar():
    """Collect SEC EDGAR 8-K filings (daily at 10 PM CT)."""
    logger.info("Scheduler: running SEC EDGAR collection")
    from database import AsyncSessionLocal
    from models.source import Source
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Source).where(
                Source.enabled == True,
                Source.source_type == "api",
                Source.config_json["api_type"].astext == "sec_edgar",
            )
        )
        sources = result.scalars().all()

    for source in sources:
        await _collect_source(source)


async def _run_pubmed():
    """Collect PubMed research articles (weekly, Sunday 2 AM CT)."""
    logger.info("Scheduler: running PubMed collection")
    from database import AsyncSessionLocal
    from models.source import Source
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Source).where(
                Source.enabled == True,
                Source.source_type == "api",
                Source.config_json["api_type"].astext == "pubmed",
            )
        )
        sources = result.scalars().all()

    for source in sources:
        await _collect_source(source)


async def _run_tech_press():
    """Collect tech press RSS (daily at 8 AM CT)."""
    logger.info("Scheduler: running tech press collection")
    from database import AsyncSessionLocal
    from models.source import Source
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Source).where(
                Source.enabled == True,
                Source.source_type == "rss",
                Source.config_json["category"].astext == "tech_press",
            )
        )
        sources = result.scalars().all()

    for source in sources:
        await _collect_source(source)


async def _run_brief_generation():
    """Generate and deliver the daily brief (weekdays 6:30 AM CT)."""
    logger.info("Scheduler: running daily brief generation")
    try:
        from synthesis.brief_scheduler import run_brief_generation
        await run_brief_generation()
    except Exception as exc:
        logger.error("Brief generation scheduler failed: %s", exc)


# ─── Scheduler lifecycle ─────────────────────────────────────────────────────

async def start_scheduler() -> None:
    """Initialize and start the APScheduler instance."""
    global _scheduler

    _scheduler = AsyncIOScheduler(timezone="America/Chicago")

    # Tier 1 newsrooms: every 6 hours at :00 CT
    _scheduler.add_job(
        _run_tier1_newsrooms,
        CronTrigger(hour="0,6,12,18", minute=0, timezone="America/Chicago"),
        id="tier1_newsrooms",
        name="Tier 1 Competitor Newsrooms",
        misfire_grace_time=3600,
        coalesce=True,
    )

    # Trade press: every 6 hours at :00 CT, offset by 1 hour
    _scheduler.add_job(
        _run_trade_press,
        CronTrigger(hour="1,7,13,19", minute=0, timezone="America/Chicago"),
        id="trade_press",
        name="Trade Press RSS",
        misfire_grace_time=3600,
        coalesce=True,
    )

    # SEC EDGAR 8-Ks: daily at 10 PM CT
    _scheduler.add_job(
        _run_edgar,
        CronTrigger(hour=22, minute=0, timezone="America/Chicago"),
        id="sec_edgar",
        name="SEC EDGAR 8-K Collection",
        misfire_grace_time=3600,
        coalesce=True,
    )

    # PubMed: weekly, Sunday at 2 AM CT
    _scheduler.add_job(
        _run_pubmed,
        CronTrigger(day_of_week="sun", hour=2, minute=0, timezone="America/Chicago"),
        id="pubmed",
        name="PubMed Research Articles",
        misfire_grace_time=7200,
        coalesce=True,
    )

    # Tech press: daily at 8 AM CT
    _scheduler.add_job(
        _run_tech_press,
        CronTrigger(hour=8, minute=0, timezone="America/Chicago"),
        id="tech_press",
        name="Tech Press RSS",
        misfire_grace_time=3600,
        coalesce=True,
    )

    # Daily brief: weekdays at 6:30 AM CT
    _scheduler.add_job(
        _run_brief_generation,
        CronTrigger(day_of_week="mon-fri", hour=6, minute=30, timezone="America/Chicago"),
        id="daily_brief",
        name="Daily Brief Generation",
        misfire_grace_time=1800,
        coalesce=True,
    )

    _scheduler.start()
    logger.info("APScheduler started with %d jobs", len(_scheduler.get_jobs()))


async def stop_scheduler() -> None:
    """Gracefully shut down the scheduler."""
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("APScheduler stopped")
