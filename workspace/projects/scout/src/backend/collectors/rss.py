"""RSS/Atom feed collector using feedparser."""

import logging
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Optional

import feedparser
import httpx

from collectors.base import BaseCollector, RawContentCreate

logger = logging.getLogger(__name__)


def _parse_date(entry) -> Optional[datetime]:
    """Parse a published/updated date from a feedparser entry."""
    for attr in ("published_parsed", "updated_parsed"):
        val = getattr(entry, attr, None)
        if val:
            try:
                import calendar
                ts = calendar.timegm(val)
                return datetime.fromtimestamp(ts, tz=timezone.utc)
            except Exception:
                pass

    for attr in ("published", "updated"):
        val = getattr(entry, attr, None)
        if val:
            try:
                return parsedate_to_datetime(val)
            except Exception:
                pass

    return None


def _extract_body(entry) -> str:
    """Extract the best available text body from a feedparser entry."""
    # Try content first (full body), then summary
    for content_list in (getattr(entry, "content", []),):
        for item in content_list:
            text = item.get("value", "")
            if text:
                return _strip_html(text)

    summary = getattr(entry, "summary", "") or ""
    if summary:
        return _strip_html(summary)

    return ""


def _strip_html(html: str) -> str:
    """Strip HTML tags from a string."""
    from bs4 import BeautifulSoup
    try:
        return BeautifulSoup(html, "lxml").get_text(separator="\n", strip=True)
    except Exception:
        import re
        return re.sub(r"<[^>]+>", " ", html)


class RSSCollector(BaseCollector):
    """
    Collects content from RSS/Atom feeds using feedparser.
    Handles malformed feeds gracefully: logs errors, skips bad entries.
    """

    async def collect(self) -> list[RawContentCreate]:
        """Fetch and parse the RSS feed, returning normalized RawContent records."""
        url = self.source.url
        self.logger.info("RSS collect: %s", url)

        try:
            # Fetch the raw feed bytes with httpx for better control
            async with httpx.AsyncClient(
                timeout=30.0,
                follow_redirects=True,
                headers={"User-Agent": "SCOUT/1.0 (General Mills Intelligence; contact: scout@generalmills.com)"},
            ) as client:
                response = await client.get(url)
                response.raise_for_status()
                raw_bytes = response.content
        except httpx.HTTPError as exc:
            self.logger.error("Failed to fetch RSS feed %s: %s", url, exc)
            await self.mark_source_failure()
            return []

        # Parse with feedparser
        feed = feedparser.parse(raw_bytes)

        if feed.bozo and not feed.entries:
            self.logger.warning(
                "RSS feed %s is malformed (bozo=%s), skipping",
                url, feed.bozo_exception,
            )
            await self.mark_source_failure()
            return []

        items: list[RawContentCreate] = []
        for entry in feed.entries:
            try:
                link = getattr(entry, "link", None)
                title = getattr(entry, "title", None)
                body = _extract_body(entry)

                if not body and not title:
                    continue  # Skip empty entries

                published_at = _parse_date(entry)

                item = RawContentCreate(
                    source_id=self.source.id,
                    url=link,
                    title=self.normalize_text(title or ""),
                    body=self.normalize_text(body),
                    published_at=published_at,
                    metadata={
                        "feed_url": url,
                        "author": getattr(entry, "author", None),
                        "tags": [t.get("term") for t in getattr(entry, "tags", []) if t.get("term")],
                    },
                )
                items.append(item)
            except Exception as exc:
                self.logger.warning("Skipping malformed RSS entry in %s: %s", url, exc)
                continue

        self.logger.info("RSS %s: collected %d entries", url, len(items))
        await self.mark_source_healthy()
        return self.deduplicate_locally(items)
