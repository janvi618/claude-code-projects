"""
Stakeholder Persona Definitions

These personas represent common executive archetypes you'll encounter
when presenting competitive strategies. Each has distinct priorities,
evaluation criteria, and typical concerns.
"""

PERSONAS = {
    "cfo": {
        "name": "CFO (Chief Financial Officer)",
        "title": "CFO",
        "focus": "Financial performance and risk management",
        "cares_about": [
            "Profit margins and ROI",
            "Cash flow implications",
            "Financial risk exposure",
            "Cost structure changes",
            "Shareholder value impact"
        ],
        "evaluates_by": [
            "What's the financial model?",
            "What are the margin implications?",
            "How does this affect our risk profile?",
            "What's the payback period?",
            "Can we fund this without hurting other priorities?"
        ],
        "typical_objections": [
            "The ROI assumptions seem aggressive",
            "This could hurt margins in the short term",
            "Have we stress-tested the financial model?",
            "What's our exit strategy if this fails?"
        ]
    },

    "ceo": {
        "name": "CEO (Chief Executive Officer)",
        "title": "CEO",
        "focus": "Long-term strategy and competitive positioning",
        "cares_about": [
            "Market position and competitive advantage",
            "Long-term strategic direction",
            "Board and investor perception",
            "Organizational capability building",
            "Legacy and company trajectory"
        ],
        "evaluates_by": [
            "Does this strengthen our competitive moat?",
            "How does this fit our 5-year vision?",
            "What will the board think?",
            "Are we building capabilities we'll need?",
            "Is this who we want to be as a company?"
        ],
        "typical_objections": [
            "I'm not sure this is strategic enough",
            "How does this play with our other initiatives?",
            "The board may have concerns about risk",
            "Are we reacting or leading?"
        ]
    },

    "sales_vp": {
        "name": "VP of Sales",
        "title": "VP Sales",
        "focus": "Revenue growth and customer relationships",
        "cares_about": [
            "Revenue and quota attainment",
            "Customer acquisition and retention",
            "Sales team morale and tools",
            "Competitive win rates",
            "Pipeline health"
        ],
        "evaluates_by": [
            "Will this help us close more deals?",
            "How will customers react?",
            "What do I tell my sales team?",
            "Will this hurt existing relationships?",
            "Can we actually execute this in the field?"
        ],
        "typical_objections": [
            "My team is already stretched thin",
            "Customers might see this negatively",
            "This could disrupt deals in the pipeline",
            "We need more sales support, not strategy"
        ]
    },

    "cmo": {
        "name": "CMO (Chief Marketing Officer)",
        "title": "CMO",
        "focus": "Brand, market perception, and demand generation",
        "cares_about": [
            "Brand positioning and reputation",
            "Market perception and messaging",
            "Demand generation effectiveness",
            "Customer insights and voice",
            "Competitive differentiation story"
        ],
        "evaluates_by": [
            "What's the story we tell the market?",
            "How does this affect brand perception?",
            "Can we differentiate with this?",
            "What will customers and analysts say?",
            "Does this give us compelling messaging?"
        ],
        "typical_objections": [
            "The messaging isn't clear enough",
            "This could confuse our brand positioning",
            "We need time to prepare the market",
            "Competitors will spin this against us"
        ]
    }
}


def get_persona(persona_key: str) -> dict:
    """Get a specific persona by key."""
    return PERSONAS.get(persona_key.lower())


def get_all_personas() -> dict:
    """Get all available personas."""
    return PERSONAS


def list_persona_names() -> list:
    """Get list of persona display names."""
    return [p["name"] for p in PERSONAS.values()]
