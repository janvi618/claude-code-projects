"""
Intelligence Agents

Product Analyst and News Analyst that:
1. Search the web for relevant information
2. Analyze and synthesize findings using Claude
"""

from duckduckgo_search import DDGS
from anthropic import Anthropic

from competitors import get_competitor_context, get_all_competitors_context
from prompts import (
    product_analyst_prompt,
    news_analyst_prompt,
    synthesis_prompt,
    custom_query_prompt
)


def search_web(query: str, max_results: int = 10) -> str:
    """
    Search the web using DuckDuckGo and return formatted results.

    Args:
        query: Search query string
        max_results: Maximum number of results to return

    Returns:
        Formatted string of search results
    """
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))

        if not results:
            return "No search results found."

        formatted = []
        for i, r in enumerate(results, 1):
            formatted.append(f"""
Result {i}:
Title: {r.get('title', 'N/A')}
Source: {r.get('href', 'N/A')}
Snippet: {r.get('body', 'N/A')}
""")

        return "\n".join(formatted)

    except Exception as e:
        return f"Search error: {str(e)}"


def build_search_query(competitor_name: str, agent_type: str, user_query: str = None) -> str:
    """
    Build an effective search query based on agent type and user input.
    """
    base_queries = {
        "product": f"{competitor_name} new product launch 2024 2025",
        "news": f"{competitor_name} news earnings strategy 2024 2025"
    }

    if user_query:
        # Incorporate user's specific question
        return f"{competitor_name} {user_query}"

    return base_queries.get(agent_type, f"{competitor_name} news")


class ProductAnalyst:
    """
    Agent specialized in tracking competitor product moves.
    """

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-20250514"):
        self.client = Anthropic(api_key=api_key)
        self.model = model
        self.agent_type = "product"

    def analyze(self, competitor_key: str, query: str = None) -> dict:
        """
        Run product analysis for a competitor.

        Args:
            competitor_key: Key from competitors dict (e.g., 'kelloggs')
            query: Optional specific query from user

        Returns:
            Dict with search_query, search_results, and analysis
        """
        from competitors import COMPETITORS
        competitor = COMPETITORS.get(competitor_key)
        if not competitor:
            return {"error": f"Unknown competitor: {competitor_key}"}

        competitor_context = get_competitor_context(competitor_key)
        competitor_name = competitor["name"]

        # Build and run search
        if query:
            search_query = f"{competitor_name} {query} product"
        else:
            search_query = f"{competitor_name} new product launch innovation 2024 2025"

        search_results = search_web(search_query)

        # Build prompt
        if query:
            prompt = custom_query_prompt(competitor_context, search_results, query, "product")
        else:
            default_query = f"What are the latest product developments from {competitor_name}?"
            prompt = product_analyst_prompt(competitor_context, search_results, default_query)

        # Get analysis from Claude
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )

        return {
            "competitor": competitor_name,
            "search_query": search_query,
            "search_results": search_results,
            "analysis": response.content[0].text
        }


class NewsAnalyst:
    """
    Agent specialized in tracking competitor strategic news.
    """

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-20250514"):
        self.client = Anthropic(api_key=api_key)
        self.model = model
        self.agent_type = "news"

    def analyze(self, competitor_key: str, query: str = None) -> dict:
        """
        Run news/strategic analysis for a competitor.

        Args:
            competitor_key: Key from competitors dict (e.g., 'kelloggs')
            query: Optional specific query from user

        Returns:
            Dict with search_query, search_results, and analysis
        """
        from competitors import COMPETITORS
        competitor = COMPETITORS.get(competitor_key)
        if not competitor:
            return {"error": f"Unknown competitor: {competitor_key}"}

        competitor_context = get_competitor_context(competitor_key)
        competitor_name = competitor["name"]

        # Build and run search
        if query:
            search_query = f"{competitor_name} {query}"
        else:
            search_query = f"{competitor_name} news earnings strategy partnership 2024 2025"

        search_results = search_web(search_query)

        # Build prompt
        if query:
            prompt = custom_query_prompt(competitor_context, search_results, query, "news")
        else:
            default_query = f"What are the latest strategic developments from {competitor_name}?"
            prompt = news_analyst_prompt(competitor_context, search_results, default_query)

        # Get analysis from Claude
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )

        return {
            "competitor": competitor_name,
            "search_query": search_query,
            "search_results": search_results,
            "analysis": response.content[0].text
        }


class IntelligenceSynthesizer:
    """
    Combines product and news intelligence into executive brief.
    """

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-20250514"):
        self.client = Anthropic(api_key=api_key)
        self.model = model

    def synthesize(self, competitor_name: str, product_intel: str, news_intel: str) -> str:
        """
        Combine product and news analysis into executive brief.
        """
        prompt = synthesis_prompt(product_intel, news_intel, competitor_name)

        response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )

        return response.content[0].text
