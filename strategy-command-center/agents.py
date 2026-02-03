"""
Strategy Command Center Agents

Specialized agents for each stage of the competitive response workflow:
1. ThreatAnalyzer - Understand and structure the threat
2. IntelAgent - Research context and background
3. StrategyAgent - Generate response options
4. SimulationAgent - War game responses with stakeholders
5. ContentAgent - Generate launch materials
"""

from anthropic import Anthropic

try:
    from duckduckgo_search import DDGS
except ImportError:
    DDGS = None

from competitors import (
    get_competitor_context,
    identify_competitor,
    COMPANY,
    STAKEHOLDERS
)
from prompts import (
    threat_analysis_prompt,
    intel_research_prompt,
    response_options_prompt,
    simulation_prompt,
    red_team_prompt,
    scenario_chain_prompt,
    launch_materials_prompt
)


def search_web(query: str, max_results: int = 8) -> str:
    """Search the web using DuckDuckGo."""
    if DDGS is None:
        return "Web search not available - duckduckgo_search not installed"

    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))

        if not results:
            return "No search results found."

        formatted = []
        for i, r in enumerate(results, 1):
            formatted.append(f"""
Result {i}: {r.get('title', 'N/A')}
Source: {r.get('href', 'N/A')}
{r.get('body', 'N/A')}
""")
        return "\n".join(formatted)

    except Exception as e:
        return f"Search error: {str(e)}"


def search_news(query: str, max_results: int = 10) -> str:
    """Search news specifically using DuckDuckGo News."""
    if DDGS is None:
        return "News search not available"

    try:
        with DDGS() as ddgs:
            results = list(ddgs.news(query, max_results=max_results))

        if not results:
            return "No news results found."

        formatted = []
        for i, r in enumerate(results, 1):
            formatted.append(f"""
News {i}: {r.get('title', 'N/A')}
Source: {r.get('source', 'N/A')} | Date: {r.get('date', 'N/A')}
URL: {r.get('url', 'N/A')}
{r.get('body', 'N/A')}
""")
        return "\n".join(formatted)

    except Exception as e:
        return f"News search error: {str(e)}"


def multi_search(queries: list, max_results_per_query: int = 6, search_type: str = "web") -> str:
    """Run multiple search queries and combine results."""
    all_results = []
    seen_urls = set()

    for query in queries:
        try:
            if search_type == "news":
                results_text = search_news(query, max_results_per_query)
            else:
                results_text = search_web(query, max_results_per_query)

            # Add query context
            all_results.append(f"\n--- Query: {query} ---\n{results_text}")
        except Exception as e:
            all_results.append(f"\n--- Query: {query} ---\nError: {str(e)}")

    return "\n".join(all_results)


class ThreatAnalyzer:
    """Analyzes and structures competitive threats."""

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-20250514"):
        self.client = Anthropic(api_key=api_key)
        self.model = model

    def analyze(self, threat_text: str) -> dict:
        """
        Analyze a competitive threat.

        Returns dict with:
        - competitor_key: Identified competitor (if any)
        - competitor_context: Context about the competitor
        - analysis: Structured threat analysis
        """
        # Try to identify the competitor
        competitor_key = identify_competitor(threat_text)
        competitor_context = ""
        if competitor_key:
            competitor_context = get_competitor_context(competitor_key)
        else:
            competitor_context = "Competitor not identified from known set. Analyzing based on provided information."

        prompt = threat_analysis_prompt(threat_text, competitor_context)

        response = self.client.messages.create(
            model=self.model,
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )

        return {
            "competitor_key": competitor_key,
            "competitor_context": competitor_context,
            "analysis": response.content[0].text
        }


