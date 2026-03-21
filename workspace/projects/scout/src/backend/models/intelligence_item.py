"""IntelligenceItem ORM model."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base


class IntelligenceItem(Base):
    __tablename__ = "intelligence_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    raw_content_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("raw_content.id", ondelete="CASCADE"), nullable=False
    )
    headline: Mapped[str] = mapped_column(String(200), nullable=False)
    summary: Mapped[str | None] = mapped_column(Text)
    companies: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    brands: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    categories: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    domain: Mapped[str] = mapped_column(String(50), nullable=False)
    claims: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    sentiment: Mapped[str | None] = mapped_column(String(20))
    strategic_relevance: Mapped[str | None] = mapped_column(Text)
    relevance_score: Mapped[int] = mapped_column(Integer, nullable=False)
    embedding: Mapped[str | None] = mapped_column(Text)
    source_url: Mapped[str | None] = mapped_column(String(2000))
    source_name: Mapped[str | None] = mapped_column(String(200))
    published_at: Mapped[datetime | None] = mapped_column()
    processed_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now()
    )
    alerted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
