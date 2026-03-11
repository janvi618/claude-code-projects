"""Authentication middleware and dependencies for FastAPI."""

import logging
from datetime import datetime, timezone

import redis.asyncio as aioredis
from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from database import get_db
from models.user import User

logger = logging.getLogger(__name__)
settings = get_settings()


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Validate the session token from the Authorization header or session cookie.
    NextAuth.js stores the session in a cookie; we validate against our sessions table.
    """
    # Try Authorization header first (Bearer token)
    auth_header = request.headers.get("Authorization", "")
    token = None

    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    else:
        # Try session cookie set by NextAuth
        token = request.cookies.get("next-auth.session-token") or request.cookies.get(
            "__Secure-next-auth.session-token"
        )

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Look up session in database
    from sqlalchemy import text

    result = await db.execute(
        text(
            """
            SELECT u.id, u.email, u.role, u.receive_brief, u.last_login_at, u.created_at
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.session_token = :token
              AND s.expires > now()
            LIMIT 1
            """
        ),
        {"token": token},
    )
    row = result.mappings().one_or_none()

    if not row:
        raise HTTPException(
            status_code=401,
            detail="Session expired or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Construct a User object from the row
    user = User(
        id=row["id"],
        email=row["email"],
        role=row["role"],
        receive_brief=row["receive_brief"],
        last_login_at=row["last_login_at"],
        created_at=row["created_at"],
    )
    return user


async def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency that requires the current user to have admin role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )
    return current_user


async def check_magic_link_rate_limit(email: str) -> bool:
    """Rate limit magic link requests: 5 per email per hour."""
    try:
        r = aioredis.from_url(settings.redis_url)
        key = f"magic_link_ratelimit:{email}"
        count = await r.incr(key)
        if count == 1:
            await r.expire(key, 3600)
        await r.aclose()
        return count <= settings.magic_link_rate_limit_per_hour
    except Exception as exc:
        logger.warning("Rate limit check failed for magic link (allowing): %s", exc)
        return True