class IntelAgent:
    """
    Advanced Competitive Intelligence Agent with comprehensive deep research.

    Uses multi-query strategies, news + web search, specialized source targeting,
    and AI-powered query refinement for thorough research coverage.
    """

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-20250514"):
        self.client = Anthropic(api_key=api_key)
        self.model = model

    def _get_competitor_info(self, threat_text: str) -> dict:
        """Extract competitor name and related info for search queries."""
        competitor_key = identify_competitor(threat_text)
        if competitor_key:
            from competitors import COMPETITORS
            comp = COMPETITORS[competitor_key]
            return {
                "name": comp["name"],
                "ticker": comp.get("ticker", ""),
                "key": competitor_key,
                "aliases": comp.get("aliases", [])
            }
        return {"name": "", "ticker": "", "key": None, "aliases": []}

    def _extract_key_terms(self, threat_text: str) -> dict:
        """Use AI to extract key search terms from the threat."""
        prompt = f"""Extract key search terms from this competitive threat. Return ONLY a JSON object, no other text.

Threat: {threat_text}

Return JSON with these fields:
- competitor_name: The main competitor mentioned
- product_category: The product/service category (e.g., "cereal", "snacks", "beverages")
- specific_product: Any specific product name mentioned
- key_features: List of 2-3 key features/attributes mentioned (e.g., "high protein", "organic")
- price_point: Any pricing mentioned
- target_market: Target customer segment if mentioned
- time_frame: Any timing/dates mentioned

JSON only:"""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )
            import json
            # Try to parse the JSON from the response
            text = response.content[0].text.strip()
            # Handle potential markdown code blocks
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
        except:
            # Fallback to basic extraction
            return {
                "competitor_name": "",
                "product_category": "",
                "specific_product": "",
                "key_features": [],
                "price_point": "",
                "target_market": "",
                "time_frame": ""
            }

    def _run_comprehensive_research(self, threat_text: str, comp_info: dict, key_terms: dict) -> dict:
        """
        Run comprehensive multi-query research across all categories.

        Uses multiple query variations per category for better coverage.
        """
        comp_name = comp_info["name"] or key_terms.get("competitor_name", "competitor")
        ticker = comp_info.get("ticker", "")
        product = key_terms.get("product_category", "")
        specific = key_terms.get("specific_product", "")
        features = " ".join(key_terms.get("key_features", []))

        searches = {}

        # =================================================================
        # 1. PUBLIC ANNOUNCEMENTS & NEWS (Multi-source)
        # =================================================================
        announcement_queries = [
            f'"{comp_name}" announcement {specific or product} 2024 2025',
            f'"{comp_name}" press release new product launch',
            f'"{comp_name}" {product} news latest',
        ]

        news_results = multi_search(announcement_queries, max_results_per_query=5, search_type="news")
        web_results = multi_search([f'"{comp_name}" official announcement {product}'], max_results_per_query=5, search_type="web")

        searches["announcements"] = {
            "queries": announcement_queries,
            "results": f"=== NEWS SOURCES ===\n{news_results}\n\n=== WEB SOURCES ===\n{web_results}"
        }

        # =================================================================
        # 2. PATENTS & INNOVATION (USPTO, Google Patents, news)
        # =================================================================
        patent_queries = [
            f'"{comp_name}" patent {product} site:patents.google.com',
            f'"{comp_name}" patent filing {features}',
            f'"{comp_name}" R&D innovation {product} technology',
            f'"{comp_name}" patent application food beverage',
        ]

        searches["patents"] = {
            "queries": patent_queries,
            "results": multi_search(patent_queries, max_results_per_query=4, search_type="web")
        }

        # =================================================================
        # 3. M&A ACTIVITIES & STRATEGIC PARTNERSHIPS
        # =================================================================
        ma_queries = [
            f'"{comp_name}" acquisition 2024 2025',
            f'"{comp_name}" merger deal partnership',
            f'"{comp_name}" acquires buys investment',
            f'"{comp_name}" joint venture strategic alliance {product}',
        ]

        ma_news = multi_search(ma_queries[:2], max_results_per_query=5, search_type="news")
        ma_web = multi_search(ma_queries[2:], max_results_per_query=4, search_type="web")

        searches["mergers_acquisitions"] = {
            "queries": ma_queries,
            "results": f"=== M&A NEWS ===\n{ma_news}\n\n=== M&A WEB ===\n{ma_web}"
        }

        # =================================================================
        # 4. SEC FILINGS & FINANCIAL REPORTS
        # =================================================================
        sec_queries = [
            f'"{comp_name}" 10-K filing site:sec.gov',
            f'"{comp_name}" {ticker} earnings report quarterly',
            f'"{comp_name}" annual report investor presentation 2024',
            f'"{comp_name}" {ticker} analyst report outlook',
            f'"{comp_name}" investor day strategy presentation',
        ]

        searches["sec_filings"] = {
            "queries": sec_queries,
            "results": multi_search(sec_queries, max_results_per_query=4, search_type="web")
        }

        # =================================================================
        # 5. INDUSTRY TRENDS & MARKET DYNAMICS
        # =================================================================
        industry_queries = [
            f'{product} industry trends 2024 2025 market analysis',
            f'{product} market size growth forecast',
            f'{product} {features} consumer trends',
            f'{product} category innovation disruption',
            f'{product} industry report Nielsen IRI',
        ]

        industry_news = multi_search(industry_queries[:2], max_results_per_query=5, search_type="news")
        industry_web = multi_search(industry_queries[2:], max_results_per_query=4, search_type="web")

        searches["industry_trends"] = {
            "queries": industry_queries,
            "results": f"=== INDUSTRY NEWS ===\n{industry_news}\n\n=== INDUSTRY ANALYSIS ===\n{industry_web}"
        }

        # =================================================================
        # 6. CONSUMER SENTIMENT & SOCIAL MEDIA
        # =================================================================
        sentiment_queries = [
            f'"{comp_name}" {product} reviews consumer reaction',
            f'"{comp_name}" {specific or product} reddit',
            f'"{comp_name}" {product} twitter social media reaction',
            f'"{comp_name}" customer reviews complaints',
            f'{product} {features} consumer preference survey',
        ]

        searches["consumer_sentiment"] = {
            "queries": sentiment_queries,
            "results": multi_search(sentiment_queries, max_results_per_query=4, search_type="web")
        }

        # =================================================================
        # 7. COMPETITIVE RESPONSE HISTORY (How they've responded before)
        # =================================================================
        history_queries = [
            f'"{comp_name}" competitive response strategy',
            f'"{comp_name}" vs General Mills {product}',
            f'"{comp_name}" market share battle {product}',
            f'"{comp_name}" pricing strategy {product}',
        ]

        searches["competitive_history"] = {
            "queries": history_queries,
            "results": multi_search(history_queries, max_results_per_query=4, search_type="web")
        }

        # =================================================================
        # 8. EXECUTIVE COMMENTARY & LEADERSHIP
        # =================================================================
        exec_queries = [
            f'"{comp_name}" CEO interview strategy 2024 2025',
            f'"{comp_name}" executive comments {product}',
            f'"{comp_name}" earnings call transcript',
            f'"{comp_name}" leadership strategy vision',
        ]

        searches["executive_commentary"] = {
            "queries": exec_queries,
            "results": multi_search(exec_queries, max_results_per_query=4, search_type="news")
        }

        return searches

    def research(self, threat_text: str, competitor_context: str, progress_callback=None) -> dict:
        """
        Perform comprehensive deep research on a competitive threat.

        Uses AI-powered query extraction, multi-source searching, and
        comprehensive synthesis for thorough intelligence gathering.
        """
        from prompts import deep_research_prompt

        # Step 1: Get competitor info
        if progress_callback:
            progress_callback("Identifying competitor...")
        comp_info = self._get_competitor_info(threat_text)

        # Step 2: AI-powered key term extraction
        if progress_callback:
            progress_callback("Analyzing threat and extracting key terms...")
        key_terms = self._extract_key_terms(threat_text)

        # Step 3: Run comprehensive multi-query research
        if progress_callback:
            progress_callback("Searching public announcements & news...")

        deep_searches = self._run_comprehensive_research(threat_text, comp_info, key_terms)

        # Category labels for display
        category_labels = {
            "announcements": "📰 PUBLIC ANNOUNCEMENTS & PRESS RELEASES",
            "patents": "💡 PATENTS & INNOVATION",
            "mergers_acquisitions": "🤝 M&A ACTIVITIES & STRATEGIC PARTNERSHIPS",
            "sec_filings": "📊 SEC FILINGS & FINANCIAL REPORTS",
            "industry_trends": "📈 INDUSTRY TRENDS & MARKET DYNAMICS",
            "consumer_sentiment": "💬 CONSUMER SENTIMENT & SOCIAL MEDIA",
            "competitive_history": "⚔️ COMPETITIVE RESPONSE HISTORY",
            "executive_commentary": "🎤 EXECUTIVE COMMENTARY & LEADERSHIP"
        }

        # Compile search queries for transparency
        search_queries = {}
        for category, data in deep_searches.items():
            search_queries[category] = data.get("queries", [])

        # Step 4: Generate comprehensive intel report
        if progress_callback:
            progress_callback("Synthesizing comprehensive intelligence report...")

        prompt = deep_research_prompt(threat_text, competitor_context, deep_searches, category_labels)

        response = self.client.messages.create(
            model=self.model,
            max_tokens=6000,  # Increased for comprehensive report
            messages=[{"role": "user", "content": prompt}]
        )

        return {
            "search_queries": search_queries,
            "search_results": deep_searches,
            "intel_report": response.content[0].text,
            "category_labels": category_labels,
            "key_terms_extracted": key_terms
        }


