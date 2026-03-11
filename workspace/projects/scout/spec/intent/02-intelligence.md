# Intelligence Extraction & Scoring

## Purpose

Transform raw collected content into structured intelligence items with relevance scores. This is the core AI processing layer — every raw article becomes a structured, tagged, scored item in the knowledge base.

## Pipeline: Raw Content → Intelligence Item

For each new `RawContent` record, run the following two-step pipeline.

### Step 1: Extraction (Claude Sonnet 4)

Send the raw content body to Claude Sonnet with a structured extraction prompt. The prompt must instruct the model to return a JSON object with these fields:

- `headline`: One-line summary of the intelligence (max 120 characters)
- `summary`: 2-3 sentence summary of the key intelligence
- `companies`: Array of company names mentioned (normalized to canonical names from the competitor list)
- `brands`: Array of brand names mentioned
- `categories`: Array of General Mills category tags from the enumerated list: cereal, snack_bars, pet_food, ice_cream, mexican_food, dough, meals_soup, baking, hot_snacks_frozen, fruit_snacks, beverages, other
- `domain`: One of: new_products, technology_digital, science_trends, earnings_strategy, leadership, other
- `claims`: Array of specific factual claims extracted (e.g., "Conagra launched Birds Eye Protein Bowls with 25g protein")
- `sentiment`: One of: positive, negative, neutral (from General Mills' competitive perspective)
- `strategic_relevance`: Brief explanation of why this matters to General Mills (1-2 sentences)

The extraction prompt must include General Mills context: the post-divestiture portfolio, the CAGNY 2026 innovation priorities (bold flavors, familiar favorites, better-for-you), and the Tier 1 competitor list.

If the model cannot extract meaningful intelligence (e.g., the content is a generic corporate press release with no competitive signal), it should return `domain: "other"` and leave `strategic_relevance` empty. These items are stored but not surfaced.

### Step 2: Relevance Scoring (Gemini 2.0 Flash)

Send the extracted intelligence item (headline, summary, companies, categories, domain, strategic_relevance) to Gemini Flash with a scoring prompt. The prompt instructs the model to return a single integer score from 0-100 representing how relevant this item is to General Mills' Chief Innovation Officer.

Scoring guidelines embedded in the prompt:
- 90-100: Direct competitive threat or opportunity in a core General Mills category. Requires immediate awareness.
- 70-89: Significant competitive activity or trend that affects General Mills' strategic positioning.
- 50-69: Relevant industry development worth tracking. Not urgent but contributes to situational awareness.
- 30-49: Tangentially related. May be useful context but not directly actionable.
- 0-29: Not relevant to General Mills' competitive position. Archive only.

Items scoring below 40 are stored but not surfaced in the dashboard or briefs. Items scoring 85+ trigger an immediate email alert to configured recipients.

## Embedding Generation (OpenAI text-embedding-3-small)

After extraction and scoring, generate a vector embedding of the concatenation of `headline + summary + strategic_relevance`. Store the embedding in the pgvector column of the intelligence_items table. This enables semantic search in the Research Chat.

## Intelligence Item Data Model

```
intelligence_items:
  id: UUID (PK)
  raw_content_id: UUID (FK → raw_content)
  headline: VARCHAR(200)
  summary: TEXT
  companies: JSONB (array of strings)
  brands: JSONB (array of strings)
  categories: JSONB (array of category enum values)
  domain: VARCHAR(50) (enum)
  claims: JSONB (array of strings)
  sentiment: VARCHAR(20) (enum)
  strategic_relevance: TEXT
  relevance_score: INTEGER (0-100)
  embedding: VECTOR(1536) (pgvector)
  source_url: VARCHAR(2000)
  source_name: VARCHAR(200)
  published_at: TIMESTAMP
  processed_at: TIMESTAMP
  alerted: BOOLEAN (default false)
```

## Batch Processing

Extraction and scoring run in batch after each collection cycle completes. Process items sequentially with a 1-second delay between LLM calls to avoid rate limits. Log the processing time and token count for each item for cost tracking.

## Cost Optimization

- Gemini Flash handles scoring at ~$0.001 per item. This is the bulk of the processing volume.
- Claude Sonnet handles extraction at ~$0.01-0.03 per item. Use only for new, unprocessed items.
- OpenAI embeddings cost ~$0.0001 per item.
- Total estimated cost: $3-8/day for 50-100 items processed.
