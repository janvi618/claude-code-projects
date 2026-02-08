"""
Competitor Profiles for General Mills

Defines key competitors with context about their business,
key brands, and what to watch for.
"""

COMPANY = {
    "name": "General Mills",
    "description": "Global food company with leading brands in cereals, snacks, meals, yogurt, and baking products",
    "key_brands": ["Cheerios", "Nature Valley", "Yoplait", "Häagen-Dazs", "Betty Crocker", "Pillsbury", "Blue Buffalo"],
    "key_categories": ["Breakfast cereals", "Snack bars", "Yogurt", "Frozen foods", "Baking products", "Pet food"]
}

COMPETITORS = {
    "kelloggs": {
        "name": "Kellogg's / Kellanova",
        "ticker": "K",
        "description": "Major cereal and snack company. Recently split into Kellanova (snacks/international) and WK Kellogg Co (cereals).",
        "key_brands": ["Frosted Flakes", "Pringles", "Cheez-It", "Pop-Tarts", "Eggo", "Rice Krispies", "Special K"],
        "overlap_categories": ["Breakfast cereals", "Snack bars", "Frozen breakfast"],
        "watch_for": ["Cereal innovation", "Snack expansion", "Health/wellness positioning", "Post-split strategy"]
    },

    "post_holdings": {
        "name": "Post Holdings",
        "ticker": "POST",
        "description": "Third-largest cereal company in US. Also in refrigerated foods and food service.",
        "key_brands": ["Honey Bunches of Oats", "Grape-Nuts", "Pebbles", "Great Grains", "Malt-O-Meal", "Peter Pan"],
        "overlap_categories": ["Breakfast cereals", "Peanut butter"],
        "watch_for": ["Value/private label moves", "Acquisitions", "Cereal category innovation"]
    },

    "pepsico": {
        "name": "PepsiCo (Quaker)",
        "ticker": "PEP",
        "description": "Food and beverage giant. Quaker division competes in breakfast and snacks.",
        "key_brands": ["Quaker Oats", "Cap'n Crunch", "Life Cereal", "Quaker Chewy", "Aunt Jemima/Pearl Milling"],
        "overlap_categories": ["Breakfast cereals", "Oatmeal", "Snack bars", "Pancake/syrup"],
        "watch_for": ["Health positioning", "Oat-based innovation", "Snack bar competition"]
    },

    "conagra": {
        "name": "Conagra Brands",
        "ticker": "CAG",
        "description": "Major packaged foods company strong in frozen foods, snacks, and condiments.",
        "key_brands": ["Healthy Choice", "Marie Callender's", "Birds Eye", "Slim Jim", "Reddi-wip", "Hunt's", "Orville Redenbacher's"],
        "overlap_categories": ["Frozen meals", "Snacks", "Baking"],
        "watch_for": ["Frozen innovation", "Health/wellness trends", "Snack expansion"]
    },

    "nestle": {
        "name": "Nestlé",
        "ticker": "NSRGY",
        "description": "World's largest food company. Broad portfolio overlaps in multiple categories.",
        "key_brands": ["Stouffer's", "DiGiorno", "Hot Pockets", "Toll House", "Coffee-Mate", "Purina"],
        "overlap_categories": ["Frozen foods", "Baking", "Pet food"],
        "watch_for": ["Pet food competition (vs Blue Buffalo)", "Frozen pizza/meals", "Health & wellness"]
    }
}


def get_competitor(key: str) -> dict:
    """Get a specific competitor profile."""
    return COMPETITORS.get(key.lower())


def get_all_competitors() -> dict:
    """Get all competitor profiles."""
    return COMPETITORS


def get_competitor_names() -> list:
    """Get list of competitor display names."""
    return [c["name"] for c in COMPETITORS.values()]


def get_competitor_context(key: str) -> str:
    """Get formatted context string for a competitor."""
    comp = COMPETITORS.get(key.lower())
    if not comp:
        return ""

    return f"""
Company: {comp['name']} ({comp['ticker']})
Description: {comp['description']}
Key Brands: {', '.join(comp['key_brands'])}
Categories that overlap with General Mills: {', '.join(comp['overlap_categories'])}
Key things to watch: {', '.join(comp['watch_for'])}
"""


def get_all_competitors_context() -> str:
    """Get formatted context for all competitors."""
    contexts = []
    for key in COMPETITORS:
        contexts.append(get_competitor_context(key))
    return "\n---\n".join(contexts)
