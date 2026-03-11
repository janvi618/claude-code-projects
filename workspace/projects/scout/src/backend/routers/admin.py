"""Admin endpoints — require admin role."""

import logging
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth import require_admin
from models.competitor import Competitor
from models.intelligence_item import IntelligenceItem
from models.llm_usage import LLMUsage
from models.raw_content import RawContent
from models.source import Source
from models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin", tags=["admin"])


# ─── Pydantic schemas ────────────────────────────────────────────────────────

class SourceResponse(BaseModel):
    id: uuid.UUID
    name: str
    source_type: str
    url: str
    cadence_minutes: int
    competitor_id: Optional[uuid.UUID]
    enabled: bool
    healthy: bool
    consecutive_failures: int
    last_collected_at: Optional[datetime]
    config_json: dict
    created_at: datetime

    class Config:
        from_attributes = True


class SourceCreate(BaseModel):
    name: str
    source_type: str
    url: str
    cadence_minutes: int
    competitor_id: Optional[uuid.UUID] = None
    config_json: dict = {}


class SourceUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    cadence_minutes: Optional[int] = None
    enabled: Optional[bool] = None
    config_json: Optional[dict] = None


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    role: str
    receive_brief: bool
    last_login_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class UserInvite(BaseModel):
    email: str
    role: str = "viewer"


class UserUpdate(BaseModel):
    role: Optional[str] = None
    receive_brief: Optional[bool] = None


# ─── Sources ─────────────────────────────────────────────────────────────────

@router.get("/sources", response_model=list[SourceResponse])
async def list_sources(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(Source).order_by(Source.created_at))
    return result.scalars().all()


@router.post("/sources", response_model=SourceResponse)
async def create_source(
    payload: SourceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if payload.source_type not in ("rss", "scrape", "api"):
        raise HTTPException(status_code=400, detail="Invalid source_type")
    source = Source(**payload.model_dump())
    db.add(source)
    await db.commit()
    await db.refresh(source)
    return source


@router.patch("/sources/{source_id}", response_model=SourceResponse)
async def update_source(
    source_id: uuid.UUID,
    payload: SourceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(Source).where(Source.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(source, field, value)

    await db.commit()
    await db.refresh(source)
    return source


@router.post("/sources/{source_id}/test")
async def test_source(
    source_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Trigger one test collection cycle for the given source."""
    result = await db.execute(select(Source).where(Source.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    async def _run_test():
        from collectors.rss import RSSCollector
        from collectors.scraper import WebScraper
        from collectors.api_collector import APICollector
        from collectors.deduplication import Deduplicator
        from database import AsyncSessionLocal

        async with AsyncSessionLocal() as session:
            try:
                if source.source_type == "rss":
                    collector = RSSCollector(source, session)
                elif source.source_type == "scrape":
                    collector = WebScraper(source, session)
                else:
                    collector = APICollector(source, session)
                items = await collector.collect()
                dedup = Deduplicator(session)
                saved = await dedup.save_new(items)
                logger.info("Test collection for source %s: %d items, %d new", source_id, len(items), saved)
            except Exception as exc:
                logger.error("Test collection failed for source %s: %s", source_id, exc)

    background_tasks.add_task(_run_test)
    return {"status": "Test collection started", "source_id": str(source_id)}


# ─── Users ───────────────────────────────────────────────────────────────────

@router.get("/users", response_model=list[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(User).order_by(User.created_at))
    return result.scalars().all()


@router.post("/users/invite")
async def invite_user(
    payload: UserInvite,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create user record and send magic link invite via Resend."""
    # Check if user already exists
    existing = await db.execute(select(User).where(User.email == payload.email))
    user = existing.scalar_one_or_none()

    if not user:
        user = User(email=payload.email, role=payload.role)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.info("Created new user for invite: (email masked)")
    else:
        if payload.role and user.role != payload.role:
            user.role = payload.role
            await db.commit()

    # Send magic link via Resend
    try:
        from synthesis.email_delivery import send_invite_email
        await send_invite_email(payload.email)
        return {"status": "Invite sent", "user_id": str(user.id)}
    except Exception as exc:
        logger.error("Failed to send invite email: %s", exc)
        return {"status": "User created but email failed", "user_id": str(user.id)}


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.role is not None:
        if payload.role not in ("admin", "viewer"):
            raise HTTPException(status_code=400, detail="Invalid role")
        user.role = payload.role
    if payload.receive_brief is not None:
        user.receive_brief = payload.receive_brief

    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    await db.delete(user)
    await db.commit()
    return {"status": "deleted"}


# ─── System Health ────────────────────────────────────────────────────────────

@router.get("/health")
async def system_health(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """System health metrics: collection stats, LLM costs, source health."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)

    # Collection stats
    raw_today = await db.execute(
        select(func.count(RawContent.id)).where(RawContent.collected_at >= today_start)
    )
    raw_week = await db.execute(
        select(func.count(RawContent.id)).where(RawContent.collected_at >= week_start)
    )
    raw_month = await db.execute(
        select(func.count(RawContent.id)).where(RawContent.collected_at >= month_start)
    )

    # Intelligence items
    items_today = await db.execute(
        select(func.count(IntelligenceItem.id)).where(IntelligenceItem.processed_at >= today_start)
    )
    items_week = await db.execute(
        select(func.count(IntelligenceItem.id)).where(IntelligenceItem.processed_at >= week_start)
    )

    # LLM costs
    cost_today = await db.execute(
        select(
            LLMUsage.provider,
            func.sum(LLMUsage.estimated_cost_usd).label("total_cost"),
        )
        .where(LLMUsage.timestamp >= today_start)
        .group_by(LLMUsage.provider)
    )
    cost_week = await db.execute(
        select(
            LLMUsage.provider,
            func.sum(LLMUsage.estimated_cost_usd).label("total_cost"),
        )
        .where(LLMUsage.timestamp >= week_start)
        .group_by(LLMUsage.provider)
    )
    cost_month = await db.execute(
        select(
            LLMUsage.provider,
            func.sum(LLMUsage.estimated_cost_usd).label("total_cost"),
        )
        .where(LLMUsage.timestamp >= month_start)
        .group_by(LLMUsage.provider)
    )

    # Source health
    healthy_count = await db.execute(
        select(func.count(Source.id)).where(Source.healthy == True, Source.enabled == True)
    )
    unhealthy_count = await db.execute(
        select(func.count(Source.id)).where(Source.healthy == False, Source.enabled == True)
    )
    disabled_count = await db.execute(
        select(func.count(Source.id)).where(Source.enabled == False)
    )

    # DB row counts
    raw_total = await db.execute(select(func.count(RawContent.id)))
    items_total = await db.execute(select(func.count(IntelligenceItem.id)))

    def rows_to_dict(result):
        return {row[0]: float(row[1]) for row in result.all()}

    return {
        "collection_stats": {
            "raw_content_today": raw_today.scalar_one(),
            "raw_content_week": raw_week.scalar_one(),
            "raw_content_month": raw_month.scalar_one(),
            "intelligence_items_today": items_today.scalar_one(),
            "intelligence_items_week": items_week.scalar_one(),
        },
        "llm_costs": {
            "today": rows_to_dict(cost_today),
            "week": rows_to_dict(cost_week),
            "month": rows_to_dict(cost_month),
        },
        "source_health": {
            "healthy": healthy_count.scalar_one(),
            "unhealthy": unhealthy_count.scalar_one(),
            "disabled": disabled_count.scalar_one(),
        },
        "database": {
            "raw_content_total": raw_total.scalar_one(),
            "intelligence_items_total": items_total.scalar_one(),
        },
    }
