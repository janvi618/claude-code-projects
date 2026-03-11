# SCOUT System Overview

## Purpose

SCOUT (Strategic Competitive Observer & Unified Tracker) is a self-hosted competitive intelligence platform that automatically monitors, extracts, scores, and synthesizes competitive intelligence for General Mills' innovation leadership team. The system delivers daily AI-generated briefings and provides an on-demand research interface.

## Why This Matters

General Mills operates in a highly competitive CPG environment where the speed of intelligence delivery is itself a competitive advantage. Competitors include Conagra, PepsiCo, Kraft Heinz, J.M. Smucker, Hormel, Mondelez, Nestlé, and Mars/Kellanova. Following the yogurt divestiture (completed CY2025), General Mills' portfolio is focused on Cereal, Snack Bars, Pet Food, Ice Cream, Mexican Food, Dough, Meals, Baking, and Hot Snacks/Frozen. Innovation priorities (per CAGNY 2026) are: bold flavors, familiar & fun favorites, and better-for-you benefits (protein and fiber).

## System Scope (MVP)

The MVP delivers four capabilities:

1. **Automated data collection** from 20-30 high-value sources (competitor newsrooms, trade press, SEC filings, PubMed) on a scheduled cadence.
2. **AI-powered extraction and scoring** that converts raw web content into structured intelligence items with relevance scores relative to General Mills' strategic priorities.
3. **Daily morning brief** synthesized by Claude Opus and delivered via email and web dashboard at 7:00 AM CT on weekdays.
4. **On-demand research chat** where users ask natural-language questions answered from the knowledge base and live web search.

## Users

- **Primary**: Chief Innovation Officer (daily brief consumer, occasional chat queries)
- **Secondary**: VP-level innovation and strategy leaders (5-10 people, daily brief + dashboard)
- **Admin**: Platform operator (1 person, manages sources and configuration)

## What SCOUT Is Not

- Not a dashboarding tool for syndicated data (Nielsen/Circana). It works with publicly available intelligence.
- Not a real-time alerting system. The MVP operates on 6-hour collection cadences, not streaming.
- Not a multi-tenant SaaS product. It is a single-tenant, self-hosted application for one company.

## Technology Constraints

- Must run on a single VPS or cloud VM via Docker Compose.
- Uses the operator's own LLM API keys (Anthropic, OpenAI, Google Gemini). No vendor lock-in.
- Frontend in Next.js, backend in Python FastAPI, database in PostgreSQL with pgvector.
- Authentication via magic-link email (NextAuth.js). No passwords.
- Total LLM API cost must stay under $300/month at MVP scale.
