# Deploying SCOUT on Railway

Railway handles HTTPS, domains, and infrastructure automatically.
No server management required.

## Step 1: Push code to GitHub

SCOUT must be in a GitHub repo for Railway to deploy it.

1. Go to github.com → New repository → name it `scout` → Create
2. In your terminal (or this Codespace):

```bash
cd /workspaces/claude-code-projects/workspace/projects/scout
git init
git add .
git commit -m "Initial SCOUT build"
git remote add origin https://github.com/YOUR_USERNAME/scout.git
git push -u origin main
```

## Step 2: Create a Railway account

Go to railway.app → Sign in with GitHub.

## Step 3: Create a new project

Click **New Project** → **Deploy from GitHub repo** → select your `scout` repo.

Railway will detect the repo but don't deploy yet — click **Add variables** first.

## Step 4: Add PostgreSQL

In your Railway project:
1. Click **+ New** → **Database** → **PostgreSQL**
2. Railway creates a managed Postgres instance
3. Click on it → **Connect** tab → copy the `DATABASE_URL`

> Railway's PostgreSQL supports pgvector. The schema.sql will enable it on first boot.

## Step 5: Add Redis

1. Click **+ New** → **Database** → **Redis**
2. Click on it → **Connect** tab → copy the `REDIS_URL`

## Step 6: Deploy the Backend

1. Click **+ New** → **GitHub Repo** → select `scout` → set **Root Directory** to `src/backend`
2. Railway detects the Dockerfile automatically
3. Go to **Variables** tab and add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | (paste from PostgreSQL service) |
| `REDIS_URL` | (paste from Redis service) |
| `ANTHROPIC_API_KEY` | your key |
| `OPENAI_API_KEY` | your key |
| `GOOGLE_API_KEY` | your key |
| `SECRET_KEY` | (paste from your .env) |
| `ENCRYPTION_KEY` | (paste from your .env) |
| `NEXTAUTH_URL` | https://YOUR-FRONTEND.railway.app |
| `FRONTEND_URL` | https://YOUR-FRONTEND.railway.app |
| `ADMIN_EMAIL` | janvi618@gmail.com |
| `ENVIRONMENT` | production |
| `RESEND_API_KEY` | (skip for now — add later) |
| `EMAIL_FROM` | scout@yourdomain.com |

4. Click **Deploy**. Watch the build logs — takes 3-5 minutes.
5. Once deployed, Railway gives you a URL like `scout-backend-production.railway.app`

## Step 7: Deploy the Frontend

1. Click **+ New** → **GitHub Repo** → select `scout` → set **Root Directory** to `src/frontend`
2. Go to **Variables** tab and add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | https://YOUR-BACKEND.railway.app |
| `NEXTAUTH_URL` | https://YOUR-FRONTEND.railway.app |
| `NEXTAUTH_SECRET` | (paste from your .env) |

3. Click **Deploy**

## Step 8: Seed the database

Once the backend is running, open the Railway backend service → **Shell** tab:

```bash
python3 seed.py
```

This creates competitors, sources, your admin user, and the GM context document.

## Step 9: Log in

Visit your frontend Railway URL → enter `janvi618@gmail.com` → you'll receive a magic link email.

(If Resend isn't configured yet, you can manually create a session via the Railway shell.)

## Costs on Railway

| Service | Railway cost |
|---|---|
| PostgreSQL | ~$5-10/mo |
| Redis | ~$2-5/mo |
| Backend service | ~$5-10/mo |
| Frontend service | ~$3-5/mo |
| **Total** | **~$15-30/mo** |

Much cheaper than a VPS for a lightly-used internal tool.
