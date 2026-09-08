"""
app/api/v1/search.py
────────────────────────
POST /api/v1/search/candidates       → retrieval only (ranked candidate list, no agent loop)
POST /api/v1/search/chat             → agentic RAG (retrieve → grade → rewrite → retry) + grounded answer
POST /api/v1/search/chat/stream      → same, streamed token-by-token over SSE
"""

import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.dependencies.auth import get_current_user, require_permission
from app.core.exceptions import ValidationError
from app.models.user import User
from app.services.search_service import semantic_search_candidates
from app.services.rag_chat_service import retrieve_and_answer, retrieve_then_stream
from app.utils.response import success_response

router = APIRouter()


class SearchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=500)
    top_k: int = Field(default=10, ge=1, le=50)


@router.post("/candidates")
async def search_candidates(
    payload: SearchRequest, current_user: User = Depends(require_permission("can_search_candidates")), db: AsyncSession = Depends(get_db)
):
    """Plain retrieval — one pgvector query, no grading/rewriting/LLM calls.
    Use this when you just want the ranked list fast and cheap."""
    if not current_user.company_id:
        raise ValidationError("Your account is not associated with a company yet.")

    results = await semantic_search_candidates(
        db, str(current_user.company_id), payload.query, payload.top_k
    )
    return success_response(results, count=len(results))


@router.post("/chat")
async def chat_candidates(
    payload: SearchRequest, current_user: User = Depends(require_permission("can_search_candidates")), db: AsyncSession = Depends(get_db)
):
    """Agentic RAG: runs the LangGraph retrieve → grade → rewrite-and-retry
    loop (bounded by MAX_AGENT_ITERATIONS/AGENT_TIMEOUT) before generating a
    grounded answer. Response includes `retrieval_meta` so the recruiter/UI
    can see how much work the agent did and whether the final match is
    low-confidence."""
    if not current_user.company_id:
        raise ValidationError("Your account is not associated with a company yet.")

    result = await retrieve_and_answer(db, str(current_user.company_id), payload.query, payload.top_k)
    return success_response(result)


@router.post("/chat/stream")
async def chat_candidates_stream(
    payload: SearchRequest, current_user: User = Depends(require_permission("can_search_candidates")), db: AsyncSession = Depends(get_db)
):
    """Same agentic RAG pipeline as /chat, but streamed as Server-Sent
    Events. The retrieve/grade/rewrite loop runs first (it needs multiple
    sequential LLM calls and isn't meaningfully streamable), then the
    generation chain's tokens stream as they're produced.

    Event order: 'retrieval_meta' (once) → 'sources' (once) →
    'token' (repeated) → 'done' (once)."""
    if not current_user.company_id:
        raise ValidationError("Your account is not associated with a company yet.")

    company_id = str(current_user.company_id)

    async def event_stream():
        async for event in retrieve_then_stream(db, company_id, payload.query, payload.top_k):
            yield f"event: {event['event']}\ndata: {json.dumps(event['data'])}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
