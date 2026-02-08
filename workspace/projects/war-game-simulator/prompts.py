"""
AI Prompt Templates for War Game Simulator

These prompts instruct Claude to perform different types of strategic analysis.
Each prompt is designed to produce actionable, executive-level insights.
"""


def scenario_prompt(situation: str, strategy: str) -> str:
    """
    Generate competitive scenario chains (move/counter-move analysis).

    Returns a prompt that asks Claude to think through likely competitive
    responses and second-order effects.
    """
    return f"""You are a competitive strategy advisor helping an executive think through
competitive dynamics. Your task is to generate realistic scenario chains.

## Situation
{situation}

## Proposed Strategy/Response
{strategy}

## Your Task
Generate 3-5 realistic "if-then" scenario chains that explore how this situation
might unfold. For each scenario:

1. **Scenario Name**: Give it a descriptive name
2. **Your Move**: Restate the proposed action
3. **Competitor Response**: How will competitors most likely react?
4. **Market Effect**: What happens in the market as a result?
5. **Second-Order Effects**: What happens next (customers, employees, investors)?
6. **Risk Level**: Rate as Low/Medium/High with brief explanation
7. **Opportunity Level**: Rate as Low/Medium/High with brief explanation

Consider a range of scenarios from optimistic to pessimistic. Be specific and
realistic—executives need actionable insights, not generic possibilities.

Format each scenario clearly with headers. After all scenarios, provide a
brief "Key Insight" summarizing the most important thing to consider."""


def stakeholder_prompt(situation: str, strategy: str, persona: dict) -> str:
    """
    Simulate how a specific stakeholder would react to the strategy.

    Uses persona details to generate realistic executive feedback.
    """
    cares_about = "\n".join(f"- {item}" for item in persona["cares_about"])
    evaluates_by = "\n".join(f"- {item}" for item in persona["evaluates_by"])
    typical_objections = "\n".join(f"- {item}" for item in persona["typical_objections"])

    return f"""You are simulating the perspective of a {persona["name"]} reviewing
a competitive strategy proposal. Stay in character throughout.

## About This Executive
**Role**: {persona["title"]}
**Primary Focus**: {persona["focus"]}

**This executive cares about**:
{cares_about}

**They evaluate proposals by asking**:
{evaluates_by}

**Their typical objections include**:
{typical_objections}

## Situation Being Discussed
{situation}

## Proposed Strategy
{strategy}

## Your Task (as the {persona["title"]})
Respond as this executive would in a strategy meeting. Include:

1. **Initial Reaction** (1-2 sentences): Your gut response
2. **What I Like**: 1-2 things that resonate with your priorities
3. **My Concerns**: 2-3 specific concerns from your perspective
4. **Questions I'd Ask**: 3-4 questions you'd want answered before supporting this
5. **What Would Win Me Over**: What would make you a strong advocate?

Be authentic to this executive's worldview. Use "I" statements. Be constructive
but don't softball—real executives push back on ideas."""


def redteam_prompt(situation: str, strategy: str) -> str:
    """
    Red team analysis - argue against the strategy to find weaknesses.

    This prompt asks Claude to be a constructive critic, finding blind spots
    and stress-testing assumptions.
    """
    return f"""You are a red team advisor—your job is to stress-test strategies by
finding weaknesses, blind spots, and risks that the team may have missed.
You are NOT being negative; you are being helpful by surfacing problems
BEFORE they become costly mistakes.

## Situation
{situation}

## Proposed Strategy
{strategy}

## Your Task
Conduct a thorough red team analysis:

### 1. Hidden Assumptions
What assumptions is this strategy making that might be wrong? List 3-5
assumptions and explain why each might not hold.

### 2. Blind Spots
What is this strategy NOT considering? What's missing from the analysis?
Identify 2-3 blind spots.

### 3. Worst-Case Scenario
Paint a realistic (not catastrophic) picture of how this could go wrong.
What's the failure mode?

### 4. Competitor Counter-Moves
If you were the competitor, how would you exploit this strategy? What's
the most damaging response they could make?

### 5. Execution Risks
What could go wrong in actually implementing this? Consider people,
process, timing, and resources.

### 6. The Strongest Counter-Argument
In 2-3 sentences, make the best possible case AGAINST this strategy.

### 7. How to Strengthen It
End constructively: What 2-3 changes would address the biggest weaknesses?

Be specific and actionable. Vague criticism isn't helpful—point to specific
issues with specific suggestions."""


def combined_analysis_prompt(situation: str, strategy: str) -> str:
    """
    A combined prompt if user wants all analyses in one call (optional).
    """
    return f"""You are a strategic advisor helping an executive pressure-test
a competitive response. Provide a comprehensive analysis.

## Situation
{situation}

## Proposed Strategy
{strategy}

## Provide Three Analyses:

### PART 1: SCENARIO MODELING
Generate 3 realistic scenario chains showing move/counter-move dynamics.
For each: name, competitor response, market effect, risk/opportunity rating.

### PART 2: STAKEHOLDER REACTIONS
Briefly simulate how these executives would react:
- CFO: Focus on margins, ROI, financial risk
- CEO: Focus on strategy, competitive position, board perception
- VP Sales: Focus on revenue, customers, field execution
- CMO: Focus on brand, messaging, market perception

### PART 3: RED TEAM CRITIQUE
- 3 hidden assumptions that might be wrong
- 2 blind spots in the analysis
- The strongest argument against this strategy
- 2 ways to strengthen the approach

Be specific, actionable, and executive-level in your analysis."""
