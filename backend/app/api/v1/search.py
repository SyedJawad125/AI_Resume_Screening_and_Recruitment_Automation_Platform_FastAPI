"""
app/api/v1/search.py
────────────────────────
POST /api/v1/search/candidates
    { "query": "candidates with strong FastAPI and RAG experience" }

Returns candidates ranked by embedding similarity, with the resume text
that explains why each one matched — grounded retrieval, not an LLM
guessing which candidates might fit.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.core.exceptions import ValidationError
from app.models.user import User
from app.services.search_service import semantic_search_candidates
from app.utils.response import success_response

router = APIRouter()


class SearchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=500)
    top_k: int = Field(default=10, ge=1, le=50)


@router.post("/candidates")
async def search_candidates(
    payload: SearchRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    if not current_user.company_id:
        raise ValidationError("Your account is not associated with a company yet.")

    results = await semantic_search_candidates(
        db, str(current_user.company_id), payload.query, payload.top_k
    )
    return success_response(results, count=len(results))
