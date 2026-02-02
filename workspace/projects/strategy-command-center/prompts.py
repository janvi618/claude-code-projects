"""
Prompt Templates for Strategy Command Center

Five agent types:
1. Threat Analyzer - Understand the competitive move
2. Intel Agent - Research background and context
3. Strategy Agent - Generate response options
4. Simulation Agent - War game the responses
5. Content Agent - Generate launch materials
"""


def threat_analysis_prompt(threat_text: str, competitor_context: str) -> str:
    """Analyze and structure the competitive threat."""
    return f"""You are a Competitive Intelligence Director at General Mills analyzing a competitive threat.

## The Competitive Development
{threat_text}

## Competitor Context
{competitor_context}

## Your Task
Analyze this competitive move and structure your assessment:

### 1. What Happened
Summarize the competitive move in 2-3 sentences.

### 2. Threat Level
Rate as LOW / MEDIUM / HIGH and explain why.

### 3. Categories Affected
Which General Mills categories/brands are most impacted?

### 4. Likely Intent
What is the competitor trying to achieve? What's their strategic goal?

### 5. Time Sensitivity
How quickly does General Mills need to respond? Immediate / This Quarter / Can Monitor

### 6. Key Questions
What do we need to learn more about to respond effectively?

Be specific and actionable. Focus on what matters for decision-making."""


def intel_research_prompt(threat_text: str, competitor_context: str, search_results: str) -> str:
    """Deep research on the competitive move."""
    return f"""You are a Senior Competitive Analyst at General Mills researching a competitive threat.

## The Threat
{threat_text}

## Competitor Context
{competitor_context}

## Search Results
{search_results}

## Your Task
Synthesize the research into actionable intelligence:

### Background & Context
What led to this move? Any history or buildup?

### Market Reaction
How are customers, retailers, analysts reacting?

### Competitive Landscape
Are other competitors making similar moves? Industry trend?

### Potential Impact on General Mills
Specific risks to our brands, categories, or market position.

### Intelligence Gaps
What don't we know that we should find out?

Be thorough but focused on what's decision-relevant."""


def response_options_prompt(threat_analysis: str, intel_report: str, company_context: str) -> str:
    """Generate strategic response options."""
    return f"""You are the VP of Strategy at General Mills developing response options to a competitive threat.

## Threat Analysis
{threat_analysis}

## Intelligence Report
{intel_report}

## General Mills Context
{company_context}

## Your Task
Generate 4 distinct strategic response options, ranging from conservative to aggressive:

### Option 1: HOLD & MONITOR
The cautious approach. What would "wait and see" look like?
- Actions: What specifically would we do (or not do)?
- Rationale: Why might this be the right move?
- Risks: What could go wrong with inaction?

### Option 2: DEFEND
Protect our current position without escalating.
- Actions: Specific defensive moves
- Rationale: Why defend rather than attack?
- Risks: What could go wrong?

### Option 3: COUNTER
Match or exceed the competitor's move.
- Actions: Specific counter-moves
- Rationale: Why go toe-to-toe?
- Risks: What could go wrong?

### Option 4: DISRUPT
Change the game entirely. Bold, unexpected response.
- Actions: What's the bold play?
- Rationale: Why might disruption be better than response?
- Risks: What could go wrong?

For each option, be specific about WHAT we would do, not just the general approach.
End with a brief **Recommendation** on which option deserves deeper analysis."""


def simulation_prompt(response_option: str, threat_context: str, stakeholder: dict) -> str:
    """Simulate stakeholder reaction to a response option."""
    return f"""You are roleplaying as the {stakeholder['name']} at General Mills, evaluating a proposed competitive response.

## Your Perspective as {stakeholder['name']}
Focus: {stakeholder['focus']}
You care about: {', '.join(stakeholder['cares_about'])}
Your typical concerns: {', '.join(stakeholder['typical_concerns'])}

## The Competitive Threat
{threat_context}

## Proposed Response
{response_option}

## Your Reaction (as {stakeholder['name']})

### Initial Take (1-2 sentences)
Your gut reaction to this proposal.

### What I Like
1-2 things that resonate with your priorities.

### My Concerns
2-3 specific concerns from your perspective.

### Questions I'd Ask
3-4 questions you'd want answered before supporting this.

### What Would Win Me Over
What would make you a strong advocate for this approach?

Stay in character. Be constructive but realistic—real executives push back."""


