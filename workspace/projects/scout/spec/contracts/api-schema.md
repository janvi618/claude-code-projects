# API Schema Contracts

## Backend API (FastAPI, port 8000)

### Intelligence Endpoints
- `GET /api/items` — List intelligence items. Query params: `companies` (comma-sep), `domains` (comma-sep), `min_score` (int), `after` (ISO datetime), `before` (ISO datetime), `limit` (int, default 25), `offset` (int). Returns: paginated array of IntelligenceItem objects.
- `GET /api/items/{id}` — Single intelligence item with full detail.
- `GET /api/items/search` — Semantic search. Query param: `q` (string). Generates embedding, performs pgvector cosine similarity search. Returns top 10 results with similarity scores.

### Brief Endpoints
- `GET /api/briefs` — List all briefs, newest first. Query params: `limit`, `offset`.
- `GET /api/briefs/latest` — Most recent brief.
- `GET /api/briefs/{date}` — Brief for specific date (YYYY-MM-DD format).
- `POST /api/briefs/generate` — Admin only. Manually trigger brief generation for today.

### Chat Endpoint
- `POST /api/chat` — Send a research query. Body: `{ "message": string, "history": array }`. Returns: `{ "response": string, "sources": array, "suggestions": array }`.

### Admin Endpoints (require admin role)
- `GET /api/admin/sources` — List all sources with health status.
- `POST /api/admin/sources` — Create new source.
- `PATCH /api/admin/sources/{id}` — Update source config.
- `POST /api/admin/sources/{id}/test` — Trigger test collection.
- `GET /api/admin/users` — List all users.
- `POST /api/admin/users/invite` — Send magic link invite. Body: `{ "email": string, "role": string }`.
- `GET /api/admin/health` — System health metrics (collection stats, LLM costs, source health).

### Auth Endpoints (handled by NextAuth.js on frontend)
- `GET /api/auth/session` — Current session.
- Frontend manages magic link flow via NextAuth.js routes.

## LLM Provider Contracts

All LLM calls go through a unified `llm_client` module that abstracts provider differences.

### Interface
```python
async def complete(provider: str, model: str, messages: list, response_format: str = "text") -> LLMResponse
```

### Providers
- `anthropic`: Uses `anthropic` Python SDK. Models: `claude-sonnet-4-20250514`, `claude-opus-4-20250514`.
- `openai`: Uses `openai` Python SDK. Models: `text-embedding-3-small`, `gpt-4o` (fallback only).
- `google`: Uses `google-generativeai` SDK. Models: `gemini-2.0-flash`.

### Error Handling
On provider error (rate limit, server error): retry once with 5-second backoff. On second failure: if a fallback model is configured, try the fallback. If no fallback or fallback fails: raise `LLMProviderError` with provider name and error details.

## Data Model Contracts

See `spec/contracts/data-models.md` for full PostgreSQL schema definitions. All tables use UUID primary keys. All timestamps are UTC. The database must have the `pgvector` extension enabled (`CREATE EXTENSION IF NOT EXISTS vector`).
