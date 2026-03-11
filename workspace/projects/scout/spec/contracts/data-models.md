# Data Models Contract

## PostgreSQL Schema

All tables use UUID primary keys (generated via `gen_random_uuid()`). All timestamps are stored as `TIMESTAMPTZ` in UTC. The database must have the `pgvector` extension enabled.

### competitors
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| name | VARCHAR(200) | NOT NULL |
| ticker | VARCHAR(10) | |
| tier | INTEGER | NOT NULL, CHECK (tier IN (1, 2, 3)) |
| aliases | JSONB | DEFAULT '[]' |
| monitoring_keywords | JSONB | DEFAULT '[]' |
| enabled | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### sources
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(200) | NOT NULL |
| source_type | VARCHAR(20) | NOT NULL, CHECK (source_type IN ('rss', 'scrape', 'api')) |
| url | VARCHAR(2000) | NOT NULL |
| cadence_minutes | INTEGER | NOT NULL |
| competitor_id | UUID | FK → competitors(id), NULLABLE |
| enabled | BOOLEAN | DEFAULT true |
| healthy | BOOLEAN | DEFAULT true |
| consecutive_failures | INTEGER | DEFAULT 0 |
| last_collected_at | TIMESTAMPTZ | |
| config_json | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### raw_content
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| source_id | UUID | FK → sources(id), NOT NULL |
| url | VARCHAR(2000) | |
| title | VARCHAR(1000) | |
| body | TEXT | |
| published_at | TIMESTAMPTZ | |
| collected_at | TIMESTAMPTZ | DEFAULT now() |
| content_hash | VARCHAR(64) | UNIQUE, NOT NULL |
| metadata | JSONB | DEFAULT '{}' |
| processed | BOOLEAN | DEFAULT false |

### intelligence_items
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| raw_content_id | UUID | FK → raw_content(id), NOT NULL |
| headline | VARCHAR(200) | NOT NULL |
| summary | TEXT | |
| companies | JSONB | DEFAULT '[]' |
| brands | JSONB | DEFAULT '[]' |
| categories | JSONB | DEFAULT '[]' |
| domain | VARCHAR(50) | NOT NULL |
| claims | JSONB | DEFAULT '[]' |
| sentiment | VARCHAR(20) | |
| strategic_relevance | TEXT | |
| relevance_score | INTEGER | NOT NULL, CHECK (0 <= relevance_score AND relevance_score <= 100) |
| embedding | VECTOR(1536) | |
| source_url | VARCHAR(2000) | |
| source_name | VARCHAR(200) | |
| published_at | TIMESTAMPTZ | |
| processed_at | TIMESTAMPTZ | DEFAULT now() |
| alerted | BOOLEAN | DEFAULT false |

### daily_briefs
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| brief_date | DATE | UNIQUE, NOT NULL |
| content_html | TEXT | NOT NULL |
| content_text | TEXT | |
| item_ids | JSONB | DEFAULT '[]' |
| word_count | INTEGER | |
| generated_at | TIMESTAMPTZ | DEFAULT now() |
| delivered_at | TIMESTAMPTZ | |
| model_used | VARCHAR(100) | |
| token_count_input | INTEGER | |
| token_count_output | INTEGER | |

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| email | VARCHAR(320) | UNIQUE, NOT NULL |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'viewer', CHECK (role IN ('admin', 'viewer')) |
| receive_brief | BOOLEAN | DEFAULT true |
| last_login_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### context_documents
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| key | VARCHAR(100) | UNIQUE, NOT NULL |
| content | TEXT | NOT NULL |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

## Required Indexes

```sql
CREATE INDEX idx_intelligence_items_score ON intelligence_items (relevance_score DESC);
CREATE INDEX idx_intelligence_items_processed_at ON intelligence_items (processed_at DESC);
CREATE INDEX idx_intelligence_items_companies ON intelligence_items USING GIN (companies);
CREATE INDEX idx_intelligence_items_domain ON intelligence_items (domain);
CREATE INDEX idx_intelligence_items_embedding ON intelligence_items USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_raw_content_hash ON raw_content (content_hash);
CREATE INDEX idx_raw_content_processed ON raw_content (processed) WHERE processed = false;
CREATE INDEX idx_daily_briefs_date ON daily_briefs (brief_date DESC);
```
