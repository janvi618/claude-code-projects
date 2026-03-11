"""
Claude Sonnet extraction pipeline.
Transforms raw content into structured IntelligenceItem data.
"""

import json
import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import UUID

logger = logging.getLogger(__name__)

# Valid domain values
VALID_DOMAINS = {
    "new_products", "technology_digital", "science_trends",
    "earnings_strategy", "leadership", "other",
}

# Valid category values
VALID_CATEGORIES = {
    "cereal", "snack_bars", "pet_food", "ice_cream", "mexican_food",
    "dough", "meals_soup", "baking", "hot_snacks_frozen", "fruit_snacks",
    "beverages", "other",
}

VALID_SENTIMENTS = {"positive", "negative", "neutral"}


@dataclass
class IntelligenceItemCreate:
    raw_content_id: UUID
    headline: str
    summary: str
    companies: list[str]
    brands: list[str]
    categories: list[str]
    domain: str
    claims: list[str]
    sentiment: str
    strategic_relevance: str
    source_url: Optional[str]
    source_name: Optional[str]
    published_at: Optional[datetime]


EXTRACTION_PROMPT_TEMPLATE = """You are a competitive intelligence analyst for General Mills, a leading global CPG company.

{gm_context}

Analyze the following article and extract structured competitive intelligence. Return a JSON object with EXACTLY these fields:

{{
  "headline": "One-line summary of the intelligence (max 120 characters)",
  "summary": "2-3 sentence summary of the key intelligence",
  "companies": ["Array of company names mentioned, normalized to canonical names"],
  "brands": ["Array of brand names mentioned"],
  "categories": ["Array of General Mills category tags from this list ONLY: cereal, snack_bars, pet_food, ice_cream, mexican_food, dough, meals_soup, baking, hot_snacks_frozen, fruit_snacks, beverages, other"],
  "domain": "One of: new_products, technology_digital, science_trends, earnings_strategy, leadership, other",
  "claims": ["Array of specific factual claims extracted"],
  "sentiment": "One of: positive, negative, neutral (from General Mills' competitive perspective)",
  "strategic_relevance": "Brief explanation of why this matters to General Mills (1-2 sentences), or empty string if not relevant"
}}

Article Title: {title}
Source: {source_name}

Article Content:
{body}

Return ONLY the JSON object. No markdown, no explanation."""


async def extract_intelligence(raw_content, gm_context: str) -> Optional[IntelligenceItemCreate]:
    """
    Extract structured intelligence from a RawContent record using Claude Sonnet.
    Returns None if extraction fails fatally.
    """
    from llm_client import complete, LLMProviderError

    title = raw_content.title or ""
    body = (raw_content.body or "")[:8000]  # Cap to avoid token overflow
    source_name = raw_content.extra_metadata.get("feed_url", raw_content.url or "Unknown source")

    if not body.strip():
        logger.warning("Skipping extraction for empty body: raw_content_id=%s", raw_content.id)
        return None

    prompt = EXTRACTION_PROMPT_TEMPLATE.format(
        gm_context=gm_context,
        title=title,
        source_name=source_name,
        body=body,
    )

    try:
        response = await complete(
            provider="anthropic",
            model="claude-sonnet-4-20250514",
            messages=[{"role": "user", "content": prompt}],
            response_format="json",
            max_tokens=1500,
            temperature=0.0,
            task_type="extraction",
        )

        data = json.loads(response.content)
        return _validate_and_create(data, raw_content)

    except (json.JSONDecodeError, KeyError) as exc:
        logger.warning(
            "Extraction produced invalid JSON for raw_content_id=%s: %s — using fallback",
            raw_content.id, exc,
        )
        return _fallback_item(raw_content)

    except LLMProviderError as exc:
        logger.error(
            "Extraction LLM failed for raw_content_id=%s: %s", raw_content.id, exc
        )
        return _fallback_item(raw_content)

    except Exception as exc:
        logger.error(
            "Unexpected extraction error for raw_content_id=%s: %s", raw_content.id, exc
        )
        return _fallback_item(raw_content)


def _validate_and_create(data: dict, raw_content) -> IntelligenceItemCreate:
    """Validate extracted fields and create IntelligenceItemCreate."""
    headline = str(data.get("headline", ""))[:200] or (raw_content.title or "")[:200] or "Untitled"
    summary = str(data.get("summary", ""))
    companies = [str(c) for c in (data.get("companies") or []) if c]
    brands = [str(b) for b in (data.get("brands") or []) if b]

    categories = [c for c in (data.get("categories") or []) if c in VALID_CATEGORIES]
    if not categories:
        categories = ["other"]

    domain = data.get("domain", "other")
    if domain not in VALID_DOMAINS:
        domain = "other"

    claims = [str(c) for c in (data.get("claims") or []) if c]
    sentiment = data.get("sentiment", "neutral")
    if sentiment not in VALID_SENTIMENTS:
        sentiment = "neutral"

    strategic_relevance = str(data.get("strategic_relevance", ""))

    return IntelligenceItemCreate(
        raw_content_id=raw_content.id,
        headline=headline,
        summary=summary,
        companies=companies,
        brands=brands,
        categories=categories,
        domain=domain,
        claims=claims,
        sentiment=sentiment,
        strategic_relevance=strategic_relevance,
        source_url=raw_content.url,
        source_name=raw_content.extra_metadata.get("feed_url") or raw_content.url,
        published_at=raw_content.published_at,
    )


def _fallback_item(raw_content) -> IntelligenceItemCreate:
    """Create a minimal fallback item when extraction fails."""
    return IntelligenceItemCreate(
        raw_content_id=raw_content.id,
        headline=(raw_content.title or "")[:200] or "Extraction failed",
        summary="Automated extraction failed. Manual review required.",
        companies=[],
        brands=[],
        categories=["other"],
        domain="other",
        claims=[],
        sentiment="neutral",
        strategic_relevance="",
        source_url=raw_content.url,
        source_name=raw_content.url,
        published_at=raw_content.published_at,
    )
