# Agent-Powered Tech CI Workflow

A 6-step competitive intelligence workflow with real web research capabilities.

## Two Modes

### Mock Mode (Default)
- Fast, deterministic responses
- No API key needed
- Great for testing the workflow

### Research Mode
- **Real web searches** using DuckDuckGo
- **URL content extraction** from your sources
- **LLM analysis** with Claude or GPT-4
- **Research-grade prompts** for each step
- **Context chaining** - each step builds on previous analysis

## Quick Start

```bash
cd tech-ci-workflow
npm install
npm run db:setup
npm run dev
```

Open http://localhost:3000

## Enable Research Mode

1. Edit `.env`:
```bash
MOCK_LLM=false
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-key-here
```

2. Restart the server:
```bash
npm run dev
```

The UI will show "Research Mode" in green when enabled.

## What Research Mode Does

When you click "Run Research":

1. **Fetches Source Content** - Extracts text from URLs you've added
2. **Web Searches** - Runs 3-5 targeted searches on DuckDuckGo
3. **Builds Context** - Combines sources, search results, and previous analysis
4. **LLM Analysis** - Sends research-grade prompts to Claude/GPT-4
5. **Generates Output** - Produces detailed, cited analysis

## Workflow Steps

| Step | Purpose | Research Activities |
|------|---------|---------------------|
| 1 | Landscape & Whitespace | Market search, competitor research, trend analysis |
| 2 | IP & Ecosystem | Patent landscape, partnership research, ecosystem mapping |
| 3 | RRW Scoring | Opportunity validation, market sizing, competitive gaps |
| 4 | Deep Dives | JTBD research, solution space, technology readiness |
| 5 | Synthesis | Cross-opportunity analysis, roadmap planning |
| 6 | Executive Summary | What/So What/Now What narrative |

## Sources & Citations

- Add sources (URLs or notes) in the sidebar
- URLs are **automatically fetched** and content extracted
- AI cites sources as `[S1]`, `[S2]`, etc.
- Uncited claims marked as `[Inference]` or `[Web Research]`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MOCK_LLM` | `true` for mock, `false` for research | `true` |
| `LLM_PROVIDER` | `anthropic` or `openai` | `anthropic` |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | - |
| `LLM_API_KEY` | Your OpenAI API key | - |
| `LLM_MODEL` | Model to use | `claude-sonnet-4-20250514` |

## Compliance Scanner

Scans for:
- **IP Language**: patent, novel invention, we invented, etc.
- **PII**: Email addresses, phone numbers

Export requires compliance acknowledgement.

## Tech Stack

- **Framework**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite + Prisma
- **PDF Export**: Playwright
- **Web Search**: DuckDuckGo (no API key needed)
- **LLM**: Anthropic Claude or OpenAI GPT-4

## Project Structure

```
tech-ci-workflow/
├── src/
│   ├── app/           # Pages and API routes
│   ├── components/    # UI components
│   └── lib/
│       ├── llm.ts       # LLM integration
│       ├── research.ts  # Web search & URL fetching
│       ├── prompts.ts   # Research-grade prompts
│       └── mock-llm.ts  # Mock responses
├── prisma/            # Database schema
└── exports/           # Generated PDFs
```

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run db:setup  # Initialize database
npm run db:reset  # Reset database
```
