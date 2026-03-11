# Admin & Configuration

## Admin Dashboard (Route: /admin)

Accessible only to users with `admin` role. Four sections:

### Sources Management
Table of all configured sources showing: name, type (RSS/scrape/API), URL, cadence, status (healthy/unhealthy/disabled), last collected timestamp, items collected (last 7 days). Actions: enable/disable toggle, "Test Now" button (triggers one collection cycle), edit URL/cadence. Add new source form: name, type, URL, cadence dropdown, competitor association.

### Users Management
Table of all users: email, role (admin/viewer), receive_brief toggle, last login. Actions: invite new user (sends magic link), change role, remove user.

### API Keys
Display which API keys are configured (masked, show last 4 characters). Test button that makes a minimal API call to verify the key works. Fields for: Anthropic, OpenAI, Google Gemini. Keys stored encrypted in the database (AES-256, encryption key from environment variable).

### System Health
- Collection stats: items collected today, this week, this month
- Processing stats: items processed, average extraction time, average scoring time
- LLM cost tracker: estimated cost by provider (today, this week, this month), calculated from token counts and published pricing
- Brief delivery stats: last brief date, delivery success count
- Source health: count of healthy/unhealthy/disabled sources
- Database size: row counts for raw_content and intelligence_items tables

## Configuration Database

### sources table
```
id: UUID (PK)
name: VARCHAR(200)
source_type: VARCHAR(20) (rss, scrape, api)
url: VARCHAR(2000)
cadence_minutes: INTEGER
competitor_id: UUID (FK, nullable)
enabled: BOOLEAN (default true)
healthy: BOOLEAN (default true)
consecutive_failures: INTEGER (default 0)
last_collected_at: TIMESTAMP
config_json: JSONB (source-type-specific config)
created_at: TIMESTAMP
```

### users table
```
id: UUID (PK)
email: VARCHAR(320) (unique)
role: VARCHAR(20) (admin, viewer)
receive_brief: BOOLEAN (default true)
last_login_at: TIMESTAMP
created_at: TIMESTAMP
```

### competitors table
```
id: UUID (PK)
name: VARCHAR(200)
ticker: VARCHAR(10)
tier: INTEGER (1, 2, 3)
aliases: JSONB (array of alternate names for entity resolution)
monitoring_keywords: JSONB (array of keywords)
enabled: BOOLEAN (default true)
```

## General Mills Context Document

A markdown document stored in the database (or a dedicated table) that provides General Mills-specific context to all LLM prompts. Editable by admins via a rich text editor in the admin UI. Default content includes:
- Post-divestiture portfolio summary
- CAGNY 2026 innovation priorities
- Core category list with market position context
- Known competitive threats and watch items

This document is injected into extraction and scoring prompts as system context.
