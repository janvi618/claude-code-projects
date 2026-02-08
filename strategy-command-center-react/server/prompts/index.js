import { COMPANY } from '../data/company.js';

// Threat Analysis Prompt
export function threatAnalysisPrompt(threatDescription, competitorContext) {
  return `You are a competitive intelligence analyst for ${COMPANY.name}.

${competitorContext}

A competitive threat has been detected. Analyze it and provide a structured assessment.

THREAT DESCRIPTION:
${threatDescription}

Provide your analysis in this exact format:

## WHAT HAPPENED
[2-3 sentence summary of the competitive move]

## THREAT LEVEL
[HIGH / MEDIUM / LOW] - [One sentence justification]

## AFFECTED CATEGORIES
[List the specific product categories and brands affected]

## LIKELY INTENT
[What is the competitor trying to achieve? Strategic goals behind this move]

## TIME SENSITIVITY
[How quickly do we need to respond? Days/Weeks/Months]

## KEY QUESTIONS
[3-5 critical questions we need to answer to formulate our response]`;
}

// Intel Research Prompt (basic version without deep search)
export function intelResearchPrompt(threatDescription, competitorContext) {
  return `You are a competitive intelligence researcher for ${COMPANY.name}.

${competitorContext}

Based on your knowledge, provide intelligence context for this competitive situation:

THREAT DESCRIPTION:
${threatDescription}

Provide your research in this format:

## BACKGROUND
[Context on the competitor's recent activities and strategic direction]

## MARKET REACTION
[How the market/industry typically reacts to moves like this]

## COMPETITIVE LANDSCAPE
[How this fits into broader competitive dynamics]

## POTENTIAL IMPACT ON ${COMPANY.name.toUpperCase()}
[Specific implications for our business]

## INTELLIGENCE GAPS
[What additional information would be valuable to gather]`;
}

// Deep Research Synthesis Prompt
export function deepResearchPrompt(threatDescription, competitorContext, searchResults) {
  const searchSections = Object.entries(searchResults)
    .map(([category, results]) => {
      if (!results || results.length === 0) {
        return `### ${category}\nNo results found.`;
      }
      const formatted = results.map(r =>
        `- **${r.title}** (${r.source})\n  ${r.body || ''}`
      ).join('\n');
      return `### ${category}\n${formatted}`;
    })
    .join('\n\n');

  return `You are a senior competitive intelligence analyst for ${COMPANY.name}.

${competitorContext}

You have conducted comprehensive research across multiple dimensions. Synthesize these findings
into an actionable intelligence report.

THREAT DESCRIPTION:
${threatDescription}

RESEARCH FINDINGS:
${searchSections}

Provide your synthesis in this format:

## EXECUTIVE SUMMARY
[3-5 bullet points with the most critical intelligence]

## DETAILED INTELLIGENCE

### Public Announcements & Official Communications
[Key findings about what the competitor has officially announced]

### Patents, R&D & Innovation Signals
[Any technology or innovation indicators]

### M&A, Investments & Strategic Partnerships
[Capital allocation and partnership signals]

### Financial Signals
[Relevant financial indicators or guidance changes]

### Industry Trends & Market Dynamics
[Broader market context]

### Consumer Sentiment
[What consumers/customers are saying]

### Competitive Response History
[How competitors have responded to similar moves historically]

### Executive Commentary
[Relevant statements from leadership]

## THREAT ASSESSMENT MATRIX
| Dimension | Severity | Confidence | Time Horizon |
|-----------|----------|------------|--------------|
[Fill in key threat dimensions]

## CRITICAL INTELLIGENCE GAPS
[What we still don't know that matters]

## IMMEDIATE ACTIONS RECOMMENDED
[2-3 specific next steps based on intelligence]`;
}

// Response Options Prompt
export function responseOptionsPrompt(threatAnalysis, intelReport) {
  return `You are a strategy advisor for ${COMPANY.name}.

Based on the threat analysis and intelligence report, generate 4 strategic response options
ranging from conservative to aggressive.

THREAT ANALYSIS:
${threatAnalysis}

INTELLIGENCE REPORT:
${intelReport}

Generate exactly 4 response options in this format:

## OPTION 1: HOLD & MONITOR
**Summary:** [One sentence description]

**Actions:**
- [Specific action 1]
- [Specific action 2]
- [Specific action 3]

**Rationale:** [Why this approach makes sense]

**Risks:** [Key risks of this approach]

**Investment Required:** [Low/Medium/High and rough estimate]

---

## OPTION 2: DEFEND
**Summary:** [One sentence description]

**Actions:**
- [Specific action 1]
- [Specific action 2]
- [Specific action 3]

**Rationale:** [Why this approach makes sense]

**Risks:** [Key risks of this approach]

**Investment Required:** [Low/Medium/High and rough estimate]

---

## OPTION 3: COUNTER
**Summary:** [One sentence description]

**Actions:**
- [Specific action 1]
- [Specific action 2]
- [Specific action 3]

**Rationale:** [Why this approach makes sense]

**Risks:** [Key risks of this approach]

**Investment Required:** [Low/Medium/High and rough estimate]

---

## OPTION 4: DISRUPT
**Summary:** [One sentence description]

**Actions:**
- [Specific action 1]
- [Specific action 2]
- [Specific action 3]

**Rationale:** [Why this approach makes sense]

**Risks:** [Key risks of this approach]

**Investment Required:** [Low/Medium/High and rough estimate]`;
}

