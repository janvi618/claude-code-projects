#!/usr/bin/env bash
set -euo pipefail

echo "=== SCOUT Factory: Codespace Setup ==="

# Install Kilroy
echo "Installing Kilroy..."
go install github.com/danshapiro/kilroy/cmd/kilroy@latest
export PATH="$HOME/go/bin:$PATH"
echo 'export PATH="$HOME/go/bin:$PATH"' >> ~/.bashrc

# Install Python dependencies for SCOUT backend
echo "Installing Python dependencies..."
pip install --break-system-packages \
  fastapi uvicorn httpx beautifulsoup4 feedparser \
  psycopg2-binary sqlalchemy alembic \
  anthropic openai google-generativeai \
  apscheduler pydantic python-dotenv \
  jinja2 resend pgvector

# Install Playwright for JS-heavy scraping
pip install --break-system-packages playwright
playwright install chromium --with-deps 2>/dev/null || true

# Install Node dependencies for SCOUT frontend
echo "Installing Node dependencies..."
npm install -g pnpm

# Docker Compose for local Postgres + Redis
echo "Setting up Docker services..."
if command -v docker &>/dev/null; then
  docker compose -f scripts/docker-compose.dev.yml up -d 2>/dev/null || echo "Docker services will start when Docker is ready"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Add your API keys to Codespace Secrets (Settings > Secrets)"
echo "  2. Run: kilroy attractor validate --graph factory/scout-pipeline.dot"
echo "  3. Run: kilroy attractor ingest -o factory/scout-pipeline.dot spec/intent/"
echo "  4. Or run the full pipeline: kilroy attractor run --graph factory/scout-pipeline.dot --config factory/run.yaml"
echo ""
