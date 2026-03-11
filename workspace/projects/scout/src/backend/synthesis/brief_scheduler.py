"""
Brief generation scheduler.
Called by APScheduler at 6:30 AM CT weekdays.
Includes retry logic and fallback email on failure.
"""

import logging
from datetime import date, datetime

logger = logging.getLogger(__name__)


async def run_brief_generation() -> None:
    """
    Main entry point for scheduled brief generation.
    Retries once at 6:45 AM if the first attempt fails.
    Sends a fallback email if both attempts fail.
    """
    today = date.today()
    logger.info("Starting brief generation for %s", today)

    try:
        brief = await _attempt_generation(today)
        if brief:
            await _deliver_brief(brief)
    except Exception as exc:
        logger.error("Brief generation attempt 1 failed: %s", exc)
        logger.info("Retrying brief generation in 15 minutes...")

        # The APScheduler retry would be a separate job, but here we sleep briefly
        # and retry once (in production, APScheduler handles the 6:45 retry job)
        import asyncio
        await asyncio.sleep(900)  # 15 minutes

        try:
            brief = await _attempt_generation(today)
            if brief:
                await _deliver_brief(brief)
        except Exception as retry_exc:
            logger.error("Brief generation attempt 2 failed: %s", retry_exc)
            await _send_failure_notification(today, str(retry_exc))


async def _attempt_generation(target_date: date):
    """Attempt to generate a brief for the target date."""
    from synthesis.brief_generator import generate_daily_brief
    return await generate_daily_brief(target_date=target_date)


async def _deliver_brief(brief) -> None:
    """Deliver the generated brief via email to all subscribers."""
    from database import AsyncSessionLocal
    from models.user import User
    from synthesis.email_delivery import send_brief_email
    from sqlalchemy import select, update
    from models.daily_brief import DailyBrief
    from datetime import datetime, timezone

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.receive_brief == True)
        )
        recipients = [user.email for user in result.scalars().all()]

    if not recipients:
        logger.info("No brief recipients configured")
        return

    success = await send_brief_email(brief, recipients)

    if success:
        # Update delivered_at timestamp
        async with AsyncSessionLocal() as db:
            await db.execute(
                update(DailyBrief)
                .where(DailyBrief.id == brief.id)
                .values(delivered_at=datetime.now(timezone.utc))
            )
            await db.commit()
        logger.info("Brief delivered to %d recipients", len(recipients))


async def _send_failure_notification(brief_date: date, error: str) -> None:
    """Send failure notification email."""
    from synthesis.email_delivery import send_failure_email
    await send_failure_email(brief_date, error)
