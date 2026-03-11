"""Intelligence item endpoints."""

import logging
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import and_, cast, desc, func, select, text
from sqlalchemy.dialects.postgresql import ARRAY, FLOAT
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth import get_current_user
from models.intelligence_item import IntelligenceItem
from models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/items", tags=["items"])


class IntelligenceItemResponse(BaseModel):
    id: uuid.UUID
    headline: str
    summary: Optional[str]
    companies: list
    brands: list
    categories: list
    domain: str
    claims: list
    sentiment: Optional[str]
    strategic_relevance: Optional[str]
    relevance_score: int
    source_url: Optional[str]
    source_name: Optional[str]
    published_at: Optional[datetime]
    processed_at: datetime
    alerted: bool

    class Config:
        from_attributes = True


class ItemListResponse(BaseModel):
    items: list[IntelligenceItemResponse]
    total: int
    limit: int
    offset: int


@router.get("", response_model=ItemListResponse)
async def list_items(
    companies: Optional[str] = Query(None, description="Comma-separated company names"),
    domains: Optional[str] = Query(None, description="Comma-separated domain values"),
    min_score: int = Query(40, ge=0, le=100),
    after: Optional[datetime] = Query(None),
    before: Optional[datetime] = Query(None),
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List intelligence items with optional filters."""
    conditions = [IntelligenceItem.relevance_score >= min_score]

    if companies:
        company_list = [c.strip() for c in companies.split(",") if c.strip()]
        if company_list:
            # Match any of the provided companies in the JSONB array
            company_conditions = [
                IntelligenceItem.companies.contains([c]) for c in company_list
            ]
            from sqlalchemy import or_
            conditions.append(or_(*company_conditions))

    if domains:
        domain_list = [d.strip() for d in domains.split(",") if d.strip()]
        if domain_list:
            conditions.append(IntelligenceItem.domain.in_(domain_list))

    if after:
        conditions.append(IntelligenceItem.processed_at >= after)
    if before:
        conditions.append(IntelligenceItem.processed_at <= before)

    stmt = (
        select(IntelligenceItem)
        .where(and_(*conditions))
        .order_by(desc(IntelligenceItem.processed_at))
        .limit(limit)
        .offset(offset)
    )

    count_stmt = select(func.count(IntelligenceItem.id)).where(and_(*conditions))

    results = await db.execute(stmt)
    count_result = await db.execute(count_stmt)

    items = results.scalars().all()
    total = count_result.scalar_one()

    return ItemListResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/search", response_model=list[dict])
async def semantic_search(
    q: str = Query(..., min_length=1, max_length=500),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Semantic search using pgvector cosine similarity."""
    from llm_client import embed

    try:
        query_embedding = await embed(q)
    except Exception as exc:
        logger.error("Embedding generation failed for search query: %s", exc)
        raise HTTPException(status_code=503, detail="Embedding service unavailable")

    # pgvector cosine similarity: <=> operator returns distance (0=identical, 2=opposite)
    # Convert to similarity: 1 - (distance / 2)
    embedding_literal = str(query_embedding)

    stmt = text(
        """
        SELECT
            id, headline, summary, companies, domain, relevance_score,
            source_url, source_name, published_at,
            1 - (embedding <=> :embedding ::vector) AS similarity
        FROM intelligence_items
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> :embedding ::vector
        LIMIT 10
        """
    )

    result = await db.execute(stmt, {"embedding": embedding_literal})
    rows = result.mappings().all()

    return [
        {
            "id": str(row["id"]),
            "headline": row["headline"],
            "summary": row["summary"],
            "companies": row["companies"],
            "domain": row["domain"],
            "relevance_score": row["relevance_score"],
            "source_url": row["source_url"],
            "source_name": row["source_name"],
            "published_at": row["published_at"].isoformat() if row["published_at"] else None,
            "similarity": float(row["similarity"]),
        }
        for row in rows
    ]


@router.get("/{item_id}", response_model=IntelligenceItemResponse)
async def get_item(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single intelligence item by ID."""
    result = await db.execute(
        select(IntelligenceItem).where(IntelligenceItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
