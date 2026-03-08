# Snatch — AI-Powered Brand Marketing

An AI-powered web application that extracts Brand DNA from any website and generates on-brand social media campaigns — complete with AI-generated visuals. Built following the StrongDM Software Factory method: spec-driven, agent-built.

## What It Does

1. **Enter a URL** — paste any business website
2. **Get your Brand DNA** — Snatch extracts colors, fonts, tone of voice, market positioning, and confidence score
3. **Generate campaigns** — 3 campaign concepts, each with posts for Instagram, LinkedIn, and X
4. **See real images** — every post includes an AI-generated visual via GPT Image 1, not just a prompt

## Quick Start

1. **Install dependencies**:
   ```bash
   cd kilroy/pomelli-clone
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Add your keys:
   # ANTHROPIC_API_KEY=sk-ant-...
   # OPENAI_API_KEY=sk-proj-...
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

4. **Open your browser** to `http://localhost:5173`

## Demo Mode

For presentations, use pre-cached Brand DNA profiles that load instantly with no network calls:

```bash
npm run demo
```

Or set `DEMO_MODE=true` in your `.env` file.

**Pre-cached demo URLs:**
- `sweetcrumbsbakery.com` — artisanal bakery (warm, casual brand) — 3 concepts, 9 posts
- `acmelaw.com` — law firm (professional, formal brand)
- `novatech.io` — tech company (innovative, modern brand)

## Technology Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18, TypeScript, Vite |
| **Backend** | Express.js, Node.js, TypeScript |
| **Brand AI** | Anthropic Claude (claude-sonnet-4) |
| **Image AI** | OpenAI GPT Image 1 (`gpt-image-1`) |
| **Fonts** | Playfair Display + Inter (Google Fonts) |
| **Build** | Vite (client), tsx (server) |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/extract` | Extract Brand DNA from a URL |
| `POST` | `/api/generate` | Generate campaigns from Brand DNA |
| `POST` | `/api/generate-image` | Generate a single campaign image |

## Project Structure

```
pomelli-clone/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── App.tsx             # App shell + step state machine
│   │   ├── index.css           # Design system (dark luxury theme)
│   │   └── components/
│   │       ├── URLInput.tsx    # Step 1: URL entry
│   │       ├── BrandDNACard.tsx# Step 2: Brand profile display
│   │       ├── CampaignResults.tsx # Step 3: Campaign cards
│   │       ├── PostCard.tsx    # Individual post + live image generation
│   │       ├── ColorPalette.tsx
│   │       ├── VoiceProfile.tsx
│   │       └── LoadingState.tsx
│   └── vite.config.ts          # Dev server + API proxy config
├── server/
│   ├── index.ts                # Express server
│   └── routes/
│       ├── extract.ts          # POST /api/extract
│       └── generate.ts         # POST /api/generate + /api/generate-image
├── src/
│   ├── extractor/              # Brand DNA extraction logic
│   └── generator/
│       ├── index.ts            # Campaign generation orchestrator
│       ├── image-generator.ts  # GPT Image 1 integration
│       └── ...
├── demo-data/                  # Pre-cached brand profiles + campaigns
├── specs/                      # NLSpec source documents
└── .env                        # API keys + config
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Powers Brand DNA extraction and campaign generation |
| `OPENAI_API_KEY` | Yes | Powers image generation (GPT Image 1) |
| `PORT` | No | Server port (default: 3001) |
| `DEMO_MODE` | No | Use cached profiles instead of live AI calls (default: false) |

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start server + client in dev mode |
| `npm run demo` | Start in demo mode (DEMO_MODE=true) |
| `npm run server` | Start Express server only |
| `npm run client` | Start Vite dev server only |
| `npm run build` | Build client for production |

## Design System

Snatch uses a dark luxury theme inspired by premium brand marketing agencies:

- **Background**: `#08080F` near-black with ambient purple glow and grain texture
- **Cards**: Glass-morphism — semi-transparent with backdrop blur
- **Accent**: Hot pink → electric purple gradient (`#FF2D6E → #7B61FF`)
- **Typography**: Playfair Display (headings) + Inter (body)
- **Animations**: Fade-in on all cards, gradient spinner

## Implementation Status

✅ Brand DNA extraction with Claude AI
✅ Campaign generation — 3 concepts × 3 platforms
✅ Per-post image generation via GPT Image 1
✅ Dark luxury UI — Playfair Display, glassmorphism, grain texture
✅ Demo mode with pre-cached profiles (3 concepts, 9 posts each)
✅ Error handling and loading states
✅ Clipboard copy for post text + hashtags
✅ Responsive design for desktop

## License

MIT — built using the StrongDM Software Factory method.
