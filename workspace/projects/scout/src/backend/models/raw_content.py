"""RawContent ORM model."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID 
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base


class RawContent(Base):
    __tablename__ = "raw_content"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False
    )
    url: Mapped[str | None] = mapped_column(String(2000))
    title: Mapped[str | None] = mapped_column(String(1000))
    body: Mapped[str | None] = mapped_column(Text)
    published_at: Mapped[datetime | None] = mapped_column()
    collected_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now()
    )
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    extra_metadata: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict)
    processed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
