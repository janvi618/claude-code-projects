"""
Seed script for SCOUT.
Run once after database initialization to populate:
  - Tier 1 competitors
  - Trade press + competitor RSS/scrape sources
  - General Mills context document
  - Admin user placeholder

Usage:
  python3 seed.py
  # or with custom admin email:
  ADMIN_EMAIL=admin@generalmills.com python3 seed.py
"""

import asyncio
import logging
import os
import sys

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


# ─── Competitor data ──────────────────────────────────────────────────────────

TIER1_COMPETITORS = [
    {
        "name": "Conagra Brands",
        "ticker": "CAG",
        "tier": 1,
        "aliases": ["Conagra", "ConAgra"],
        "monitoring_keywords": ["Conagra", "Birds Eye", "Healthy Choice", "Marie Callender", "Slim Jim", "Vlasic", "Hunt's"],
    },
    {
        "name": "Kraft Heinz",
        "ticker": "KHC",
        "tier": 1,
        "aliases": ["Kraft", "Heinz", "KraftHeinz"],
        "monitoring_keywords": ["Kraft Heinz", "Kraft", "Heinz", "Oscar Mayer", "Philadelphia", "Jell-O", "Maxwell House"],
    },
    {
        "name": "Nestlé",
        "ticker": "NSRGY",
        "tier": 1,
        "aliases": ["Nestle", "Nestlé S.A."],
        "monitoring_keywords": ["Nestlé", "Nestle", "Nescafé", "KitKat", "Maggi", "Stouffer's", "Lean Cuisine"],
    },
    {
        "name": "PepsiCo",
        "ticker": "PEP",
        "tier": 1,
        "aliases": ["Pepsi", "PepsiCo Inc"],
        "monitoring_keywords": ["PepsiCo", "Frito-Lay", "Quaker", "Tropicana", "Gatorade", "Cheetos", "Doritos", "Lay's"],
    },
    {
        "name": "Mondelez",
        "ticker": "MDLZ",
        "tier": 1,
        "aliases": ["Mondelēz", "Mondelez International"],
        "monitoring_keywords": ["Mondelez", "Mondelēz", "Oreo", "Cadbury", "Toblerone", "Triscuit", "Wheat Thins", "belVita"],
    },
    {
        "name": "J.M. Smucker",
        "ticker": "SJM",
        "tier": 1,
        "aliases": ["Smucker", "Smucker's", "JM Smucker"],
        "monitoring_keywords": ["Smucker", "Jif", "Folgers", "Dunkin'", "Meow Mix", "Milk-Bone", "Kibbles 'n Bits"],
    },
    {
        "name": "Hormel Foods",
        "ticker": "HRL",
        "tier": 1,
        "aliases": ["Hormel"],
        "monitoring_keywords": ["Hormel", "SPAM", "Applegate", "Jennie-O", "Justin's", "Wholly Guacamole"],
    },
    {
        "name": "Mars",
        "ticker": None,
        "tier": 1,
        "aliases": ["Mars Inc", "Mars Incorporated"],
        "monitoring_keywords": ["Mars", "M&M's", "Snickers", "Twix", "Ben's Original", "Pedigree", "Whiskas", "Royal Canin"],
    },
]

TIER2_COMPETITORS = [
    {
        "name": "Campbell's",
        "ticker": "CPB",
        "tier": 2,
        "aliases": ["Campbell Soup", "Campbells"],
        "monitoring_keywords": ["Campbell's", "Campbell Soup", "Pepperidge Farm", "V8", "Swanson"],
    },
    {
        "name": "Kellogg's / WK Kellogg",
        "ticker": "KLG",
        "tier": 2,
        "aliases": ["Kellogg", "WK Kellogg", "Kellogg's"],
        "monitoring_keywords": ["Kellogg", "Special K", "Frosted Flakes", "Cheez-It", "Pringles"],
    },
    {
        "name": "Unilever",
        "ticker": "UL",
        "tier": 2,
        "aliases": [],
        "monitoring_keywords": ["Unilever", "Ben & Jerry's", "Knorr", "Hellmann's", "Magnum"],
    },
]


# ─── Source data ──────────────────────────────────────────────────────────────

TRADE_PRESS_SOURCES = [
    {
        "name": "Food Dive",
        "source_type": "rss",
        "url": "https://www.fooddive.com/feeds/news/",
        "cadence_minutes": 360,
        "config_json": {"category": "trade_press"},
    },
    {
        "name": "Food Navigator USA",
        "source_type": "rss",
        "url": "https://www.foodnavigator-usa.com/rss/topic/Latest-News",
        "cadence_minutes": 360,
        "config_json": {"category": "trade_press"},
    },
    {
        "name": "Food Business News",
        "source_type": "rss",
        "url": "https://www.foodbusinessnews.net/rss/topic/Latest-News",
        "cadence_minutes": 360,
        "config_json": {"category": "trade_press"},
    },
    {
        "name": "Progressive Grocer",
        "source_type": "rss",
        "url": "https://progressivegrocer.com/rss.xml",
        "cadence_minutes": 360,
        "config_json": {"category": "trade_press"},
    },
]

