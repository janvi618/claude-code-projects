# Deploying Tech CI Workflow

## Quick Deploy to Vercel (Recommended)

### Step 1: Push to GitHub

```bash
cd tech-ci-workflow
git init
git add .
git commit -m "Initial commit"
gh repo create tech-ci-workflow --private --push
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your `tech-ci-workflow` repository
4. Configure environment variables (see below)
5. Click "Deploy"

### Step 3: Set Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

| Variable | Value | Required |
|----------|-------|----------|
| `TEAM_PASSWORD` | Your shared team password | Yes |
| `MOCK_LLM` | `true` (for testing) or `false` (for real AI) | Yes |
| `ANTHROPIC_API_KEY` | Your Claude API key | If MOCK_LLM=false |
| `LLM_PROVIDER` | `anthropic` or `openai` | If MOCK_LLM=false |
| `LLM_MODEL` | `claude-sonnet-4-20250514` | Optional |

### Step 4: Share with Your Team

1. Copy your Vercel URL (e.g., `tech-ci-workflow.vercel.app`)
2. Share the URL and team password with colleagues
3. They enter the password once, then it's saved for 30 days

---

## Environment Variables Explained

### Team Access
- `TEAM_PASSWORD` - Protects the app. Everyone uses the same password.

### AI Configuration
- `MOCK_LLM=true` - Uses fake data (free, good for testing)
- `MOCK_LLM=false` - Uses real AI (requires API key)

### For Real AI Research
```
MOCK_LLM=false
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

Or for OpenAI:
```
MOCK_LLM=false
LLM_PROVIDER=openai
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4
```

---

## Database Note

The app uses SQLite by default, which works on Vercel but **data doesn't persist between deployments**. For production use with persistent data:

1. Use a cloud database (Vercel Postgres, PlanetScale, Turso)
2. Update `prisma/schema.prisma` datasource
3. Set `DATABASE_URL` environment variable

For team demos and short-term use, SQLite is fine.

---

## Alternative: Railway

Railway handles database + app together:

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add environment variables
4. Railway auto-provisions a database

---

## Local Development

```bash
npm install
cp .env.example .env  # Edit with your values
npx prisma db push
npm run dev
```
