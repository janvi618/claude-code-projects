// Mock LLM that returns deterministic outputs for testing

interface Source {
  id: string;
  title: string;
}

export function generateStep1(category: string, sources: Source[]): string {
  const citations = sources.length > 0
    ? sources.map((s, i) => `[S${i + 1}]`).join(', ')
    : '[Inference]';

  return `# Category Landscape Analysis: ${category}

## Executive Summary
This analysis examines the competitive landscape for **${category}**, identifying key players, market trends, and whitespace opportunities. ${citations}

## Key Players

| Company | Market Position | Key Strengths |
|---------|----------------|---------------|
| Company A | Market Leader | Strong R&D, global presence |
| Company B | Challenger | Innovative technology, agile |
| Company C | Niche Player | Specialized expertise |

## Market Trends

1. **Digital Transformation** - Increasing adoption of AI/ML solutions ${citations}
2. **Sustainability Focus** - Growing emphasis on green technologies
3. **Consolidation** - M&A activity accelerating in the sector

## Whitespace Hypotheses

### Hypothesis 1: Underserved Mid-Market
The mid-market segment appears underserved by current solutions. ${citations}

### Hypothesis 2: Integration Gap
Limited interoperability between existing solutions creates opportunity.

### Hypothesis 3: Geographic Expansion
Emerging markets show strong growth potential with limited competition.

---
*For competitive intelligence and strategy use; do not treat as legal advice; no IP invention.*`;
}

export function generateStep2(category: string, sources: Source[]): string {
  const citations = sources.length > 0
    ? sources.map((s, i) => `[S${i + 1}]`).join(', ')
    : '[Inference]';

  return `# IP Ontology & Ecosystem Analysis

## IP Crowdedness Map

| Technology Area | Patent Density | Key Holders | Opportunity Level |
|-----------------|---------------|-------------|-------------------|
| Core Technology | High | Company A, B | Low |
| Adjacent Tech | Medium | Various | Medium |
| Emerging Tech | Low | Startups | High |

## Ecosystem Map

### Value Chain Position
\`\`\`
Suppliers → Components → Integration → Distribution → End Users
    ↑           ↑            ↑            ↑
  [Low IP]   [High IP]   [Medium IP]   [Low IP]
\`\`\`

## New Entrant Strategy Notes

Based on the IP analysis ${citations}, recommended entry strategies:

1. **Partner Strategy** - License existing IP for faster market entry
2. **Greenfield Innovation** - Focus on emerging technology areas with low patent density
3. **Acquisition Path** - Target smaller players with complementary IP portfolios

## Key Risks

- Patent litigation risk in core technology areas
- Rapid technology evolution may obsolete current IP
- Regulatory changes affecting IP protection

---
*For competitive intelligence and strategy use; do not treat as legal advice; no IP invention.*`;
}

export function generateStep3(opportunities: string[], sources: Source[]): string {
  const citations = sources.length > 0
    ? sources.map((s, i) => `[S${i + 1}]`).join(', ')
    : '[Inference]';

  return `# Strategy Alignment & Opportunity Scoring

## DFV Scoring Framework

| Opportunity | Desirability (1-5) | Feasibility (1-5) | Viability (1-5) | Total |
|-------------|-------------------|-------------------|-----------------|-------|
| Mid-Market Solution | 4 | 5 | 4 | 13 |
| Integration Platform | 5 | 4 | 3 | 12 |
| Geographic Expansion | 3 | 4 | 4 | 11 |
| New Technology Play | 4 | 3 | 3 | 10 |

## Business Fit Assessment

### Strategic Alignment
- **Core Competency Match**: High alignment with existing capabilities
- **Resource Requirements**: Moderate investment needed
- **Time to Market**: 12-18 months for initial offering ${citations}

### Financial Viability
- Estimated market size: $2-5B addressable
- Target margin: 25-35%
- Payback period: 2-3 years

## Ranked Opportunity List

1. **Mid-Market Solution** ⭐ Recommended
   - Highest DFV score, strong business fit

2. **Integration Platform**
   - Strong market need, execution complexity

3. **Geographic Expansion**
   - Lower risk, moderate returns

4. **New Technology Play**
   - High potential, higher uncertainty

## Approval Gate

> ⚠️ **Approval Required**: Select opportunities to proceed to Phase 2 deep dive analysis.

---
*For competitive intelligence and strategy use; do not treat as legal advice; no IP invention.*`;
}

export function generateStep4(opportunity: string, sources: Source[]): string {
  const citations = sources.length > 0
    ? sources.map((s, i) => `[S${i + 1}]`).join(', ')
    : '[Inference]';

  return `# Deep Dive: ${opportunity}

## Jobs to Be Done (JTBD)

### Primary Job
When [target customer] is [situation], they want to [desired outcome] so they can [benefit]. ${citations}

### Related Jobs
- Reduce operational complexity
- Improve decision-making speed
- Lower total cost of ownership

## Solution Space Analysis

### Core Solution Components
1. **Platform Layer** - Foundation infrastructure
2. **Application Layer** - User-facing functionality
3. **Integration Layer** - Connectivity with existing systems

### Technology Readiness Level (TRL)

| Component | Current TRL | Target TRL | Gap |
|-----------|-------------|------------|-----|
| Platform | TRL 6 | TRL 9 | Medium |
| Application | TRL 4 | TRL 8 | High |
| Integration | TRL 7 | TRL 9 | Low |

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Technical complexity | Medium | High | Phased approach |
| Market timing | Low | Medium | Fast-follower strategy |
| Resource constraints | Medium | Medium | Partnership model |

## "What Must Be True" Checklist

- [ ] Market demand validated through customer interviews
- [ ] Technical feasibility confirmed via prototype
- [ ] Unit economics support target margins
- [ ] Team capabilities aligned or acquirable
- [ ] Regulatory pathway is clear
- [ ] Competitive response is manageable

---
*For competitive intelligence and strategy use; do not treat as legal advice; no IP invention.*`;
}

