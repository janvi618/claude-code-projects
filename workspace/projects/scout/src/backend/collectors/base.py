"""Abstract base class for all SCOUT collectors."""

import hashlib
import logging
import re
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


@dataclass
class RawContentCreate:
    """Data object for a newly collected item, before it's saved to the DB."""
    source_id: UUID
    url: Optional[str]
    title: Optional[str]
    body: str
    published_at: Optional[datetime]
    metadata: dict = field(default_factory=dict)

    @property
    def content_hash(self) -> str:
        """SHA-256 of the normalized body text."""
        normalized = re.sub(r"\s+", " ", (self.body or "").strip())
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


class BaseCollector(ABC):
    """
    Abstract base for all collector types.
    Subclasses must implement `collect()`.
    """

    def __init__(self, source, db: AsyncSession):
        self.source = source
        self.db = db
        self.logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")

    @abstractmethod
    async def collect(self) -> list[RawContentCreate]:
        """Fetch content from the source and return normalized RawContentCreate objects."""
        ...

    def normalize_text(self, text: str) -> str:
        """Strip excessive whitespace and control characters."""
        if not text:
            return ""
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
        text = re.sub(r"\s{3,}", "\n\n", text)
        return text.strip()

    def deduplicate_locally(self, items: list[RawContentCreate]) -> list[RawContentCreate]:
        """Remove duplicates within a single collection run (same hash)."""
        seen: set[str] = set()
        result = []
        for item in items:
            h = item.content_hash
            if h not in seen:
                seen.add(h)
                result.append(item)
        return result

    async def mark_source_healthy(self) -> None:
        """Reset consecutive failure count and mark source healthy."""
        from sqlalchemy import update
        from models.source import Source

        await self.db.execute(
            update(Source)
            .where(Source.id == self.source.id)
            .values(healthy=True, consecutive_failures=0, last_collected_at=datetime.now(timezone.utc))
        )
        await self.db.commit()

    async def mark_source_failure(self) -> None:
        """Increment failure count; mark unhealthy after 3 consecutive failures."""
        from sqlalchemy import update
        from models.source import Source

        new_failures = (self.source.consecutive_failures or 0) + 1
        values = {
            "consecutive_failures": new_failures,
        }
        if new_failures >= 3:
            values["healthy"] = False
            self.logger.warning(
                "Source %s (%s) marked unhealthy after %d consecutive failures",
                self.source.id, self.source.name, new_failures,
            )
        await self.db.execute(
            update(Source).where(Source.id == self.source.id).values(**values)
        )
        await self.db.commit()
