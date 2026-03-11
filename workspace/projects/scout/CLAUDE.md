# CLAUDE.md — Instructions for Claude Code

You are building SCOUT, a competitive intelligence platform for General Mills. Read the specification files in `spec/` before writing any code.

## Architecture

- **Backend**: Python FastAPI in `src/backend/`. Use `httpx` for async HTTP, `sqlalchemy` for ORM, `apscheduler` for scheduling.
- **Frontend**: Next.js 15 (App Router) in `src/frontend/`. Use Tailwind CSS and shadcn/ui. Use server components where possible.
- **Database**: PostgreSQL 16 with pgvector extension. Schema defined in `spec/contracts/data-models.md`.
- **LLM calls**: Always go through `src/backend/llm_client.py` — never call providers directly from other modules.

## Rules

1. Read the relevant `spec/intent/` file before implementing any feature.
2. Check `spec/constraints/` before any security or performance decision.
3. Use the API contracts in `spec/contracts/api-schema.md` as the source of truth for endpoints.
4. All database queries must use parameterized queries. No string interpolation in SQL.
5. Never log API keys, tokens, or user emails. Log at INFO level for operations, WARNING for recoverable errors, ERROR for failures.
6. Every LLM prompt must include the General Mills context (loaded from the context_documents table).
7. Use environment variables for all configuration. Never hardcode URLs, keys, or secrets.
8. Write tests alongside implementation. Use `pytest` for backend, built-in Next.js testing for frontend.

## File Structure Convention

```
src/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py             # Environment variable loading
│   ├── database.py           # SQLAlchemy setup, session management
│   ├── models/               # SQLAlchemy ORM models
│   ├── routers/              # FastAPI route handlers
│   ├── collectors/           # Source collection modules
│   ├── processing/           # Extraction, scoring, embedding
│   ├── synthesis/            # Brief generation
│   ├── llm_client.py         # Unified LLM provider client
│   └── scheduler.py          # APScheduler setup
├── frontend/
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # Shared React components
│   └── lib/                  # Utility functions, API client
└── docker-compose.yml        # Production deployment
```