export function generateStep5(opportunities: string[], sources: Source[]): string {
  const citations = sources.length > 0
    ? sources.map((s, i) => `[S${i + 1}]`).join(', ')
    : '[Inference]';

  return `# Synthesis & Program Workplan

## Synthesis Memo

### Key Insights
After analyzing ${opportunities.length || 'multiple'} opportunities, the following strategic themes emerge: ${citations}

1. **Market Timing is Favorable** - Current market conditions support new entry
2. **Capabilities Gap is Bridgeable** - Required competencies can be developed or acquired
3. **Competitive Response is Predictable** - Incumbents likely to respond within 12-18 months

### Comparison Matrix

| Criteria | Opportunity A | Opportunity B | Opportunity C |
|----------|--------------|---------------|---------------|
| Market Size | Large | Medium | Medium |
| Competition | High | Medium | Low |
| Capability Fit | High | Medium | High |
| Investment | Medium | Low | High |
| Time to Revenue | 18mo | 12mo | 24mo |

## Strategic Roadmap

### Phase 1: Foundation (Q1-Q2)
- Establish core team
- Validate key assumptions
- Develop initial prototype

### Phase 2: Development (Q3-Q4)
- Build MVP
- Conduct pilot programs
- Refine go-to-market strategy

### Phase 3: Scale (Year 2)
- Commercial launch
- Expand customer base
- Optimize operations

## Workstreams

1. **Product Development**
   - Technical architecture design
   - Feature prioritization
   - Quality assurance

2. **Go-to-Market**
   - Customer segmentation
   - Pricing strategy
   - Channel development

3. **Operations**
   - Team building
   - Process development
   - Vendor management

## Key Milestones

| Milestone | Target Date | Dependencies |
|-----------|-------------|--------------|
| Team assembled | Q1 | Budget approval |
| Prototype complete | Q2 | Team assembled |
| Pilot launch | Q3 | Prototype complete |
| Commercial GA | Q1+1Y | Pilot success |

---
*For competitive intelligence and strategy use; do not treat as legal advice; no IP invention.*`;
}

export function generateStep6(projectTitle: string, sources: Source[]): string {
  const citations = sources.length > 0
    ? sources.map((s, i) => `[S${i + 1}]`).join(', ')
    : '[Inference]';

  return `# Executive Strategy & Recommendations

## What / So What / Now What

### WHAT: Current State
${projectTitle} represents a significant strategic opportunity in an evolving market landscape. Our analysis reveals: ${citations}

- Market is growing at 15-20% annually
- Incumbent solutions leave gaps in [key areas]
- Technology maturity has reached inflection point

### SO WHAT: Implications
This creates a time-sensitive window for strategic action:

- **First-mover advantage** available for next 12-18 months
- **Capability gaps** are addressable with focused investment
- **Risk profile** is acceptable given potential returns

### NOW WHAT: Recommended Actions

#### Immediate (0-30 days)
1. Secure executive sponsorship and budget allocation
2. Assemble core team leads
3. Initiate customer validation interviews

#### Near-term (30-90 days)
1. Complete detailed business case
2. Finalize partnership discussions
3. Begin technical proof of concept

#### Medium-term (90-180 days)
1. Launch pilot program with design partners
2. Establish operational infrastructure
3. Develop go-to-market materials

## Executive Summary

**Recommendation**: Proceed with phased investment in the identified opportunity, with Stage-Gate reviews at key milestones.

**Investment Required**: $X-Y million over 18 months
**Expected Return**: Z% IRR, $A-B revenue by Year 3
**Key Risks**: [Manageable with proposed mitigations]

## Next Steps for Approval

- [ ] Review and approve strategic direction
- [ ] Allocate initial funding tranche
- [ ] Authorize team formation
- [ ] Schedule 90-day progress review

---

## Sources

${sources.length > 0
  ? sources.map((s, i) => `[S${i + 1}] ${s.title}`).join('\n')
  : '*No external sources cited. Analysis based on internal assessment.*'}

---
*For competitive intelligence and strategy use; do not treat as legal advice; no IP invention.*`;
}

export function generateForStep(
  stepNumber: number,
  inputs: Record<string, any>,
  sources: Source[],
  opportunities?: string[]
): string {
  switch (stepNumber) {
    case 1:
      return generateStep1(inputs.category || 'Technology Category', sources);
    case 2:
      return generateStep2(inputs.category || 'Technology Category', sources);
    case 3:
      return generateStep3(opportunities || [], sources);
    case 4:
      return generateStep4(inputs.opportunity || 'Selected Opportunity', sources);
    case 5:
      return generateStep5(opportunities || [], sources);
    case 6:
      return generateStep6(inputs.projectTitle || 'Strategic Initiative', sources);
    default:
      return '# Analysis\n\nContent generation for this step is not yet implemented.';
  }
}