class StrategyAgent:
    """Generates strategic response options."""

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-20250514"):
        self.client = Anthropic(api_key=api_key)
        self.model = model

    def generate_options(self, threat_analysis: str, intel_report: str) -> str:
        """Generate 4 strategic response options."""
        company_context = f"""
Company: {COMPANY['name']}
Key Brands: {', '.join(COMPANY['key_brands'])}
Categories: {', '.join(COMPANY['key_categories'])}
Strategic Priorities: {', '.join(COMPANY['strategic_priorities'])}
"""

        prompt = response_options_prompt(threat_analysis, intel_report, company_context)

        response = self.client.messages.create(
            model=self.model,
            max_tokens=2500,
            messages=[{"role": "user", "content": prompt}]
        )

        return response.content[0].text


class SimulationAgent:
    """Simulates stakeholder reactions and scenarios."""

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-20250514"):
        self.client = Anthropic(api_key=api_key)
        self.model = model

    def simulate_stakeholder(self, response_option: str, threat_context: str, stakeholder_key: str) -> str:
        """Simulate a single stakeholder's reaction."""
        stakeholder = STAKEHOLDERS.get(stakeholder_key)
        if not stakeholder:
            return f"Unknown stakeholder: {stakeholder_key}"

        prompt = simulation_prompt(response_option, threat_context, stakeholder)

        response = self.client.messages.create(
            model=self.model,
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )

        return response.content[0].text

    def simulate_all_stakeholders(self, response_option: str, threat_context: str) -> dict:
        """Simulate all stakeholders' reactions."""
        results = {}
        for key in STAKEHOLDERS:
            results[key] = self.simulate_stakeholder(response_option, threat_context, key)
        return results

    def red_team(self, response_option: str, threat_context: str) -> str:
        """Run red team analysis."""
        prompt = red_team_prompt(response_option, threat_context)

        response = self.client.messages.create(
            model=self.model,
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )

        return response.content[0].text

    def scenario_chains(self, response_option: str, threat_context: str, competitor_context: str) -> str:
        """Generate scenario chains."""
        prompt = scenario_chain_prompt(response_option, threat_context, competitor_context)

        response = self.client.messages.create(
            model=self.model,
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )

        return response.content[0].text


class ContentAgent:
    """Generates launch-ready materials."""

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-20250514"):
        self.client = Anthropic(api_key=api_key)
        self.model = model

    def generate_materials(self, chosen_response: str, threat_context: str, simulation_results: str) -> str:
        """Generate all launch materials."""
        prompt = launch_materials_prompt(chosen_response, threat_context, simulation_results)

        response = self.client.messages.create(
            model=self.model,
            max_tokens=3000,
            messages=[{"role": "user", "content": prompt}]
        )

        return response.content[0].text
