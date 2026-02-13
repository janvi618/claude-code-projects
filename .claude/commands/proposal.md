---
name: proposal
description: End-to-end proposal workflow — from client requirements to a scoped, priced, AI-optimized proposal with contract language. Walks through 6 stages interactively.
---

# Proposal Workflow

Generate a complete client proposal through a guided 6-stage pipeline.

## Usage

```
/proposal
/proposal [client problem description]
```

## What This Does

Walks you through 6 interactive stages to build a complete proposal:

| Stage | What It Does | Output |
|-------|-------------|--------|
| **1. Intake & Clarify** | Generates clarifying questions about scope, timeline, effort, budget | Structured requirements |
| **2. Market Research** | Searches for tools, approaches, and comparable projects | Market landscape + past project insights |
| **3. Scope & Assumptions** | Builds phased work breakdown with constraints and assumptions | Activities, deliverables, entry/exit criteria |
| **4. Contract Language** | Drafts proposal in professional contracting language | Contract-ready sections |
| **5. Resource Mapping** | Maps activities to roles with effort and cost estimates | Resource plan + pricing |
| **6. AI Efficiency** | Identifies AI/automation opportunities with toggle to approve | Revised estimate with AI savings |

## Output

Creates a full proposal package in `workspace/projects/proposal-[client]-[date]/`:

```
proposal-[client]-[date]/
├── 00-proposal-summary.md  ← Full synthesized proposal
├── 01-intake.md            ← Client requirements
├── 02-research.md          ← Market research
├── 03-scope.md             ← Scope & assumptions
├── 04-contract.md          ← Contract language
├── 05-resources.md         ← Resource mapping
└── 06-ai-efficiency.md     ← AI optimization
```

## Features

- **Pause & resume** — Stop at any stage, come back later
- **Run individual stages** — "Just redo the resource mapping"
- **AI efficiency toggle** — See all AI opportunities, approve the ones you want, get revised pricing
- **Contract-ready language** — Uses professional services contracting patterns

## Best Used When

- A client describes a problem and you need to turn it into a proposal fast
- You want to see where AI could create competitive pricing advantages
- You need structured contract language for a new engagement

$ARGUMENTS
Optional: Client problem statement or description. If not provided, the workflow will ask for it.