TECH_PRESS_SOURCES = [
    {
        "name": "TechCrunch Food/CPG",
        "source_type": "rss",
        "url": "https://techcrunch.com/tag/food/feed/",
        "cadence_minutes": 1440,
        "config_json": {"category": "tech_press"},
    },
    {
        "name": "Consumer Goods Technology",
        "source_type": "rss",
        "url": "https://www.consumergoods.com/rss.xml",
        "cadence_minutes": 1440,
        "config_json": {"category": "tech_press"},
    },
]

COMPETITOR_NEWSROOM_URLS = {
    "Conagra Brands": ("https://www.conagrabrands.com/news-room/rss", "rss"),
    "Kraft Heinz": ("https://news.kraftheinzcompany.com/rss/news_releases.rss", "rss"),
    "Nestlé": ("https://www.nestle.com/rss/news", "rss"),
    "PepsiCo": ("https://www.pepsico.com/news/press-releases/rss", "rss"),
    "Mondelez": ("https://ir.mondelezinternational.com/rss/news-releases.xml", "rss"),
    "J.M. Smucker": ("https://investors.jmsmucker.com/rss/news-releases.xml", "rss"),
    "Hormel Foods": ("https://www.hormelfoods.com/rss/news.xml", "rss"),
    "Mars": ("https://www.mars.com/news-and-stories/rss", "rss"),
}

SCIENCE_SOURCES = [
    {
        "name": "PubMed: Protein Fortification & Food Innovation",
        "source_type": "api",
        "url": "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/",
        "cadence_minutes": 10080,  # Weekly
        "config_json": {
            "api_type": "pubmed",
            "keywords": [
                "protein fortification",
                "food fiber",
                "GLP-1 food",
                "clean label food",
                "precision fermentation",
            ],
            "days_back": 7,
        },
    },
]

EDGAR_SOURCES = [
    {"company": name, "cik": cik}
    for name, cik in [
        ("Conagra", "0000023217"),
        ("Kraft Heinz", "0001637459"),
        ("Hormel", "0000048102"),
        ("Smucker", "0000091419"),
        ("Mondelez", "0001103982"),
        ("Campbells", "0000016160"),
    ]
]


# ─── GM Context document ──────────────────────────────────────────────────────

GM_CONTEXT = """# General Mills Competitive Intelligence Context

## Company Overview
General Mills (GIS) is a leading global manufacturer and marketer of branded consumer foods. Following the divestiture of certain international operations, General Mills focuses on its core North American and international businesses.

## Post-Divestiture Portfolio (as of 2025)
**Core North America Retail Categories:**
- Cereals: Cheerios, Lucky Charms, Wheaties, Cinnamon Toast Crunch, Total, Raisin Bran
- Snack Bars: Nature Valley, Fiber One, Larabar
- Meals & Soups: Progresso, Betty Crocker, Helper
- Baking: Pillsbury, Betty Crocker, Gold Medal
- Mexican Food: Old El Paso
- Frozen Dough: Pillsbury, Totino's, Jeno's
- Ice Cream: Häagen-Dazs (international), Drumstick, Yoplait (joint venture)
- Fruit Snacks: Fruit Roll-Ups, Gushers, Fruit by the Foot
- Pet Food: Blue Buffalo (largest segment by growth)

## CAGNY 2026 Innovation Priorities
1. **Bold Flavors**: Pushing beyond traditional flavor profiles in all core categories. LTO and permanent additions targeting younger consumers and multicultural households.
2. **Familiar Favorites**: Renovation of heritage brands. Restoring consumer confidence in core products while adding convenience and modern formats.
3. **Better-for-You**: Protein fortification across the portfolio, fiber enhancement, clean label reformulations. Responding to GLP-1 diet trends and heightened health consciousness.

## Strategic Watch Items (FY2025-2026)
- **Pet food competition**: Blue Buffalo facing intensified competition from Smucker (Nutrish), Mars (Royal Canin/Pedigree), and private label gains at Costco/Chewy.
- **Protein bar wars**: Nature Valley vs. Kind (Mars), RXBar (Kellogg's), Quest. Protein content arms race.
- **Cereal category defense**: Core cereal share under pressure from yogurt, overnight oats, and protein bars as breakfast alternatives.
- **AI and supply chain**: CAGNY 2026 highlighted AI divergence — companies investing now vs. laggards. Key areas: demand forecasting, trade promotion optimization, personalization.
- **Better-for-you snacks**: Pilsbury's Hot Pockets reformulation. Replacing artificial ingredients.
- **Häagen-Dazs**: Competing with Ben & Jerry's (Unilever) and emerging better-for-you brands in super-premium ice cream.

## Tier 1 Competitors (Highest Monitoring Priority)
- Conagra Brands (CAG): Strongest direct overlap in frozen meals, snacks, protein
- Kraft Heinz (KHC): Meals, condiments, adjacent categories
- Nestlé (NSRGY): Global CPG, pet food, ice cream, frozen
- PepsiCo (PEP): Snacks through Frito-Lay, Quaker cereals and snack bars (direct overlap)
- Mondelez (MDLZ): Snack bars, biscuits, adjacent snacking
- J.M. Smucker (SJM): Pet food (primary threat to Blue Buffalo), spreads, coffee
- Hormel (HRL): Protein-focused innovation, snacking
- Mars: Snacks, confectionery, pet food (Royal Canin)

## Category Scoring Guidance
When evaluating competitive intelligence:
- 90-100: Direct threat/opportunity in core categories (cereal, pet food, snack bars, frozen meals)
- 70-89: Significant development in adjacent category or major competitor strategic move
- 50-69: Industry trend with potential portfolio impact
- 30-49: Informational, tangentially related
- 0-29: Not relevant to General Mills' competitive position
"""


