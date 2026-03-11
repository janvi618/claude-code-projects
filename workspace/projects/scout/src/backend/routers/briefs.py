"""Daily brief endpoints."""

import logging
import uuid
from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth import get_current_user, require_admin
from models.daily_brief import DailyBrief
from models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/briefs", tags=["briefs"])


class BriefResponse(BaseModel):
    id: uuid.UUID
    brief_date: date
    content_html: str
    content_text: Optional[str]
    item_ids: list
    word_count: Optional[int]
    generated_at: datetime
    delivered_at: Optional[datetime]
    model_used: Optional[str]
    token_count_input: Optional[int]
    token_count_output: Optional[int]

    class Config:
        from_attributes = True


class BriefSummary(BaseModel):
    id: uuid.UUID
    brief_date: date
    word_count: Optional[int]
    generated_at: datetime
    delivered_at: Optional[datetime]

    class Config:
        from_attributes = True


@router.get("", response_model=list[BriefSummary])
async def list_briefs(
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all briefs, newest first."""
    result = await db.execute(
        select(DailyBrief)
        .order_by(desc(DailyBrief.brief_date))
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()


@router.get("/latest", response_model=BriefResponse)
async def get_latest_brief(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the most recent brief."""
    result = await db.execute(
        select(DailyBrief).order_by(desc(DailyBrief.brief_date)).limit(1)
    )
    brief = result.scalar_one_or_none()
    if not brief:
        raise HTTPException(status_code=404, detail="No briefs found")
    return brief


@router.get("/{brief_date}", response_model=BriefResponse)
async def get_brief_by_date(
    brief_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the brief for a specific date (YYYY-MM-DD)."""
    result = await db.execute(
        select(DailyBrief).where(DailyBrief.brief_date == brief_date)
    )
    brief = result.scalar_one_or_none()
    if not brief:
        raise HTTPException(status_code=404, detail=f"No brief found for {brief_date}")
    return brief


@router.post("/generate")
async def generate_brief(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin only: manually trigger brief generation for today."""
    from synthesis.brief_generator import generate_daily_brief

    background_tasks.add_task(generate_daily_brief, db_session=None)
    return {"status": "Brief generation started", "date": date.today().isoformat()}
