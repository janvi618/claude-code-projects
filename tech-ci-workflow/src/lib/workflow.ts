export const STEPS = [
  {
    number: 1,
    title: 'Category Landscape & Whitespace',
    phase: 1,
    description: 'Analyze the competitive landscape and identify whitespace opportunities',
    requiresApproval: false,
  },
  {
    number: 2,
    title: 'IP Ontology & Whitespace',
    phase: 1,
    description: 'Review IP landscape and map the ecosystem',
    requiresApproval: false,
  },
  {
    number: 3,
    title: 'Strategy Alignment',
    phase: 1,
    description: 'Align opportunities with business strategy. Approval required.',
    requiresApproval: true,
  },
  {
    number: 4,
    title: 'Opportunity Deep Dive',
    phase: 2,
    description: 'Deep analysis of selected opportunities',
    requiresApproval: false,
  },
  {
    number: 5,
    title: 'Synthesis & Workplan',
    phase: 2,
    description: 'Synthesize insights and create roadmap',
    requiresApproval: false,
  },
  {
    number: 6,
    title: 'Strategy & Recommendations',
    phase: 2,
    description: 'Final recommendations and export. Approval required.',
    requiresApproval: true,
  },
];

export function getStepConfig(number: number) {
  return STEPS.find(s => s.number === number);
}
