"""Web scraper using httpx + BeautifulSoup, with Playwright fallback for JS-heavy sites."""

import asyncio
import logging
import re
import time
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import httpx
from bs4 import BeautifulSoup

from collectors.base import BaseCollector, RawContentCreate

logger = logging.getLogger(__name__)

# Minimum delay between requests to the same domain (seconds)
MIN_DOMAIN_DELAY = 2.0

# Track last-request time per domain
_domain_last_request: dict[str, float] = {}


async def _respect_rate_limit(domain: str) -> None:
    """Enforce minimum 2s delay between requests to the same domain."""
    last = _domain_last_request.get(domain, 0.0)
    elapsed = time.monotonic() - last
    if elapsed < MIN_DOMAIN_DELAY:
        await asyncio.sleep(MIN_DOMAIN_DELAY - elapsed)
    _domain_last_request[domain] = time.monotonic()


async def _check_robots(url: str) -> bool:
    """
    Return True if crawling is allowed.
    Returns True on any error (fail-open) except explicit Disallow.
    """
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    rp = RobotFileParser()
    rp.set_url(robots_url)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(robots_url)
            if resp.status_code == 200:
                rp.parse(resp.text.splitlines())
            else:
                return True  # No robots.txt — allow
    except Exception:
        return True  # Can't fetch robots.txt — allow
    return rp.can_fetch("*", url)


def _extract_article(soup: BeautifulSoup, url: str) -> dict:
    """Extract article title, body, and publication date from parsed HTML."""
    # Remove navigation, ads, scripts, styles
    for tag in soup(["script", "style", "nav", "header", "footer", "aside", "iframe", "noscript"]):
        tag.decompose()

    title = ""
    title_tag = (
        soup.find("h1")
        or soup.find("meta", property="og:title")
        or soup.find("title")
    )
    if title_tag:
        if hasattr(title_tag, "get"):
            title = title_tag.get("content", "") or title_tag.get_text(strip=True)
        else:
            title = title_tag.get_text(strip=True)

    # Try common article content selectors
    body_text = ""
    for selector in ["article", "main", '[role="main"]', ".article-body", ".post-content", "#content"]:
        content = soup.select_one(selector)
        if content:
            body_text = content.get_text(separator="\n", strip=True)
            break

    if not body_text:
        body_text = soup.get_text(separator="\n", strip=True)

    # Clean excessive whitespace
    body_text = re.sub(r"\n{3,}", "\n\n", body_text)

    # Try to extract publication date
    pub_date: Optional[datetime] = None
    date_meta = (
        soup.find("meta", property="article:published_time")
        or soup.find("meta", attrs={"name": "pubdate"})
        or soup.find("time")
    )
    if date_meta:
        date_str = (
            date_meta.get("content")
            or date_meta.get("datetime")
            or date_meta.get_text(strip=True)
        )
        if date_str:
            from dateutil import parser as dateparser
            try:
                pub_date = dateparser.parse(date_str)
                if pub_date and pub_date.tzinfo is None:
                    pub_date = pub_date.replace(tzinfo=timezone.utc)
            except Exception:
                pass

    # Extract author
    author_meta = soup.find("meta", attrs={"name": "author"}) or soup.find("meta", property="article:author")
    author = author_meta.get("content", "") if author_meta else ""

    return {
        "title": title,
        "body": body_text,
        "published_at": pub_date,
        "author": author,
    }


async def _fetch_with_httpx(url: str) -> Optional[str]:
    """Fetch a URL using httpx. Returns HTML string or None."""
    domain = urlparse(url).netloc
    await _respect_rate_limit(domain)

    async with httpx.AsyncClient(
        timeout=30.0,
        follow_redirects=True,
        headers={"User-Agent": "SCOUT/1.0 (General Mills Intelligence)"},
    ) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.text


async def _fetch_with_playwright(url: str) -> Optional[str]:
    """Fetch a JS-heavy page using Playwright headless Chromium."""
    domain = urlparse(url).netloc
    await _respect_rate_limit(domain)

    try:
        from playwright.async_api import async_playwright

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until="networkidle", timeout=30000)
            content = await page.content()
            await browser.close()
            return content
    except Exception as exc:
        logger.warning("Playwright fetch failed for %s: %s", url, exc)
        return None


class WebScraper(BaseCollector):
    """
    Scrapes article content from web pages.
    Uses httpx + BeautifulSoup first; falls back to Playwright for JS-heavy sites.
    Respects robots.txt and enforces 2s inter-domain delay.
    """

    async def collect(self) -> list[RawContentCreate]:
        """
        Scrape the configured URL. For scrape-type sources, the URL is typically
        a page listing multiple articles, but in MVP we scrape the single source URL.
        For list pages, config_json may contain 'article_links' or 'link_selector'.
        """
        url = self.source.url
        logger.info("Scrape collect: %s", url)

        # Check robots.txt
        if not await _check_robots(url):
            logger.warning("robots.txt disallows scraping %s — skipping", url)
            return []

        # Fetch HTML
        html = None
        try:
            html = await _fetch_with_httpx(url)
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code in (403, 429):
                logger.info("HTTP %d for %s — trying Playwright fallback", exc.response.status_code, url)
                html = await _fetch_with_playwright(url)
            else:
                logger.error("HTTP error scraping %s: %s", url, exc)
                await self.mark_source_failure()
                return []
        except Exception as exc:
            logger.error("Scrape failed for %s: %s", url, exc)
            await self.mark_source_failure()
            return []

        if not html:
            await self.mark_source_failure()
            return []

        soup = BeautifulSoup(html, "lxml")
        extracted = _extract_article(soup, url)

        if not extracted["body"]:
            logger.warning("No body text extracted from %s", url)
            await self.mark_source_failure()
            return []

        item = RawContentCreate(
            source_id=self.source.id,
            url=url,
            title=self.normalize_text(extracted["title"]),
            body=self.normalize_text(extracted["body"]),
            published_at=extracted["published_at"],
            metadata={
                "author": extracted.get("author"),
                "scrape_method": "httpx",
            },
        )

        await self.mark_source_healthy()
        return [item]

    async def scrape_article(self, url: str) -> Optional[RawContentCreate]:
        """Scrape a single article URL (used when a collector finds article links)."""
        if not await _check_robots(url):
            logger.warning("robots.txt disallows %s", url)
            return None

        html = None
        try:
            html = await _fetch_with_httpx(url)
        except Exception:
            html = await _fetch_with_playwright(url)

        if not html:
            return None

        soup = BeautifulSoup(html, "lxml")
        extracted = _extract_article(soup, url)

        if not extracted["body"]:
            return None

        return RawContentCreate(
            source_id=self.source.id,
            url=url,
            title=self.normalize_text(extracted["title"]),
            body=self.normalize_text(extracted["body"]),
            published_at=extracted["published_at"],
            metadata={"author": extracted.get("author")},
        )