// Stakeholder Simulation Prompt
export function simulationPrompt(stakeholderContext, responseOption, threatContext) {
  return `You are roleplaying as a senior executive at ${COMPANY.name}.

${stakeholderContext}

You are in a strategy meeting where the following response to a competitive threat is being proposed.

COMPETITIVE THREAT:
${threatContext}

PROPOSED RESPONSE:
${responseOption}

Respond AS THIS STAKEHOLDER would, in first person. Be authentic to their perspective,
concerns, and communication style.

Provide your response in this format:

## MY INITIAL TAKE
[2-3 sentences on your gut reaction to this proposal]

## WHAT I LIKE
[2-3 specific things you support about this approach]

## MY CONCERNS
[2-3 specific concerns or objections from your functional perspective]

## QUESTIONS I NEED ANSWERED
[3-4 questions you would ask before supporting this]

## WHAT WOULD WIN ME OVER
[What would need to be true or added for you to fully support this]`;
}

// Red Team Prompt
export function redTeamPrompt(responseOption, threatContext) {
  return `You are a strategic red team analyst. Your job is to stress-test proposed strategies
by finding weaknesses, blind spots, and failure modes.

COMPETITIVE SITUATION:
${threatContext}

PROPOSED RESPONSE:
${responseOption}

Conduct a rigorous red team analysis:

## HIDDEN ASSUMPTIONS
[What assumptions is this strategy making that might not be true?]

## BLIND SPOTS
[What is this strategy NOT considering that it should?]

## FAILURE SCENARIOS
[3 specific ways this strategy could fail]

## COMPETITOR COUNTER-MOVES
[How might the competitor respond to neutralize our strategy?]

## EXECUTION RISKS
[What could go wrong in implementing this strategy?]

## OVERALL VULNERABILITY RATING
[HIGH / MEDIUM / LOW] - [One sentence summary]`;
}

// Scenario Chain Prompt
export function scenarioChainPrompt(responseOption, threatContext) {
  return `You are a scenario planning strategist for ${COMPANY.name}.

Model out three possible futures based on this competitive situation and proposed response.

COMPETITIVE SITUATION:
${threatContext}

PROPOSED RESPONSE:
${responseOption}

Generate three scenario chains showing move and counter-move sequences:

## SCENARIO 1: BEST CASE
**Probability:** [X%]

| Turn | Actor | Move | Market Impact |
|------|-------|------|---------------|
| 1 | Us | [Our initial move] | [Impact] |
| 2 | Competitor | [Their response] | [Impact] |
| 3 | Us | [Our counter] | [Impact] |
| 4 | Market | [Market evolution] | [Impact] |

**End State:** [Where we end up in this scenario]

---

## SCENARIO 2: MOST LIKELY
**Probability:** [X%]

| Turn | Actor | Move | Market Impact |
|------|-------|------|---------------|
| 1 | Us | [Our initial move] | [Impact] |
| 2 | Competitor | [Their response] | [Impact] |
| 3 | Us | [Our counter] | [Impact] |
| 4 | Market | [Market evolution] | [Impact] |

**End State:** [Where we end up in this scenario]

---

## SCENARIO 3: WORST CASE
**Probability:** [X%]

| Turn | Actor | Move | Market Impact |
|------|-------|------|---------------|
| 1 | Us | [Our initial move] | [Impact] |
| 2 | Competitor | [Their response] | [Impact] |
| 3 | Us | [Our counter] | [Impact] |
| 4 | Market | [Market evolution] | [Impact] |

**End State:** [Where we end up in this scenario]`;
}

// Launch Materials Prompt
export function launchMaterialsPrompt(chosenResponse, threatContext, simulationResults) {
  return `You are a strategic communications expert for ${COMPANY.name}.

Generate launch-ready materials for the approved competitive response.

COMPETITIVE SITUATION:
${threatContext}

APPROVED RESPONSE:
${chosenResponse}

STAKEHOLDER SIMULATION RESULTS:
${simulationResults}

Generate comprehensive launch materials:

## EXECUTIVE SUMMARY
[One-page summary for senior leadership]

## INTERNAL TALKING POINTS
[Key messages for internal communications]
- [Talking point 1]
- [Talking point 2]
- [Talking point 3]
- [Talking point 4]
- [Talking point 5]

## EXTERNAL MESSAGING (if needed)
[Approved language for external communications]

**For Media Inquiries:**
[Statement]

**For Investor Inquiries:**
[Statement]

**For Customer Inquiries:**
[Statement]

## SALES BRIEF
[One-pager for sales team with customer-facing talking points]

### The Situation
[Brief context]

### Our Response
[What we're doing]

### For Customer Conversations
[How to discuss with retailers/customers]

### FAQs
[3-4 anticipated questions and answers]

## ACTION CHECKLIST
[Specific actions with owners and timelines]

| Action | Owner | Timeline | Status |
|--------|-------|----------|--------|
| [Action 1] | [Role] | [When] | Not Started |
| [Action 2] | [Role] | [When] | Not Started |
| [Action 3] | [Role] | [When] | Not Started |
| [Action 4] | [Role] | [When] | Not Started |
| [Action 5] | [Role] | [When] | Not Started |

## SUCCESS METRICS
[How we'll measure if our response is working]

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| [Metric 1] | [Value] | [Target] | [When] |
| [Metric 2] | [Value] | [Target] | [When] |
| [Metric 3] | [Value] | [Target] | [When] |`;
}

export default {
  threatAnalysisPrompt,
  intelResearchPrompt,
  deepResearchPrompt,
  responseOptionsPrompt,
  simulationPrompt,
  redTeamPrompt,
  scenarioChainPrompt,
  launchMaterialsPrompt
};
