"""DailyBrief ORM model."""

import uuid
from datetime import date, datetime

from sqlalchemy import Date, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMPTZ, UUID
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base


class DailyBrief(Base):
    __tablename__ = "daily_briefs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    brief_date: Mapped[date] = mapped_column(Date, nullable=False, unique=True)
    content_html: Mapped[str] = mapped_column(Text, nullable=False)
    content_text: Mapped[str | None] = mapped_column(Text)
    item_ids: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    word_count: Mapped[int | None] = mapped_column(Integer)
    generated_at: Mapped[datetime] = mapped_column(
        TIMESTAMPTZ, nullable=False, server_default=func.now()
    )
    delivered_at: Mapped[datetime | None] = mapped_column(TIMESTAMPTZ)
    model_used: Mapped[str | None] = mapped_column(String(100))
    token_count_input: Mapped[int | None] = mapped_column(Integer)
    token_count_output: Mapped[int | None] = mapped_column(Integer)
