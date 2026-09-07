"""
app/api/v1/health.py
──────────────────────
Liveness/readiness probe. Checks the app is up AND can reach Postgres —
this is what Docker's healthcheck and any load balancer should hit.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as exc:  # pragma: no cover
        db_status = f"error: {exc}"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "app": settings.APP_NAME,
        "database": db_status,
    }
