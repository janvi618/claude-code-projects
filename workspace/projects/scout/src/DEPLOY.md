# SCOUT Deployment Guide

## Prerequisites

### Server Requirements
- VPS with **4 vCPU, 8GB RAM, 160GB SSD** (recommended: DigitalOcean Droplet, Hetzner CX41, or equivalent)
- Ubuntu 22.04 LTS
- Docker + Docker Compose v2
- A domain name pointed at your server's IP address

### API Keys Required
| Service | Purpose | Where to get it |
|---------|---------|-----------------|
| Anthropic | Extraction + brief synthesis + chat | [console.anthropic.com](https://console.anthropic.com) |
| OpenAI | Embeddings | [platform.openai.com](https://platform.openai.com/api-keys) |
| Google AI | Relevance scoring (Gemini Flash) | [aistudio.google.com](https://aistudio.google.com) → Get API Key |
| Resend | Email delivery | [resend.com](https://resend.com) → API Keys |

---

## Step-by-Step Deployment

### 1. Install Docker

```bash
# On Ubuntu 22.04
curl -fsSL https://get.docker.com | bash
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Clone the repository

```bash
git clone <your-repo-url> /opt/scout
cd /opt/scout/src
```

### 3. Configure environment variables

```bash
cp backend/.env.example .env
nano .env  # or use any editor
```

Fill in all values:

```env
# Database
POSTGRES_PASSWORD=<generate with: openssl rand -base64 24>

# LLM APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=scout@yourdomain.com

# Auth — generate these secrets:
SECRET_KEY=$(openssl rand -hex 32)
NEXTAUTH_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
NEXTAUTH_URL=https://yourdomain.com

# App
FRONTEND_URL=https://yourdomain.com
ENVIRONMENT=production
ADMIN_EMAIL=your@email.com
```

### 4. Configure Caddy

Edit `src/Caddyfile` and replace `YOUR_DOMAIN` with your actual domain:

```
scout.yourdomain.com {
    ...
}
```

### 5. Build and start services

```bash
cd /opt/scout/src
docker compose up -d --build
```

Caddy will automatically obtain a TLS certificate from Let's Encrypt. Make sure:
- Port 80 and 443 are open in your firewall
- Your domain DNS A record points to the server IP

### 6. Verify services are running

```bash
docker compose ps
# All services should show "healthy" or "running"

# Check backend health
curl https://yourdomain.com/health
```

### 7. Run the seed script

Seed the database with competitors, sources, and the GM context document:

```bash
docker compose exec backend python3 seed.py
```

This will create:
- All Tier 1 and Tier 2 competitors with monitoring keywords
- RSS feeds for trade press and competitor newsrooms
- SEC EDGAR and PubMed API sources
- The General Mills competitive context document
- An admin user for the `ADMIN_EMAIL` address

### 8. Invite the first admin user

After seeding, send yourself a magic link:

```bash
# The admin user was created during seeding
# Visit your dashboard login page:
open https://yourdomain.com/login
# Enter your ADMIN_EMAIL to receive a magic link
```

---

## How to Get Each API Key

### Anthropic (Claude)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Go to **API Keys** → **Create Key**
4. Add billing — Claude Sonnet and Opus calls bill per token
5. Copy the key (starts with `sk-ant-`)

### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in → **API Keys** → **Create new secret key**
3. Add a payment method in Billing
4. Copy the key (starts with `sk-`)
5. Estimated usage: ~$0.0001/item for embeddings (very cheap)

### Google AI (Gemini)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API Key** → **Create API key in new project**
3. Copy the key (starts with `AIza`)
4. Gemini Flash pricing: ~$0.075/MTok — very economical for scoring

### Resend (Email)
1. Go to [resend.com](https://resend.com) and create an account
2. **Domains** → Add your domain → Follow DNS verification steps
3. **API Keys** → Create key
4. Copy the key (starts with `re_`)
5. Free tier: 3,000 emails/month

---

## Managing the Application

### View logs

```bash
docker compose logs -f backend   # Backend logs
docker compose logs -f frontend  # Next.js logs
docker compose logs -f caddy     # Proxy / TLS logs
```

### Restart a service

```bash
docker compose restart backend
```

### Update the application

```bash
cd /opt/scout/src
git pull
docker compose up -d --build
```

### Database backup

```bash
docker compose exec db pg_dump -U scout scout > backup-$(date +%Y%m%d).sql
```

### Database restore

```bash
cat backup-20260101.sql | docker compose exec -T db psql -U scout scout
```

---

## Troubleshooting

**Backend won't start**: Check `docker compose logs backend` — usually a missing env var or database connection issue.

**"Authentication required" errors**: The NextAuth session cookie and the backend session table must be in sync. Ensure `NEXTAUTH_URL` matches your actual domain exactly.

**Emails not sending**: Verify `RESEND_API_KEY` is set and your sending domain is verified in Resend. Check `docker compose logs backend` for email errors.

**Brief not generating**: Check the scheduler logs. The brief runs at 6:30 AM CT on weekdays. You can trigger it manually from the Admin dashboard.

**Caddy certificate issues**: Ensure ports 80/443 are open and your domain DNS is propagated. Caddy stores certs in the `caddydata` volume.

---

## Architecture Reference

```
Internet → Caddy (HTTPS) → [/ → Next.js :3000]
                         → [/api/* → FastAPI :8000]
                         → [/health → FastAPI :8000]

FastAPI → PostgreSQL (pgvector)
        → Redis (rate limiting)
        → Anthropic / OpenAI / Google APIs (async)
        → Resend API (email)

APScheduler (in-process) → Collection jobs (6h, daily, weekly)
                         → Brief generation (6:30 AM CT weekdays)
```

---

## Monthly Cost Estimate (MVP Scale)

| Service | Usage | Est. Cost |
|---------|-------|-----------|
| Anthropic (extraction + briefs) | ~50 items/day + 1 brief/day | ~$60-90/mo |
| Google (scoring) | ~50 items/day | ~$5-10/mo |
| OpenAI (embeddings) | ~50 items/day | ~$2-5/mo |
| Resend | ~20-30 emails/day | ~$0 (free tier) |
| VPS (4 vCPU / 8GB) | 1 server | ~$40-60/mo |
| **Total** | | **~$110-165/mo** |

Well within the $300/month budget target.
