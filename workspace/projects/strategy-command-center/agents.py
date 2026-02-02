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
    """Researches competitive moves using web search."""

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-20250514"):
        self.client = Anthropic(api_key=api_key)
        self.model = model

    def research(self, threat_text: str, competitor_context: str) -> dict:
        """
        Research a competitive threat.

        Returns dict with:
        - search_query: Query used
        - search_results: Raw results
        - intel_report: Synthesized intelligence
        """
        # Build search query from threat text
        competitor_key = identify_competitor(threat_text)
        if competitor_key:
            from competitors import COMPETITORS
            comp_name = COMPETITORS[competitor_key]["name"]
            search_query = f"{comp_name} {threat_text[:100]} news 2024 2025"
        else:
            search_query = f"{threat_text[:150]} news analysis"

        search_results = search_web(search_query)

        prompt = intel_research_prompt(threat_text, competitor_context, search_results)

        response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )

        return {
            "search_query": search_query,
            "search_results": search_results,
            "intel_report": response.content[0].text
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
