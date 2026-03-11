-- SCOUT PostgreSQL Schema
-- PostgreSQL 16 with pgvector extension
-- All timestamps stored as TIMESTAMPTZ in UTC
-- All primary keys are UUIDs generated via gen_random_uuid()

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── competitors ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS competitors (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    ticker              VARCHAR(10),
    tier                INTEGER     NOT NULL CHECK (tier IN (1, 2, 3)),
    aliases             JSONB       NOT NULL DEFAULT '[]',
    monitoring_keywords JSONB       NOT NULL DEFAULT '[]',
    enabled             BOOLEAN     NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── sources ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sources (
    id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name                 VARCHAR(200) NOT NULL,
    source_type          VARCHAR(20)  NOT NULL CHECK (source_type IN ('rss', 'scrape', 'api')),
    url                  VARCHAR(2000) NOT NULL,
    cadence_minutes      INTEGER      NOT NULL,
    competitor_id        UUID         REFERENCES competitors(id) ON DELETE SET NULL,
    enabled              BOOLEAN      NOT NULL DEFAULT true,
    healthy              BOOLEAN      NOT NULL DEFAULT true,
    consecutive_failures INTEGER      NOT NULL DEFAULT 0,
    last_collected_at    TIMESTAMPTZ,
    config_json          JSONB        NOT NULL DEFAULT '{}',
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ─── raw_content ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS raw_content (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id    UUID          NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    url          VARCHAR(2000),
    title        VARCHAR(1000),
    body         TEXT,
    published_at TIMESTAMPTZ,
    collected_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
    content_hash VARCHAR(64)   NOT NULL UNIQUE,
    metadata     JSONB         NOT NULL DEFAULT '{}',
    processed    BOOLEAN       NOT NULL DEFAULT false
);

-- ─── intelligence_items ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS intelligence_items (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_content_id      UUID         NOT NULL REFERENCES raw_content(id) ON DELETE CASCADE,
    headline            VARCHAR(200) NOT NULL,
    summary             TEXT,
    companies           JSONB        NOT NULL DEFAULT '[]',
    brands              JSONB        NOT NULL DEFAULT '[]',
    categories          JSONB        NOT NULL DEFAULT '[]',
    domain              VARCHAR(50)  NOT NULL,
    claims              JSONB        NOT NULL DEFAULT '[]',
    sentiment           VARCHAR(20),
    strategic_relevance TEXT,
    relevance_score     INTEGER      NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 100),
    embedding           VECTOR(1536),
    source_url          VARCHAR(2000),
    source_name         VARCHAR(200),
    published_at        TIMESTAMPTZ,
    processed_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    alerted             BOOLEAN      NOT NULL DEFAULT false
);

-- ─── daily_briefs ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_briefs (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_date          DATE    NOT NULL UNIQUE,
    content_html        TEXT    NOT NULL,
    content_text        TEXT,
    item_ids            JSONB   NOT NULL DEFAULT '[]',
    word_count          INTEGER,
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    delivered_at        TIMESTAMPTZ,
    model_used          VARCHAR(100),
    token_count_input   INTEGER,
    token_count_output  INTEGER
);

-- ─── users ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(320) NOT NULL UNIQUE,
    role          VARCHAR(20)  NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
    receive_brief BOOLEAN      NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ─── context_documents ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS context_documents (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    key        VARCHAR(100) NOT NULL UNIQUE,
    content    TEXT         NOT NULL,
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ─── llm_usage ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS llm_usage (
    id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp         TIMESTAMPTZ    NOT NULL DEFAULT now(),
    provider          VARCHAR(50)    NOT NULL,
    model             VARCHAR(100)   NOT NULL,
    task_type         VARCHAR(100)   NOT NULL,
    input_tokens      INTEGER        NOT NULL DEFAULT 0,
    output_tokens     INTEGER        NOT NULL DEFAULT 0,
    estimated_cost_usd NUMERIC(10,6) NOT NULL DEFAULT 0
);

-- ─── sessions (NextAuth) ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
    id            VARCHAR      PRIMARY KEY,
    session_token VARCHAR      NOT NULL UNIQUE,
    user_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires       TIMESTAMPTZ  NOT NULL
);

-- ─── verification_tokens (NextAuth magic links) ──────────────────────────────

CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR     NOT NULL,
    token      VARCHAR     NOT NULL,
    expires    TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_intelligence_items_score
    ON intelligence_items (relevance_score DESC);

CREATE INDEX IF NOT EXISTS idx_intelligence_items_processed_at
    ON intelligence_items (processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_intelligence_items_companies
    ON intelligence_items USING GIN (companies);

CREATE INDEX IF NOT EXISTS idx_intelligence_items_domain
    ON intelligence_items (domain);

CREATE INDEX IF NOT EXISTS idx_intelligence_items_embedding
    ON intelligence_items USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_raw_content_hash
    ON raw_content (content_hash);

CREATE INDEX IF NOT EXISTS idx_raw_content_processed
    ON raw_content (processed) WHERE processed = false;

CREATE INDEX IF NOT EXISTS idx_daily_briefs_date
    ON daily_briefs (brief_date DESC);

CREATE INDEX IF NOT EXISTS idx_sources_competitor
    ON sources (competitor_id);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id
    ON sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_llm_usage_timestamp
    ON llm_usage (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_llm_usage_provider
    ON llm_usage (provider, timestamp DESC);
