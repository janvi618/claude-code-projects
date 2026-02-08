// Research-grade prompts for competitive intelligence workflow

export const SYSTEM_PROMPT = `You are a senior competitive intelligence analyst with expertise in:
- Market landscape analysis and competitive positioning
- Technology and IP landscape assessment
- Strategic opportunity identification and prioritization
- Business model analysis and go-to-market strategy

CRITICAL RULES:
1. Be specific and data-driven. Cite concrete examples, companies, and trends.
2. Only cite sources that are explicitly provided using [S#] format.
3. For claims based on general knowledge or inference, use [Inference] or [Web Research].
4. Structure output with clear headers, tables, and actionable insights.
5. Focus on strategic implications, not just descriptions.
6. Identify risks, assumptions, and what must be true for success.
7. Be direct and avoid corporate jargon - say what you mean.`

export function getStep1Prompt(projectTitle: string, description: string | null, sourcesContext: string, webResearchContext: string): string {
  return `# Task: Landscape & Whitespace Analysis

## Project: ${projectTitle}
${description ? `Description: ${description}` : ''}

${sourcesContext}

${webResearchContext}

## Instructions

Analyze the competitive landscape for "${projectTitle}" and identify whitespace opportunities.

### Part 1: Landscape Summary

Create a comprehensive landscape analysis including:

1. **Market Overview**
   - Market size estimates and growth trajectory
   - Key market segments and their characteristics
   - Primary value drivers and success factors

2. **Competitive Map**
   Create a table of key players:
   | Company | Market Position | Key Strengths | Key Weaknesses | Recent Moves |

3. **Technology Trends**
   - Emerging technologies reshaping the space
   - Adoption curves and maturity levels
   - Build vs buy vs partner considerations

4. **Customer Dynamics**
   - Key buyer personas and their priorities
   - Unmet needs and pain points
   - Switching costs and barriers

### Part 2: Whitespace Hypotheses

Identify 3-5 potential whitespace opportunities:

For each hypothesis:
- **Opportunity Name**: Clear, descriptive title
- **Gap Identified**: What's missing or underserved
- **Evidence**: What supports this hypothesis
- **Target Segment**: Who would benefit
- **Initial Size Estimate**: Rough market potential
- **Key Questions**: What we need to validate

Focus on actionable opportunities, not obvious ones everyone is already pursuing.`
}

export function getStep2Prompt(projectTitle: string, sourcesContext: string, webResearchContext: string): string {
  return `# Task: IP & Ecosystem Analysis

## Project: ${projectTitle}

${sourcesContext}

${webResearchContext}

## Instructions

Analyze the intellectual property landscape and ecosystem dynamics.

### Part 1: IP Crowdedness Map

Create a table assessing IP density by technology area:

| Technology Area | Patent Density | Key IP Holders | Freedom to Operate | Opportunity Level |
|-----------------|---------------|----------------|-------------------|-------------------|

Consider:
- Core vs. adjacent vs. emerging technology areas
- Patent thickets and potential blockers
- Open source alternatives
- Trade secret considerations

### Part 2: Ecosystem Map

Map the value chain and ecosystem:

1. **Value Chain Analysis**
   - Upstream suppliers and their power
   - Downstream channels and customers
   - Integration points and dependencies

2. **Partnership Landscape**
   | Partner Type | Key Players | Strategic Value | Relationship Model |

3. **Platform Dynamics**
   - Dominant platforms in the space
   - API/integration requirements
   - Lock-in risks and opportunities

### Part 3: New Entrant Strategy Notes

Based on the IP and ecosystem analysis:

1. **Entry Barriers Assessment**
   - Technical barriers (patents, know-how)
   - Commercial barriers (relationships, scale)
   - Regulatory barriers

2. **Recommended Entry Strategies**
   - Build: Where greenfield innovation is possible
   - Buy: Acquisition targets worth considering
   - Partner: Strategic alliances to explore
   - License: IP that should be licensed

3. **Key Risks**
   - IP litigation exposure
   - Ecosystem dependency risks
   - Regulatory/compliance risks`
}

