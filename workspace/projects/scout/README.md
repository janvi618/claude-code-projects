# SCOUT — Strategic Competitive Observer & Unified Tracker

**An agentic AI competitive intelligence platform for General Mills, built using the Kilroy software factory pattern.**

## What Is This?

This repository contains the **specification, factory pipeline, and holdout scenarios** for SCOUT — a competitive intelligence platform that delivers daily AI-synthesized briefings to General Mills' Chief Innovation Officer.

The software is built using [Kilroy](https://github.com/danshapiro/kilroy), a software factory CLI that implements StrongDM's [Attractor pattern](https://github.com/strongdm/attractor). Human-authored specifications drive coding agents that produce, test, and converge working software — without human code review.

## Repository Structure

```
scout-factory/
├── spec/                          # HUMAN-MANAGED: What SCOUT should do
│   ├── intent/                    # Natural-language specs (NLSpec)
│   │   ├── 00-overview.md         # System purpose and scope
│   │   ├── 01-data-collection.md  # Source collection pipeline
│   │   ├── 02-intelligence.md     # LLM extraction and scoring
│   │   ├── 03-daily-brief.md      # Brief generation and delivery
│   │   ├── 04-dashboard.md        # Web interface specification
│   │   ├── 05-research-chat.md    # On-demand query interface
│   │   └── 06-admin.md            # Configuration and management
│   ├── contracts/                 # API contracts and interfaces
│   │   ├── api-schema.md          # FastAPI endpoint definitions
│   │   ├── llm-contracts.md       # LLM provider interfaces
│   │   └── data-models.md         # Database schema contracts
│   └── constraints/               # Non-negotiable invariants
│       ├── security.md            # Auth, encryption, access control
│       ├── performance.md         # Latency, uptime, cost limits
│       └── compliance.md          # Data handling, scraping ethics
├── holdout-scenarios/             # HIDDEN FROM FACTORY AGENTS
│   ├── happy-path/                # Normal operation scenarios
│   ├── edge-cases/                # Boundary condition scenarios
│   └── failure-modes/             # Degradation scenarios
├── factory/                       # FACTORY ORCHESTRATION
│   ├── scout-pipeline.dot         # Attractor phase graph (DOT)
│   └── run.yaml                   # Kilroy run configuration
├── src/                           # MACHINE-GENERATED: Agent output
├── scripts/                       # Dev tooling
│   ├── docker-compose.dev.yml     # Local Postgres + Redis
│   └── start-cxdb.sh             # CXDB launcher (optional)
├── docs/                          # Human-facing documentation
├── .devcontainer/                 # GitHub Codespaces config
├── .claude/skills/                # Claude Code skill files
├── .agents/skills/                # Codex/generic agent skills
├── CLAUDE.md                      # Claude Code instructions
└── AGENTS.md                      # Codex/agent instructions
```

## Quickstart (GitHub Codespaces)

### 1. Open in Codespaces

Click **Code → Codespaces → Create codespace on main**. The devcontainer installs Go, Node, Python, Docker, and Kilroy automatically.

### 2. Add API Keys

Go to **Settings → Codespaces → Secrets** and add:
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_API_KEY`

### 3. Validate the Pipeline

```bash
kilroy attractor validate --graph factory/scout-pipeline.dot
```

### 4. Run the Factory

```bash
# Full pipeline execution
kilroy attractor run --graph factory/scout-pipeline.dot --config factory/run.yaml

# Or preflight-only (validates everything, doesn't execute)
kilroy attractor run --graph factory/scout-pipeline.dot --config factory/run.yaml --preflight
```

### 5. Resume if Interrupted

```bash
kilroy attractor resume --logs-root ./logs
```

## The Specification-Driven Approach

This project follows the software factory pattern described in [The Software Factory Practitioner's Guide](https://thewoolleyweb.com/software-factory-practitioners-guide):

- **Humans** write specifications (`spec/`), author holdout scenarios (`holdout-scenarios/`), and configure the factory (`factory/`).
- **Coding agents** produce the implementation (`src/`) by executing the Attractor pipeline.
- **Validation agents** (separate from factory agents) evaluate the built software against holdout scenarios the factory agents never saw.

The human's intellectual contribution is entirely upstream of implementation. No human writes code. No human reviews code.

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Pipeline pattern | Kilroy/Attractor | Graph-structured, resumable, provider-neutral |
| Primary LLM | Claude (Anthropic) | Best at spec-following and synthesis |
| Scoring LLM | Gemini Flash (Google) | Cheapest for classification tasks |
| Embeddings | OpenAI text-embedding-3-small | Best price/performance for semantic search |
| Backend | Python FastAPI | Async, strong LLM ecosystem |
| Frontend | Next.js + Tailwind + shadcn/ui | Fast, responsive, good DX |
| Database | PostgreSQL + pgvector | Relational + vector search, single DB |
| Deployment | Docker Compose | Single-command deployment |
| Dev environment | GitHub Codespaces | Zero-setup, shareable, cloud-hosted |
