"""
Competitor Profiles for General Mills Strategy Command Center

Defines the company context and key competitors.
"""

COMPANY = {
    "name": "General Mills",
    "description": "Global food company with leading brands in cereals, snacks, meals, yogurt, and baking products",
    "key_brands": ["Cheerios", "Nature Valley", "Yoplait", "Häagen-Dazs", "Betty Crocker", "Pillsbury", "Blue Buffalo"],
    "key_categories": ["Breakfast cereals", "Snack bars", "Yogurt", "Frozen foods", "Baking products", "Pet food"],
    "strategic_priorities": [
        "Accelerate organic growth",
        "Drive bold brand building",
        "Reshape portfolio through innovation",
        "Expand pet food leadership",
        "Improve margins through efficiency"
    ]
}

COMPETITORS = {
    "kelloggs": {
        "name": "Kellogg's / Kellanova",
        "ticker": "K",
        "description": "Major cereal and snack company. Recently split into Kellanova (snacks/international) and WK Kellogg Co (cereals).",
        "key_brands": ["Frosted Flakes", "Pringles", "Cheez-It", "Pop-Tarts", "Eggo", "Rice Krispies", "Special K"],
        "overlap_categories": ["Breakfast cereals", "Snack bars", "Frozen breakfast"],
        "typical_moves": ["Price promotions", "Health repositioning", "Snack innovation", "International expansion"]
    },
    "post_holdings": {
        "name": "Post Holdings",
        "ticker": "POST",
        "description": "Third-largest cereal company in US. Also in refrigerated foods and food service.",
        "key_brands": ["Honey Bunches of Oats", "Grape-Nuts", "Pebbles", "Great Grains", "Malt-O-Meal", "Peter Pan"],
        "overlap_categories": ["Breakfast cereals", "Peanut butter"],
        "typical_moves": ["Value positioning", "Acquisitions", "Private label expansion"]
    },
    "pepsico": {
        "name": "PepsiCo (Quaker)",
        "ticker": "PEP",
        "description": "Food and beverage giant. Quaker division competes in breakfast and snacks.",
        "key_brands": ["Quaker Oats", "Cap'n Crunch", "Life Cereal", "Quaker Chewy", "Aunt Jemima/Pearl Milling"],
        "overlap_categories": ["Breakfast cereals", "Oatmeal", "Snack bars", "Pancake/syrup"],
        "typical_moves": ["Health/wellness innovation", "Sustainability messaging", "Premium positioning"]
    },
    "conagra": {
        "name": "Conagra Brands",
        "ticker": "CAG",
        "description": "Major packaged foods company strong in frozen foods, snacks, and condiments.",
        "key_brands": ["Healthy Choice", "Marie Callender's", "Birds Eye", "Slim Jim", "Reddi-wip", "Hunt's"],
        "overlap_categories": ["Frozen meals", "Snacks", "Baking"],
        "typical_moves": ["Frozen innovation", "Health positioning", "Brand acquisitions"]
    },
    "nestle": {
        "name": "Nestlé",
        "ticker": "NSRGY",
        "description": "World's largest food company. Broad portfolio overlaps in multiple categories.",
        "key_brands": ["Stouffer's", "DiGiorno", "Hot Pockets", "Toll House", "Coffee-Mate", "Purina"],
        "overlap_categories": ["Frozen foods", "Baking", "Pet food"],
        "typical_moves": ["Pet food expansion", "Health/nutrition focus", "Sustainability initiatives", "Premium innovation"]
    }
}

STAKEHOLDERS = {
    "cfo": {
        "name": "CFO",
        "focus": "Financial performance and risk",
        "cares_about": ["Margins", "ROI", "Cash flow", "Risk exposure"],
        "typical_concerns": ["Cost implications", "Payback period", "Financial risk"]
    },
    "ceo": {
        "name": "CEO",
        "focus": "Long-term strategy and competitive position",
        "cares_about": ["Market position", "Strategic direction", "Board perception", "Company trajectory"],
        "typical_concerns": ["Strategic fit", "Competitive advantage", "Execution capability"]
    },
    "cmo": {
        "name": "CMO",
        "focus": "Brand and market perception",
        "cares_about": ["Brand positioning", "Customer perception", "Market messaging", "Differentiation"],
        "typical_concerns": ["Brand impact", "Message clarity", "Competitive narrative"]
    },
    "sales_vp": {
        "name": "VP Sales",
        "focus": "Revenue and customer relationships",
        "cares_about": ["Revenue growth", "Customer retention", "Sales team execution", "Pipeline health"],
        "typical_concerns": ["Field execution", "Customer reactions", "Sales disruption"]
    }
}


def get_competitor(key: str) -> dict:
    return COMPETITORS.get(key.lower())


def get_all_competitors() -> dict:
    return COMPETITORS


def identify_competitor(text: str) -> str:
    """Try to identify which competitor is mentioned in text."""
    text_lower = text.lower()
    for key, comp in COMPETITORS.items():
        if key in text_lower or comp["name"].lower() in text_lower:
            return key
        for brand in comp["key_brands"]:
            if brand.lower() in text_lower:
                return key
    return None


def get_competitor_context(key: str) -> str:
    """Get formatted context string for a competitor."""
    comp = COMPETITORS.get(key.lower())
    if not comp:
        return ""
    return f"""
Competitor: {comp['name']} ({comp['ticker']})
Description: {comp['description']}
Key Brands: {', '.join(comp['key_brands'])}
Overlap with General Mills: {', '.join(comp['overlap_categories'])}
Typical Strategic Moves: {', '.join(comp['typical_moves'])}
"""
