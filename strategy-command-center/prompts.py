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
    """Basic research on the competitive move (legacy - use deep_research_prompt for comprehensive analysis)."""
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


def deep_research_prompt(threat_text: str, competitor_context: str, deep_searches: dict, category_labels: dict) -> str:
    """Comprehensive deep research synthesis prompt with 8 research dimensions."""

    # Build research sections from all search results
    research_sections = ""
    for category, data in deep_searches.items():
        label = category_labels.get(category, category.upper())
        queries = data.get('queries', [data.get('query', 'N/A')])
        if isinstance(queries, list):
            queries_str = "\n".join([f"  - {q}" for q in queries])
        else:
            queries_str = f"  - {queries}"

        research_sections += f"""
================================================================================
### {label}
================================================================================
**Search Queries Used**:
{queries_str}

**Research Findings**:
{data.get('results', 'No results')}

"""

    return f"""You are a Senior Competitive Intelligence Director at General Mills. You have just received comprehensive research from your intelligence team on a competitive threat. Your job is to synthesize this into an executive-ready intelligence briefing.

================================================================================
## THE COMPETITIVE THREAT
================================================================================
{threat_text}

================================================================================
## KNOWN COMPETITOR CONTEXT
================================================================================
{competitor_context}

================================================================================
## COMPREHENSIVE RESEARCH FINDINGS (8 Dimensions)
================================================================================
{research_sections}

================================================================================
## YOUR TASK: Create a Board-Ready Intelligence Briefing
================================================================================

IMPORTANT INSTRUCTIONS:
1. Synthesize ONLY what is supported by the research above - do not invent information
2. If research for a category yielded no useful results, say "Limited data available" and note what we should investigate
3. Cite specific sources when making claims (e.g., "According to [source]...")
4. Be direct about confidence levels - distinguish between confirmed facts, likely inferences, and speculation
5. Focus on ACTIONABLE intelligence - what should General Mills DO with this information?

---

# 🎯 EXECUTIVE SUMMARY

[3-4 sentences: What happened, why it matters, what we should do. This should be the "if you read nothing else, read this" section.]

**Threat Level**: [CRITICAL / HIGH / MEDIUM / LOW]
**Time Sensitivity**: [Immediate Action / This Quarter / Monitor]
**Confidence Level**: [High / Medium / Low - based on research quality]

---

# 📋 DETAILED INTELLIGENCE BY DIMENSION

## 1. 📰 PUBLIC ANNOUNCEMENTS & OFFICIAL COMMUNICATIONS

**What the competitor is saying officially:**
- [Key announcements, press releases, official statements]

**What they're emphasizing:**
- [Messages they want the market to hear]

**What they're NOT saying (notable omissions):**
- [Gaps in their communication that may be strategic]

**Timeline of communications:**
- [When did they announce what? Any patterns?]

---

## 2. 💡 PATENTS, R&D & INNOVATION

**Relevant IP activity:**
- [Patent filings, applications, grants]

**R&D signals:**
- [Research investments, lab expansions, talent hiring]

**Technology/formulation innovations:**
- [What capabilities are they building?]

**IP strategy implications:**
- [Are they building moats? Blocking competitors?]

---

## 3. 🤝 M&A, INVESTMENTS & STRATEGIC PARTNERSHIPS

**Recent deals:**
- [Acquisitions, divestitures, investments]

**Strategic partnerships:**
- [JVs, alliances, supplier relationships]

**Investment patterns:**
- [Where are they putting capital?]

**Connection to this threat:**
- [How does M&A activity relate to this competitive move?]

---

## 4. 📊 FINANCIAL SIGNALS & SEC FILINGS

**Revenue/performance in relevant categories:**
- [Growth trends, market share data]

**Capital allocation:**
- [Where are they investing? CapEx plans?]

**Management commentary:**
- [What has leadership said on earnings calls?]

**Risk factors disclosed:**
- [What are they worried about?]

**Guidance implications:**
- [What are they projecting?]

---

## 5. 📈 INDUSTRY TRENDS & MARKET DYNAMICS

**Macro trends affecting this category:**
- [Consumer behavior shifts, demographic changes]

**Regulatory/policy developments:**
- [New regulations, trade issues, etc.]

**Technology disruptions:**
- [New technologies changing the game]

**Channel evolution:**
- [Retail changes, e-commerce, DTC trends]

**Competitive intensity:**
- [Is this an industry-wide move or company-specific?]

---

## 6. 💬 CONSUMER SENTIMENT & SOCIAL INTELLIGENCE

**Consumer reaction to competitor's move:**
- [Early buzz, reception, sentiment]

**Brand perception trends:**
- [How is the competitor's brand viewed?]

**Unmet needs in this space:**
- [What are consumers asking for that no one provides?]

**Social media signals:**
- [Trending discussions, influencer takes]

**Review/rating patterns:**
- [Product feedback, complaints, praise]

---

## 7. ⚔️ COMPETITIVE RESPONSE HISTORY

**How this competitor has responded to threats before:**
- [Past behavior patterns]

**Their typical playbook:**
- [Price wars? Innovation? Marketing blitzes?]

**Head-to-head history with General Mills:**
- [Past battles, outcomes, learnings]

**Pricing behavior:**
- [Aggressive? Disciplined? Promotional?]

---

## 8. 🎤 EXECUTIVE COMMENTARY & STRATEGIC SIGNALS

**CEO/leadership statements:**
- [Vision, strategy, priorities]

**Earnings call themes:**
- [What are they telling investors?]

**Strategic priorities articulated:**
- [Where are they focusing?]

**Culture/organizational signals:**
- [Hiring, restructuring, leadership changes]

---

# 🔮 STRATEGIC SYNTHESIS

## Threat Assessment Matrix

| Dimension | Finding | Confidence | Implication for GM |
|-----------|---------|------------|-------------------|
| Market Impact | [High/Med/Low] | [High/Med/Low] | [Brief implication] |
| Brand Risk | [High/Med/Low] | [High/Med/Low] | [Brief implication] |
| Financial Risk | [High/Med/Low] | [High/Med/Low] | [Brief implication] |
| Speed of Impact | [Fast/Medium/Slow] | [High/Med/Low] | [Brief implication] |

## Key Patterns Across All Research

[What themes emerge when you look across all 8 dimensions? What's the bigger picture?]

## Critical Intelligence Gaps

[What don't we know that we NEED to know? What would change your assessment if we found it?]

1. [Gap 1 + suggested way to fill it]
2. [Gap 2 + suggested way to fill it]
3. [Gap 3 + suggested way to fill it]

## Recommended Immediate Actions

Based on this intelligence, General Mills should:

1. **[Action 1]**: [What to do + why + urgency]
2. **[Action 2]**: [What to do + why + urgency]
3. **[Action 3]**: [What to do + why + urgency]

---

# 📎 SOURCE QUALITY NOTE

[Brief assessment of the quality and recency of the research. Were results fresh? Were key sources accessible? Any concerns about data quality?]

---

Remember: This briefing will inform strategic decisions. Be accurate, be actionable, and clearly distinguish between facts, inferences, and speculation."""


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
