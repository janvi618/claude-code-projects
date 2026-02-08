// Competitor profiles
export const COMPETITORS = {
  kelloggs: {
    name: "Kellanova / WK Kellogg Co",
    ticker: "K / KLG",
    description: `Following the 2023 split, Kellogg became two companies: Kellanova (snacks, international
cereals, frozen foods) and WK Kellogg Co (North American cereals). Together they remain
General Mills' most direct competitor across multiple categories.`,
    key_brands: [
      "Kellogg's", "Pringles", "Cheez-It", "Pop-Tarts", "Eggo",
      "MorningStar Farms", "RXBar", "Special K", "Frosted Flakes"
    ],
    overlap_categories: [
      "Breakfast cereals",
      "Snack bars",
      "Frozen breakfast"
    ],
    typical_moves: [
      "Heavy promotional spending",
      "Health/wellness brand extensions",
      "International expansion",
      "Plant-based investments"
    ]
  },

  post_holdings: {
    name: "Post Holdings",
    ticker: "POST",
    description: `Post Holdings is the third-largest cereal company in the US, with a portfolio
focused on value and better-for-you cereals. Known for aggressive M&A strategy
and private-label partnerships.`,
    key_brands: [
      "Honey Bunches of Oats", "Grape-Nuts", "Pebbles", "Great Grains",
      "Malt-O-Meal", "Barbara's", "Weetabix"
    ],
    overlap_categories: [
      "Breakfast cereals",
      "Granola & natural foods"
    ],
    typical_moves: [
      "Value pricing pressure",
      "Private label expansion",
      "Bolt-on acquisitions",
      "Cost leadership strategy"
    ]
  },

  pepsico: {
    name: "PepsiCo (Quaker)",
    ticker: "PEP",
    description: `PepsiCo's Quaker Foods division competes directly in breakfast and snacks.
With massive distribution power and marketing budgets, Quaker is a formidable
competitor especially in oatmeal, granola bars, and rice snacks.`,
    key_brands: [
      "Quaker Oats", "Cap'n Crunch", "Life", "Chewy", "Rice-A-Roni",
      "Aunt Jemima/Pearl Milling Company"
    ],
    overlap_categories: [
      "Breakfast cereals",
      "Snack bars",
      "Oatmeal & hot cereals"
    ],
    typical_moves: [
      "Massive marketing spend",
      "Distribution leverage",
      "Health-positioned innovations",
      "Cross-promotion with beverages"
    ]
  },

  conagra: {
    name: "Conagra Brands",
    ticker: "CAG",
    description: `Conagra Brands competes in frozen foods, snacks, and staples. Following the
Pinnacle Foods acquisition, they have significant presence in frozen breakfast
and snacking categories.`,
    key_brands: [
      "Birds Eye", "Duncan Hines", "Healthy Choice", "Marie Callender's",
      "Slim Jim", "Angie's Boomchickapop", "Gardein", "Frontera"
    ],
    overlap_categories: [
      "Frozen foods",
      "Baking products",
      "Snacks"
    ],
    typical_moves: [
      "Innovation in frozen",
      "Health & wellness positioning",
      "Plant-based expansion",
      "Premium tier launches"
    ]
  },

  nestle: {
    name: "Nestlé",
    ticker: "NSRGY",
    description: `The world's largest food company, Nestlé competes across multiple General Mills
categories including cereals, frozen foods, and pet care. Their scale and R&D
capabilities make them a strategic threat in any category they prioritize.`,
    key_brands: [
      "Cheerios (outside NA)", "Stouffer's", "Lean Cuisine", "DiGiorno",
      "Purina", "Gerber", "Coffee-Mate", "Häagen-Dazs (outside NA)"
    ],
    overlap_categories: [
      "Breakfast cereals (international)",
      "Frozen foods",
      "Pet food",
      "Ice cream"
    ],
    typical_moves: [
      "Global brand building",
      "Premium positioning",
      "Nutrition science claims",
      "Massive R&D investment",
      "Strategic portfolio reshaping"
    ]
  },

  mondelez: {
    name: "Mondelēz International",
    ticker: "MDLZ",
    description: `Global snacking leader with strong positions in biscuits, chocolate, and gum.
Competes with General Mills in snacking occasions and expanding into
better-for-you snack bars.`,
    key_brands: [
      "Oreo", "Ritz", "Triscuit", "BelVita", "Clif Bar",
      "Chips Ahoy!", "Cadbury", "Toblerone"
    ],
    overlap_categories: [
      "Snack bars",
      "Biscuits & crackers"
    ],
    typical_moves: [
      "Snacking occasion expansion",
      "Health bar acquisitions",
      "Global brand leverage",
      "DTC & e-commerce investment"
    ]
  }
};

// Helper functions
export function getCompetitor(key) {
  return COMPETITORS[key] || null;
}

export function getAllCompetitors() {
  return COMPETITORS;
}

export function identifyCompetitor(text) {
  const textLower = text.toLowerCase();

  const keywords = {
    kelloggs: ["kellogg", "kellanova", "wk kellogg", "pringles", "cheez-it", "pop-tarts", "eggo", "rxbar", "special k", "frosted flakes"],
    post_holdings: ["post holdings", "post cereals", "honey bunches", "grape-nuts", "pebbles", "malt-o-meal", "weetabix", "barbara's"],
    pepsico: ["pepsico", "pepsi", "quaker", "cap'n crunch", "chewy bars", "life cereal", "rice-a-roni", "aunt jemima", "pearl milling"],
    conagra: ["conagra", "birds eye", "duncan hines", "healthy choice", "marie callender", "slim jim", "boomchickapop", "gardein", "frontera"],
    nestle: ["nestle", "nestlé", "stouffer", "lean cuisine", "digiorno", "purina", "gerber", "coffee-mate"],
    mondelez: ["mondelez", "mondelēz", "oreo", "ritz", "triscuit", "belvita", "clif bar", "chips ahoy", "cadbury"]
  };

  for (const [key, terms] of Object.entries(keywords)) {
    for (const term of terms) {
      if (textLower.includes(term)) {
        return key;
      }
    }
  }

  return null;
}

export function getCompetitorContext(key) {
  const competitor = COMPETITORS[key];
  if (!competitor) {
    return "Unknown competitor - general competitive analysis will be performed.";
  }

  return `
COMPETITOR PROFILE: ${competitor.name} (${competitor.ticker})

${competitor.description}

Key Brands: ${competitor.key_brands.join(", ")}

Categories Where They Compete With Us:
${competitor.overlap_categories.map(c => `- ${c}`).join("\n")}

Their Typical Competitive Moves:
${competitor.typical_moves.map(m => `- ${m}`).join("\n")}
`.trim();
}

export default COMPETITORS;