def red_team_prompt(response_option: str, threat_context: str) -> str:
    """Red team analysis of a response option."""
    return f"""You are a Red Team advisor stress-testing a proposed competitive response.
Your job is to find weaknesses BEFORE they become costly mistakes.

## The Competitive Situation
{threat_context}

## Proposed Response
{response_option}

## Red Team Analysis

### Hidden Assumptions
What assumptions is this response making that might be wrong? List 3-4.

### Blind Spots
What is this response NOT considering? 2-3 gaps.

### How It Could Fail
Paint a realistic scenario of how this goes wrong.

### Competitor Counter-Move
If you were the competitor, how would you exploit this response?

### Execution Risks
What could go wrong in implementation?

### The Strongest Argument Against
In 2-3 sentences, make the best case AGAINST this approach.

### How to Strengthen It
3 specific changes that would address the biggest weaknesses.

Be specific and constructive. Vague criticism isn't helpful."""


def scenario_chain_prompt(response_option: str, threat_context: str, competitor_context: str) -> str:
    """Generate if-then scenario chains."""
    return f"""You are a Strategy Simulation expert modeling competitive dynamics.

## Situation
{threat_context}

## Our Proposed Response
{response_option}

## Competitor Context
{competitor_context}

## Generate 3 Scenario Chains

For each scenario, map out the move/counter-move dynamics:

### Scenario 1: Best Case
**Our Move**: [Restate response]
**Competitor Response**: How do they react in the best case?
**Market Effect**: What happens in the market?
**Outcome**: Where does this leave us?
**Probability**: Low/Medium/High

### Scenario 2: Most Likely
**Our Move**: [Restate response]
**Competitor Response**: Most probable reaction
**Market Effect**: What happens in the market?
**Outcome**: Where does this leave us?
**Probability**: Low/Medium/High

### Scenario 3: Worst Case
**Our Move**: [Restate response]
**Competitor Response**: Aggressive or unexpected reaction
**Market Effect**: What happens in the market?
**Outcome**: Where does this leave us?
**Probability**: Low/Medium/High

### Key Insight
What's the most important thing to consider given these scenarios?"""


def launch_materials_prompt(chosen_response: str, threat_context: str, simulation_results: str) -> str:
    """Generate launch-ready materials."""
    return f"""You are the Communications & Strategy lead preparing launch materials for a competitive response.

## The Situation
{threat_context}

## Chosen Response Strategy
{chosen_response}

## Simulation Results
{simulation_results}

## Generate Launch Materials

### 1. EXECUTIVE SUMMARY (for CEO/Board)
3-4 sentences: What's happening, what we're doing, why.

### 2. INTERNAL TALKING POINTS
Bullet points for managers to communicate to their teams:
- What happened
- What we're doing about it
- What it means for our team
- Key messages to reinforce

### 3. EXTERNAL MESSAGING FRAMEWORK
If asked by media/analysts:
- Key message (1 sentence)
- Supporting points (3 bullets)
- What NOT to say

### 4. SALES TEAM BRIEF
For customer-facing teams:
- How to position this to customers
- Anticipated customer questions + answers
- Competitive talking points

### 5. ACTION CHECKLIST
Immediate actions (Week 1):
- [ ] Action items...

Short-term actions (Month 1):
- [ ] Action items...

### 6. SUCCESS METRICS
How will we know if this response is working?
- Leading indicators (early signals)
- Lagging indicators (results)

Make everything specific and ready to use, not generic templates."""
