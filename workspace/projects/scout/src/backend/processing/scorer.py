"""
Gemini Flash relevance scoring pipeline.
Returns an integer 0-100 representing relevance to General Mills' CIO.
"""

import json
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

SCORING_PROMPT_TEMPLATE = """You are scoring the competitive intelligence relevance for General Mills' Chief Innovation Officer.

{gm_context}

Score the following intelligence item on a scale of 0-100:

90-100: Direct competitive threat or opportunity in a core General Mills category. Requires immediate CIO awareness.
70-89: Significant competitive activity or trend affecting General Mills' strategic positioning.
50-69: Relevant industry development worth tracking. Not urgent but contributes to situational awareness.
30-49: Tangentially related. May be useful context but not directly actionable.
0-29: Not relevant to General Mills' competitive position. Archive only.

Intelligence Item:
Headline: {headline}
Summary: {summary}
Companies mentioned: {companies}
Categories: {categories}
Domain: {domain}
Strategic relevance: {strategic_relevance}

Return ONLY a JSON object: {{"score": <integer 0-100>}}"""


async def score_item(item_data: dict, gm_context: str) -> int:
    """
    Score an intelligence item using Gemini 2.0 Flash.
    Returns an integer 0-100. Defaults to 0 on failure.
    """
    from llm_client import complete, LLMProviderError

    prompt = SCORING_PROMPT_TEMPLATE.format(
        gm_context=gm_context,
        headline=item_data.get("headline", ""),
        summary=item_data.get("summary", ""),
        companies=", ".join(item_data.get("companies", [])),
        categories=", ".join(item_data.get("categories", [])),
        domain=item_data.get("domain", ""),
        strategic_relevance=item_data.get("strategic_relevance", ""),
    )

    try:
        response = await complete(
            provider="google",
            model="gemini-2.0-flash",
            messages=[{"role": "user", "content": prompt}],
            response_format="json",
            max_tokens=100,
            temperature=0.0,
            task_type="scoring",
        )

        data = json.loads(response.content)
        score = int(data.get("score", 0))
        score = max(0, min(100, score))  # Clamp to [0, 100]
        return score

    except (json.JSONDecodeError, KeyError, ValueError, TypeError) as exc:
        logger.warning("Scoring produced invalid JSON: %s — attempting text parse", exc)
        # Try to extract a number from the raw response
        return _parse_score_from_text(response.content if "response" in dir() else "")

    except LLMProviderError as exc:
        logger.error("Scoring LLM failed: %s", exc)
        return 0

    except Exception as exc:
        logger.error("Unexpected scoring error: %s", exc)
        return 0


def _parse_score_from_text(text: str) -> int:
    """Last-resort: extract an integer from a text response."""
    matches = re.findall(r"\b(\d{1,3})\b", text)
    for match in matches:
        val = int(match)
        if 0 <= val <= 100:
            return val
    return 0