# ─── Seed function ────────────────────────────────────────────────────────────

async def seed():
    """Main seed function."""
    from database import AsyncSessionLocal
    from models.competitor import Competitor
    from models.source import Source
    from models.user import User
    from models.context_document import ContextDocument
    from sqlalchemy import select

    logger.info("Starting database seed...")

    async with AsyncSessionLocal() as db:

        # 1. Seed competitors
        logger.info("Seeding competitors...")
        all_competitors = TIER1_COMPETITORS + TIER2_COMPETITORS
        competitor_map: dict[str, Competitor] = {}

        for comp_data in all_competitors:
            existing = await db.execute(
                select(Competitor).where(Competitor.name == comp_data["name"])
            )
            existing = existing.scalar_one_or_none()
            if not existing:
                comp = Competitor(**comp_data)
                db.add(comp)
                await db.flush()
                competitor_map[comp_data["name"]] = comp
                logger.info("  Added competitor: %s", comp_data["name"])
            else:
                competitor_map[comp_data["name"]] = existing
                logger.info("  Competitor already exists: %s", comp_data["name"])

        # 2. Seed trade press sources
        logger.info("Seeding trade press sources...")
        for src_data in TRADE_PRESS_SOURCES + TECH_PRESS_SOURCES:
            existing = await db.execute(
                select(Source).where(Source.url == src_data["url"])
            )
            if not existing.scalar_one_or_none():
                src = Source(**src_data)
                db.add(src)
                logger.info("  Added source: %s", src_data["name"])

        # 3. Seed competitor newsroom sources
        logger.info("Seeding competitor newsroom sources...")
        for comp_name, (url, src_type) in COMPETITOR_NEWSROOM_URLS.items():
            existing = await db.execute(select(Source).where(Source.url == url))
            if not existing.scalar_one_or_none():
                comp = competitor_map.get(comp_name)
                src = Source(
                    name=f"{comp_name} Newsroom",
                    source_type=src_type,
                    url=url,
                    cadence_minutes=360,
                    competitor_id=comp.id if comp else None,
                    config_json={"category": "competitor_newsroom"},
                )
                db.add(src)
                logger.info("  Added newsroom: %s", comp_name)

        # 4. Seed science sources
        logger.info("Seeding science sources...")
        for src_data in SCIENCE_SOURCES:
            existing = await db.execute(select(Source).where(Source.name == src_data["name"]))
            if not existing.scalar_one_or_none():
                src = Source(**src_data)
                db.add(src)
                logger.info("  Added science source: %s", src_data["name"])

        # 5. Seed EDGAR sources
        logger.info("Seeding SEC EDGAR sources...")
        for edgar in EDGAR_SOURCES:
            name = f"SEC EDGAR 8-K: {edgar['company']}"
            existing = await db.execute(select(Source).where(Source.name == name))
            if not existing.scalar_one_or_none():
                src = Source(
                    name=name,
                    source_type="api",
                    url="https://www.sec.gov/cgi-bin/browse-edgar",
                    cadence_minutes=1440,
                    config_json={"api_type": "sec_edgar", **edgar},
                )
                db.add(src)
                logger.info("  Added EDGAR source: %s", name)

        # 6. Seed GM context document
        logger.info("Seeding GM context document...")
        existing_ctx = await db.execute(
            select(ContextDocument).where(ContextDocument.key == "gm_context")
        )
        if not existing_ctx.scalar_one_or_none():
            ctx = ContextDocument(key="gm_context", content=GM_CONTEXT)
            db.add(ctx)
            logger.info("  Added GM context document")
        else:
            logger.info("  GM context document already exists")

        # 7. Seed admin user
        admin_email = os.environ.get("ADMIN_EMAIL")
        if admin_email:
            logger.info("Seeding admin user: %s", admin_email)
            existing_user = await db.execute(
                select(User).where(User.email == admin_email)
            )
            if not existing_user.scalar_one_or_none():
                admin_user = User(email=admin_email, role="admin", receive_brief=True)
                db.add(admin_user)
                logger.info("  Added admin user (email masked)")
            else:
                logger.info("  Admin user already exists")
        else:
            logger.info("  ADMIN_EMAIL not set — skipping admin user creation")

        await db.commit()

    logger.info("Database seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
