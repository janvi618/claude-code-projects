# Strategy Command Center (React Version)

A React + Node.js/Express conversion of the Strategy Command Center, an AI-powered competitive response system.

## Architecture

```
strategy-command-center-react/
├── client/                    # React frontend (Vite + Tailwind CSS)
│   └── src/
│       ├── components/        # UI components
│       │   ├── stages/        # 5 stage components (Detect → Launch)
│       │   ├── Header.jsx
│       │   ├── ProgressBar.jsx
│       │   └── StakeholderCard.jsx
│       ├── context/           # React Context for global state
│       └── lib/               # API client
│
├── server/                    # Express backend
│   ├── routes/                # API endpoints
│   ├── services/              # Agent classes (ported from Python)
│   ├── data/                  # Company/competitor/stakeholder data
│   └── prompts/               # Prompt templates
│
└── package.json               # Root scripts
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm run install-all
   # or manually:
   npm install && cd client && npm install && cd ../server && npm install
   ```

2. **Start the development servers:**
   ```bash
   npm run dev
   ```

   This starts:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

3. **Enter your Anthropic API key** in the app and start analyzing threats.

## 5-Stage Workflow

1. **Detect** - Enter API key and describe the competitive threat
2. **Analyze** - Review AI-generated threat analysis and intelligence report
3. **Respond** - Select from 4 strategic response options (or create custom)
4. **Simulate** - See stakeholder reactions, red team analysis, and scenario projections
5. **Launch** - Get ready-to-use launch materials with download options

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze-threat` | POST | Analyze threat and gather intelligence |
| `/api/generate-responses` | POST | Generate 4 strategic response options |
| `/api/simulate` | POST | Run stakeholder simulations |
| `/api/generate-materials` | POST | Generate launch materials |
| `/api/health` | GET | Health check |

## Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- react-markdown

**Backend:**
- Node.js
- Express
- @anthropic-ai/sdk

## Development

- Frontend auto-reloads on changes (Vite HMR)
- Backend requires manual restart (or use nodemon)
- API key is sent per-request (not stored on server)

## Model Selection

Supports both Claude models:
- Claude Sonnet 4 (faster, default)
- Claude Opus 4 (more capable)

Select in the header dropdown before starting analysis.
