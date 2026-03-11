# Data Collection Pipeline

## Purpose

Collector modules gather raw content from configured sources on a scheduled cadence. Each collector is source-type-specific (RSS, web scrape, API) and produces a normalized raw content record.

## Source Types and Implementations

### RSS Collector
Parses RSS/Atom feeds. Used for trade press, competitor newsrooms, and SEC EDGAR. Implementation: Python `feedparser` library. For each feed entry, store the title, link, published date, and full content (or summary if content unavailable). Handle malformed feeds gracefully — log the error, skip the entry, continue.

### Web Scraper
Fetches and extracts article content from web pages. Used when RSS is unavailable or insufficient. Implementation: `httpx` for HTTP requests, `BeautifulSoup` for HTML parsing. For JavaScript-heavy sites, use Playwright with headless Chromium. Extract: article title, body text, publication date, author. Strip navigation, ads, and boilerplate.

### API Collector
Calls structured APIs. Used for PubMed (Entrez API), SEC EDGAR (EDGAR full-text search API), and potentially retailer product feeds. Implementation: `httpx` with structured response parsing.

## MVP Source List

### Tier 1 Competitor Newsrooms (RSS, every 6 hours)
- Conagra Brands: https://www.conagrabrands.com/news-room (RSS or scrape)
- Kraft Heinz: https://news.kraftheinzcompany.com/ (RSS or scrape)
- Nestlé: https://www.nestle.com/media/news (RSS)
- PepsiCo: https://www.pepsico.com/our-stories/press-release (RSS or scrape)
- Mondelez: https://www.mondelezinternational.com/news/ (RSS or scrape)
- J.M. Smucker: https://www.jmsmucker.com/news (RSS or scrape)
- Hormel Foods: https://www.hormelfoods.com/newsroom/ (RSS or scrape)
- Mars: https://www.mars.com/news-and-stories (RSS or scrape)

### Trade Press (RSS, every 6 hours)
- Food Dive: https://www.fooddive.com/feeds/news/
- Food Navigator-USA: RSS feed
- Food Business News: RSS feed
- Progressive Grocer: RSS feed
- Mass Market Retailers: RSS feed

### Earnings & Strategy (Structured scrape + API, weekly + event-driven)
- SEC EDGAR 8-K filings for tracked CIK numbers (Conagra, Kraft Heinz, Hormel, Smucker, Mondelez, Campbell's)
- Seeking Alpha earnings transcripts for tracked tickers (CAG, KHC, HRL, SJM, MDLZ, CPB, GIS, PEP, NSRGY)
- Competitor investor relations pages for new presentations

### Science (API, weekly)
- PubMed: Entrez API with keyword alerts for "protein fortification", "food fiber", "GLP-1 food", "clean label", "precision fermentation"
- Google Scholar: Configured alerts via RSS bridge

### Technology (RSS, daily)
- TechCrunch food/CPG tag: RSS
- Consumer Goods Technology: RSS

## Deduplication

Before storing any raw content, compute a SHA-256 hash of the normalized content body. If the hash already exists in the database, skip the item. This prevents storing duplicate articles that appear across multiple sources.

## Content Normalization

Every collected item is stored as a `RawContent` record with these fields:
- `id`: UUID, auto-generated
- `source_id`: FK to the source configuration
- `url`: Original URL of the content
- `title`: Article/entry title
- `body`: Full text content (cleaned of HTML)
- `published_at`: Publication date (parsed from source, nullable)
- `collected_at`: Timestamp of collection
- `content_hash`: SHA-256 of normalized body text
- `metadata`: JSON blob for source-specific fields (author, tags, etc.)

## Scheduling

Use APScheduler (in-process) with the following cadences:
- Tier 1 newsrooms: every 6 hours (0:00, 6:00, 12:00, 18:00 CT)
- Trade press RSS: every 6 hours (offset by 1 hour from newsrooms)
- SEC EDGAR: daily at 10:00 PM CT
- PubMed: weekly on Sunday at 2:00 AM CT
- Tech press: daily at 8:00 AM CT
- Competitor IR pages: weekly on Saturday at 2:00 AM CT

## Error Handling

If a collector fails (network error, parsing error, rate limit), log the error with source_id, error type, and timestamp. Do not retry immediately — wait for the next scheduled run. If a source fails 3 consecutive times, mark it as `unhealthy` in the source configuration table and surface this in the admin UI.

## Rate Limiting

Respect robots.txt for all scraped sources. Add a minimum 2-second delay between requests to the same domain. For API sources (PubMed, EDGAR), respect documented rate limits.
