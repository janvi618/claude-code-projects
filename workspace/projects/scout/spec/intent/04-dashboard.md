# Web Dashboard

## Purpose

A Next.js web application providing three views: Intelligence Feed, Daily Brief Archive, and Research Chat. Clean, fast, executive-friendly. No visual complexity — prioritize scannability.

## Technology

Next.js 15 (App Router), Tailwind CSS, shadcn/ui components. Server-side rendering for performance. All data fetched from the FastAPI backend via internal API calls.

## View 1: Intelligence Feed (Default Landing)

Route: `/`

A reverse-chronological feed of intelligence items scored >= 40. Each item displays:
- Headline (linked to source URL, opens in new tab)
- Source name and published date
- Company tags (colored chips, one per company mentioned)
- Domain tag (e.g., "New Products", "Technology")
- Relevance score (visual indicator: green >= 70, yellow 50-69, gray < 50)
- Summary text (expandable, collapsed by default)

Filters (sidebar or top bar, sticky):
- Competitor dropdown (multi-select): all tracked companies
- Domain dropdown (multi-select): all six domains
- Date range picker: preset options (Today, Last 7 days, Last 30 days, Custom)
- Minimum relevance score slider (default: 40)

Pagination: infinite scroll or "Load more" button. 25 items per page.

## View 2: Daily Brief Archive

Route: `/briefs`

Calendar-based view. Left sidebar shows a month calendar with dots on days that have briefs. Main area shows the selected brief rendered as HTML. Default: today's brief (or most recent if today has none).

Features:
- PDF export button (generates a clean PDF of the current brief using browser print)
- "Re-send email" button (admin only)
- Word count and generation timestamp shown in footer

## View 3: Research Chat

Route: `/chat`

Chat interface for natural-language queries about the intelligence knowledge base.

User sends a message. The backend:
1. Generates an embedding of the query using OpenAI text-embedding-3-small.
2. Performs a pgvector similarity search (cosine distance) against intelligence_items, returning the top 10 most similar items.
3. Sends the query + retrieved items to Claude Sonnet with a RAG prompt that synthesizes an answer with inline source citations.
4. If the retrieved items are insufficient (similarity score below threshold), Claude also searches the live web for supplementary information.

Each response displays:
- The synthesized answer
- Source citations (linked to original items or URLs)
- "Follow-up suggestions" (2-3 related questions the user might ask next)

Conversation history is maintained in the browser session (not persisted server-side in MVP).

## Authentication

NextAuth.js with magic-link email provider. No passwords. Flow:
1. User enters email at `/login`
2. System sends a magic link to the email address
3. User clicks link, receives a session cookie (7-day expiry)
4. Session is validated on every page load

Two roles stored in a `users` table:
- `admin`: Full access, including `/admin` routes
- `viewer`: Read-only access to feed, briefs, chat

Unauthorized users see only the login page.

## Layout

Persistent top navigation bar: SCOUT logo (left), view links (Feed, Briefs, Chat), user email + logout (right). Admin users also see an "Admin" link. Mobile-responsive: navigation collapses to hamburger menu.
