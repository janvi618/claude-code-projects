"""
Internal endpoints used by the NextAuth.js adapter.
These are NOT public API endpoints — they should only be accessible from
the frontend service (use Docker network isolation, not exposed to internet).
"""

import logging
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import delete, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/internal", tags=["internal"], include_in_schema=False)


class SessionCreate(BaseModel):
    session_token: str
    user_id: uuid.UUID
    expires: datetime


class SessionResponse(BaseModel):
    session: dict
    user: dict


@router.post("/sessions")
async def create_session(
    payload: SessionCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new session record (called by NextAuth adapter)."""
    await db.execute(
        text(
            """
            INSERT INTO sessions (id, session_token, user_id, expires)
            VALUES (:id, :session_token, :user_id, :expires)
            ON CONFLICT (session_token) DO UPDATE
              SET expires = EXCLUDED.expires
            """
        ),
        {
            "id": str(uuid.uuid4()),
            "session_token": payload.session_token,
            "user_id": str(payload.user_id),
            "expires": payload.expires,
        },
    )
    await db.commit()
    return {"session_token": payload.session_token, "expires": payload.expires.isoformat()}


@router.get("/sessions/{session_token}")
async def get_session_and_user(
    session_token: str,
    db: AsyncSession = Depends(get_db),
):
    """Look up a session and return session + user data (called by NextAuth adapter)."""
    result = await db.execute(
        text(
            """
            SELECT
                s.session_token, s.expires,
                u.id as user_id, u.email, u.role, u.receive_brief, u.created_at
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.session_token = :token
              AND s.expires > now()
            LIMIT 1
            """
        ),
        {"token": session_token},
    )
    row = result.mappings().one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    return {
        "session": {
            "sessionToken": row["session_token"],
            "expires": row["expires"].isoformat(),
            "userId": str(row["user_id"]),
        },
        "user": {
            "id": str(row["user_id"]),
            "email": row["email"],
            "role": row["role"],
            "emailVerified": row["created_at"].isoformat(),
        },
    }


@router.delete("/sessions/{session_token}")
async def delete_session(
    session_token: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a session (called on sign-out)."""
    await db.execute(
        text("DELETE FROM sessions WHERE session_token = :token"),
        {"token": session_token},
    )
    await db.commit()
    return {"deleted": True}


class UserCreate(BaseModel):
    email: str
    role: str = "viewer"


@router.get("/users")
async def get_user_by_email(
    email: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Look up a user by email (called by NextAuth adapter during login)."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "emailVerified": user.created_at.isoformat(),
    }


@router.post("/users")
async def create_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a user record (called by NextAuth adapter on first login)."""
    result = await db.execute(select(User).where(User.email == payload.email))
    existing = result.scalar_one_or_none()
    if existing:
        return {"id": str(existing.id), "email": existing.email, "role": existing.role, "emailVerified": existing.created_at.isoformat()}
    user = User(email=payload.email, role=payload.role)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"id": str(user.id), "email": user.email, "role": user.role, "emailVerified": user.created_at.isoformat()}
