"""Competitor ORM model."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMPTZ, UUID
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base


class Competitor(Base):
    __tablename__ = "competitors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    ticker: Mapped[str | None] = mapped_column(String(10))
    tier: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        # Check constraint defined in schema.sql
    )
    aliases: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list)
    monitoring_keywords: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMPTZ, nullable=False, server_default=func.now()
    )
