# Validation Machine

An automated demand-testing machine for product teams. Submit a product concept + target audience, and the system generates landing page variants, runs simulated campaigns, and delivers Go/No-Go recommendations.

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
npx prisma db push

# Start development server
npm run dev
```

Open http://localhost:3000

## How It Works

1. Create a new validation test with your product concept and target audience
2. Click "Generate Landing Pages & Ads" to create 3 variant landing pages
3. Click "Run Simulation" to generate realistic campaign metrics
4. View results: Go/No-Go recommendation, score, and detailed metrics

## Environment Variables

- `DATABASE_URL`: SQLite database path (default: file:./dev.db)
- `ANTHROPIC_API_KEY`: Claude API key (leave blank for mock mode)

## Tech Stack

- Next.js 14
- Prisma (SQLite)
- Tailwind CSS
- Claude API (with mock fallback)