export function getStep3Prompt(projectTitle: string, sourcesContext: string, webResearchContext: string, previousAnalysis: string): string {
  return `# Task: DFV Scoring & Opportunity Prioritization

## Project: ${projectTitle}

${sourcesContext}

${webResearchContext}

## Previous Analysis Context
${previousAnalysis}

## Instructions

Score and prioritize opportunities using the Desirability-Feasibility-Viability (DFV) framework.

### Part 1: DFV Scoring Framework

For each opportunity identified, score on these dimensions (1-5 scale):

**DESIRABILITY (Do customers want this?)**
- Customer need is validated, not assumed
- Value proposition is clear and compelling
- Problem is urgent enough to drive action
- Target segment is well-defined

**FEASIBILITY (Can we build this?)**
- Technical capability exists or is achievable
- Resources (team, tools, time) are available
- Timeline is realistic
- Dependencies are manageable

**VIABILITY (Can we profit from this?)**
- Business model is clear
- Unit economics work at scale
- Market size justifies investment
- Path to profitability is realistic

### Part 2: Scoring Table

| Opportunity | Desirability (1-5) | Feasibility (1-5) | Viability (1-5) | Total | Confidence |
|-------------|-------------------|-------------------|-----------------|-------|------------|

Include brief justification for each score.

### Part 3: Business Fit Assessment

For top-scoring opportunities:
- Strategic alignment rationale
- Resource requirements estimate
- Time to market estimate
- Key dependencies

### Part 4: Ranked Opportunity List

List opportunities in priority order:

1. **[Opportunity Name]** ⭐ [if recommended]
   - DFV Score: X/15
   - Key strengths: ...
   - Key risks: ...
   - Recommended next step: ...

2. **[Opportunity Name]**
   ...

(Continue for all opportunities)

### Approval Gate

> ⚠️ **Decision Required**: Select which opportunities to pursue for deep-dive analysis in Phase 2.`
}

export function getStep4Prompt(
  projectTitle: string,
  opportunityName: string,
  opportunityDescription: string | null,
  sourcesContext: string,
  webResearchContext: string
): string {
  return `# Task: Deep Dive Analysis

## Project: ${projectTitle}
## Opportunity: ${opportunityName}
${opportunityDescription ? `Description: ${opportunityDescription}` : ''}

${sourcesContext}

${webResearchContext}

## Instructions

Conduct a comprehensive deep-dive analysis of this opportunity.

### Part 1: Jobs to Be Done (JTBD)

**Primary Job Statement**
When [target customer/situation], I want to [desired outcome] so I can [ultimate benefit].

**Functional Jobs** (what they need to accomplish)
- ...

**Emotional Jobs** (how they want to feel)
- ...

**Social Jobs** (how they want to be perceived)
- ...

**Related Jobs** (adjacent needs to consider)
- ...

### Part 2: Solution Space Analysis

**Core Value Proposition**
- What problem does this solve?
- Why is our approach better?
- What's the key insight?

**Solution Components**
| Component | Description | Build/Buy/Partner | Priority |
|-----------|-------------|-------------------|----------|

**Technology Stack Considerations**
- Core technology requirements
- Integration requirements
- Scalability considerations

### Part 3: Technology Readiness Level (TRL)

| Component | Current TRL | Target TRL | Gap Assessment | De-risking Actions |
|-----------|-------------|------------|----------------|-------------------|

TRL Scale: 1-3 (Research), 4-6 (Development), 7-9 (Production Ready)

### Part 4: Risk Assessment

| Risk | Category | Probability | Impact | Mitigation Strategy |
|------|----------|-------------|--------|---------------------|

Categories: Technical, Market, Competitive, Regulatory, Execution, Financial

### Part 5: Assumptions & "What Must Be True"

**Critical Assumptions** (if wrong, opportunity fails)
- [ ] Assumption 1: ...
- [ ] Assumption 2: ...

**Important Assumptions** (if wrong, approach needs adjustment)
- [ ] Assumption 3: ...
- [ ] Assumption 4: ...

**Validation Plan**
For each critical assumption, how would we test it?

### Part 6: Initial Business Case

**Revenue Model**
- Pricing approach
- Revenue streams
- Unit economics targets

**Investment Required**
- Development costs
- Go-to-market costs
- Ongoing operations

**Key Metrics**
- Success indicators
- Leading indicators to track
- Kill criteria`
}

