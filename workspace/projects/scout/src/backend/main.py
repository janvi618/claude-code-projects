"""SCOUT FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("SCOUT backend starting up (environment: %s)", settings.environment)

    # Start the APScheduler background jobs
    from scheduler import start_scheduler, stop_scheduler
    await start_scheduler()

    yield

    # Graceful shutdown
    logger.info("SCOUT backend shutting down")
    await stop_scheduler()


app = FastAPI(
    title="SCOUT — Competitive Intelligence API",
    description="General Mills competitive intelligence platform backend",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs" if not settings.is_production else None,
    redoc_url="/api/redoc" if not settings.is_production else None,
)

# CORS — allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
from routers.health import router as health_router
from routers.items import router as items_router
from routers.briefs import router as briefs_router
from routers.chat import router as chat_router
from routers.admin import router as admin_router
from routers.internal import router as internal_router

app.include_router(health_router)
app.include_router(items_router)
app.include_router(briefs_router)
app.include_router(chat_router)
app.include_router(admin_router)
app.include_router(internal_router)


@app.get("/")
async def root():
    return {"service": "SCOUT", "version": "1.0.0", "status": "ok"}
