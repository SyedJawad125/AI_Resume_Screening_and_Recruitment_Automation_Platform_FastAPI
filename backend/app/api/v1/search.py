"""
app/api/v1/search.py
────────────────────────
POST /api/v1/search/candidates       → retrieval only (ranked candidate list)
POST /api/v1/search/chat             → retrieval + grounded LLM answer (LangGraph: retrieve → generate)
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
from app.services.rag_chat_service import retrieve_then_stream
from app.workflows.rag_chat_graph import run_rag_chat
from app.utils.response import success_response

router = APIRouter()


class SearchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=500)
    top_k: int = Field(default=10, ge=1, le=50)


@router.post("/candidates")
async def search_candidates(
    payload: SearchRequest, current_user: User = Depends(require_permission("can_search_candidates")), db: AsyncSession = Depends(get_db)
):
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
    """Runs the 2-node LangGraph RAG workflow (retrieve → generate) and
    returns a complete grounded answer plus the candidates it was grounded in."""
    if not current_user.company_id:
        raise ValidationError("Your account is not associated with a company yet.")

    final_state = await run_rag_chat(db, str(current_user.company_id), payload.query, payload.top_k)
    return success_response({"answer": final_state["answer"], "sources": final_state["retrieved_candidates"]})


@router.post("/chat/stream")
async def chat_candidates_stream(
    payload: SearchRequest, current_user: User = Depends(require_permission("can_search_candidates")), db: AsyncSession = Depends(get_db)
):
    """Same grounded RAG answer as /chat, but streamed as Server-Sent Events
    so the frontend can render tokens as they arrive instead of waiting for
    the full response. Event types: 'sources' (once, up front), 'token'
    (repeated), 'done' (once, at the end)."""
    if not current_user.company_id:
        raise ValidationError("Your account is not associated with a company yet.")

    company_id = str(current_user.company_id)

    async def event_stream():
        async for event in retrieve_then_stream(db, company_id, payload.query, payload.top_k):
            yield f"event: {event['event']}\ndata: {json.dumps(event['data'])}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