export function getStep5Prompt(
  projectTitle: string,
  opportunities: { name: string; description?: string | null }[],
  sourcesContext: string
): string {
  const oppList = opportunities.map(o => `- ${o.name}${o.description ? `: ${o.description}` : ''}`).join('\n')

  return `# Task: Synthesis & Roadmap

## Project: ${projectTitle}

## Selected Opportunities
${oppList}

${sourcesContext}

## Instructions

Synthesize the deep-dive analyses into an actionable strategic roadmap.

### Part 1: Synthesis Memo

**Executive Summary**
2-3 paragraph synthesis of key findings across all analyzed opportunities.

**Cross-Cutting Themes**
- Common success factors
- Shared risks and dependencies
- Synergies between opportunities

**Strategic Implications**
What does this analysis tell us about our strategic direction?

### Part 2: Comparison Matrix

| Criteria | ${opportunities.map(o => o.name).join(' | ')} |
|----------|${opportunities.map(() => '---').join('|')}|
| Market Size | ... |
| Competition Intensity | ... |
| Capability Fit | ... |
| Investment Required | ... |
| Time to Revenue | ... |
| Risk Level | ... |
| Strategic Alignment | ... |
| **Overall Recommendation** | ... |

### Part 3: Strategic Roadmap

**Phase 1: Foundation (0-6 months)**
- Key activities
- Milestones
- Resource requirements
- Go/no-go criteria

**Phase 2: Build & Validate (6-12 months)**
- Key activities
- Milestones
- Resource requirements
- Go/no-go criteria

**Phase 3: Scale (12-24 months)**
- Key activities
- Milestones
- Resource requirements
- Success metrics

### Part 4: Resource Plan

**Team Requirements**
| Role | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|

**Investment Summary**
| Category | Phase 1 | Phase 2 | Phase 3 | Total |
|----------|---------|---------|---------|-------|

### Part 5: Key Decisions Required

List the critical decisions that leadership needs to make:
1. ...
2. ...
3. ...`
}

export function getStep6Prompt(
  projectTitle: string,
  sourcesContext: string,
  allArtifacts: { step: number; content: string }[]
): string {
  const artifactSummary = allArtifacts
    .map(a => `### Step ${a.step} Summary\n${a.content.substring(0, 1500)}...`)
    .join('\n\n')

  return `# Task: Executive Summary - What / So What / Now What

## Project: ${projectTitle}

${sourcesContext}

## Analysis Conducted
${artifactSummary}

## Instructions

Create an executive-ready summary using the What / So What / Now What framework.

### WHAT: Key Findings

**Market Landscape**
- 3-5 bullet points on market dynamics
- Key numbers and trends

**Competitive Position**
- Where we stand today
- Key competitors and their moves

**Opportunity Assessment**
- Opportunities identified and prioritized
- Recommended focus areas

### SO WHAT: Strategic Implications

**Why This Matters Now**
- Market timing considerations
- Competitive urgency
- Risk of inaction

**What's at Stake**
- Upside potential (be specific with numbers if possible)
- Downside risks if we don't act
- Strategic positioning implications

**Key Insights**
- 3-5 non-obvious insights from the analysis
- What surprised us or challenged assumptions

### NOW WHAT: Recommended Actions

**Immediate Actions (0-30 days)**
1. [Specific action with owner and deadline]
2. ...
3. ...

**Near-term Actions (30-90 days)**
1. ...
2. ...
3. ...

**Strategic Decisions Required**
1. [Decision] - needed by [date] - [who decides]
2. ...

### Executive Summary Box

| Dimension | Assessment |
|-----------|------------|
| Market Attractiveness | [High/Medium/Low] |
| Competitive Position | [Strong/Moderate/Weak] |
| Strategic Fit | [High/Medium/Low] |
| Investment Required | [$X-Y range] |
| Expected Return | [ROI/IRR estimate] |
| Recommendation | [Go/No-Go/Conditional] |

### Risk Summary

**Top 3 Risks**
1. [Risk]: [Mitigation]
2. ...
3. ...

### Success Metrics

If we proceed, we'll know we're succeeding when:
- [Metric 1]: [Target]
- [Metric 2]: [Target]
- [Metric 3]: [Target]

---

*This analysis is for competitive intelligence and strategic planning purposes. It does not constitute legal advice and should not be used for IP invention claims.*`
}
