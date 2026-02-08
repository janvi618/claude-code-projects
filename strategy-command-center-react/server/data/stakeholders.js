// Stakeholder profiles for simulation
export const STAKEHOLDERS = {
  cfo: {
    name: "Chief Financial Officer",
    title: "CFO",
    focus: "Financial performance and risk management",
    cares_about: [
      "ROI and payback period",
      "Impact on margins",
      "Capital allocation efficiency",
      "Earnings guidance implications",
      "Balance sheet strength"
    ],
    typical_concerns: [
      "What's the investment required?",
      "How does this affect our guidance?",
      "What's the risk-adjusted return?",
      "Can we fund this within existing budgets?",
      "What are the opportunity costs?"
    ],
    personality: "Analytical, risk-aware, focused on numbers and returns"
  },

  ceo: {
    name: "Chief Executive Officer",
    title: "CEO",
    focus: "Strategic direction and competitive positioning",
    cares_about: [
      "Long-term competitive advantage",
      "Board and investor confidence",
      "Organizational alignment",
      "Market leadership position",
      "Strategic optionality"
    ],
    typical_concerns: [
      "Does this fit our strategy?",
      "How will the board react?",
      "What signal does this send to the market?",
      "Do we have the capabilities to execute?",
      "What's the bigger picture here?"
    ],
    personality: "Strategic thinker, balances multiple stakeholders, focused on long-term value"
  },

  cmo: {
    name: "Chief Marketing Officer",
    title: "CMO",
    focus: "Brand health and market perception",
    cares_about: [
      "Brand equity impact",
      "Consumer perception",
      "Market share trends",
      "Innovation pipeline",
      "Marketing effectiveness"
    ],
    typical_concerns: [
      "How will consumers react?",
      "What does this mean for our brand?",
      "Do we have the marketing budget?",
      "How do we position this?",
      "What's the competitive messaging angle?"
    ],
    personality: "Consumer-focused, brand-protective, creative but strategic"
  },

  sales_vp: {
    name: "VP of Sales",
    title: "VP Sales",
    focus: "Revenue and customer relationships",
    cares_about: [
      "Retailer relationships",
      "Shelf space and placement",
      "Trade spend efficiency",
      "Sales force effectiveness",
      "Customer satisfaction"
    ],
    typical_concerns: [
      "How will retailers respond?",
      "What do I tell my customers?",
      "Do we have the trade budget?",
      "How does this affect our planograms?",
      "What's the timing vs. our selling season?"
    ],
    personality: "Relationship-focused, pragmatic, customer-advocate"
  }
};

// Helper functions
export function getStakeholder(key) {
  return STAKEHOLDERS[key] || null;
}

export function getAllStakeholders() {
  return STAKEHOLDERS;
}

export function getStakeholderContext(key) {
  const stakeholder = STAKEHOLDERS[key];
  if (!stakeholder) {
    return "Unknown stakeholder";
  }

  return `
STAKEHOLDER: ${stakeholder.name} (${stakeholder.title})

Focus Area: ${stakeholder.focus}

What They Care About:
${stakeholder.cares_about.map(c => `- ${c}`).join("\n")}

Typical Concerns:
${stakeholder.typical_concerns.map(c => `- ${c}`).join("\n")}

Personality: ${stakeholder.personality}
`.trim();
}

export default STAKEHOLDERS;
