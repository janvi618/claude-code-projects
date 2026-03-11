"""SHA-256 deduplication: check-before-insert to avoid storing duplicate content."""

import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from collectors.base import RawContentCreate
from models.raw_content import RawContent

logger = logging.getLogger(__name__)


class Deduplicator:
    """
    Checks content hashes against the database before inserting.
    Only saves items whose hash is not already present.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_new(self, items: list[RawContentCreate]) -> int:
        """
        Save items that are not already in the database.
        Returns the count of newly saved items.
        """
        if not items:
            return 0

        # Collect all hashes from this batch
        hashes = [item.content_hash for item in items]

        # Find which hashes already exist
        result = await self.db.execute(
            select(RawContent.content_hash).where(RawContent.content_hash.in_(hashes))
        )
        existing_hashes = {row[0] for row in result.all()}

        # Insert only new items
        new_count = 0
        for item in items:
            if item.content_hash in existing_hashes:
                logger.debug("Skipping duplicate content (hash already exists)")
                continue

            raw = RawContent(
                source_id=item.source_id,
                url=item.url,
                title=item.title,
                body=item.body,
                published_at=item.published_at,
                collected_at=datetime.now(timezone.utc),
                content_hash=item.content_hash,
                metadata=item.metadata,
                processed=False,
            )
            self.db.add(raw)
            existing_hashes.add(item.content_hash)  # Prevent duplicates within this batch
            new_count += 1

        if new_count > 0:
            await self.db.commit()
            logger.info("Saved %d new raw content items", new_count)

        return new_count
