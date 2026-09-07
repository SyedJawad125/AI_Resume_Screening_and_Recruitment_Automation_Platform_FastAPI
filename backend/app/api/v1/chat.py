"""
app/api/v1/chat.py
───────────────────
UPDATED: Supports both agent mode (LangGraph CRAG) and simple RAG.

POST /api/v1/chat          → RAG Q&A (mode auto-selected from settings)
POST /api/v1/chat/agent    → Force LangGraph CRAG agent
POST /api/v1/chat/simple   → Force simple RAG chain
POST /api/v1/chat/ask      → Multi-tool document agent (auto-classifies intent)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.rag_service import rag_service
from app.repositories.document_repository import DocumentRepository
from app.core.exceptions import NotFoundError, ValidationError
from app.utils.response import success_response

router = APIRouter()


def _validate_chat_payload(payload: dict) -> tuple[str, str]:
    document_id = payload.get('document_id', '').strip()
    question    = payload.get('question', '').strip()
    if not document_id:
        raise ValidationError('document_id is required.')
    if not question:
        raise ValidationError('question is required.')
    return document_id, question


async def _get_owned_doc(document_id: str, user_id, db):
    doc_repo = DocumentRepository(db)
    document = await doc_repo.get_by_id(document_id, user_id=user_id)
    if not document:
        raise NotFoundError('Document')
    return document


def _format_rag_response(response, document) -> dict:
    return {
        'question':        response.question,
        'answer':          response.answer,
        'model':           response.model,
        'mode':            response.mode,
        'chunks_used':     response.chunks_used,
        'iterations':      response.iterations,
        'query_rewritten': response.query_rewritten,
        'citations': [
            {
                'chunk_id':    c.chunk_id,
                'document_id': c.document_id,
                'filename':    c.filename,
                'page_number': c.page_number,
            }
            for c in response.citations
        ],
    }


# ─────────────────────────────────────────────────────────────────
#  Default endpoint — uses USE_AGENT_MODE from settings
# ─────────────────────────────────────────────────────────────────

@router.post('/')
async def chat(
    payload:      dict,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    """
    Ask a question about a document.
    Mode (CRAG agent vs simple RAG) is set by USE_AGENT_MODE in .env.

    Request:
        { "document_id": "uuid", "question": "What was revenue in 2025?", "top_k": 5 }
    """
    document_id, question = _validate_chat_payload(payload)
    top_k    = int(payload.get('top_k', 5))
    document = await _get_owned_doc(document_id, current_user.id, db)

    response = await rag_service.answer(
        question    = question,
        document_id = document_id,
        db          = db,
        top_k       = top_k,
    )
    return success_response(_format_rag_response(response, document))


# ─────────────────────────────────────────────────────────────────
#  Force LangGraph CRAG Agent
# ─────────────────────────────────────────────────────────────────

@router.post('/agent')
async def chat_agent(
    payload:      dict,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    """
    Force LangGraph Corrective RAG agent.
    Includes document grading + optional query rewriting.

    Extra response fields:
        iterations      → how many retrieve-grade loops ran
        query_rewritten → whether the query was rewritten for better retrieval
    """
    document_id, question = _validate_chat_payload(payload)
    top_k    = int(payload.get('top_k', 5))
    document = await _get_owned_doc(document_id, current_user.id, db)

    response = await rag_service.answer(
        question    = question,
        document_id = document_id,
        db          = db,
        top_k       = top_k,
        use_agent   = True,
    )
    return success_response(_format_rag_response(response, document))


# ─────────────────────────────────────────────────────────────────
#  Force Simple RAG
# ─────────────────────────────────────────────────────────────────

@router.post('/simple')
async def chat_simple(
    payload:      dict,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    """
    Force simple RAG (retrieve → generate, no grading or rewriting).
    Faster and uses fewer LLM tokens than agent mode.
    """
    document_id, question = _validate_chat_payload(payload)
    top_k    = int(payload.get('top_k', 5))
    document = await _get_owned_doc(document_id, current_user.id, db)

    response = await rag_service.answer(
        question    = question,
        document_id = document_id,
        db          = db,
        top_k       = top_k,
        use_agent   = False,
    )
    return success_response(_format_rag_response(response, document))


# ─────────────────────────────────────────────────────────────────
#  Multi-Tool Document Agent  (NEW — LangGraph intent router)
# ─────────────────────────────────────────────────────────────────

@router.post('/ask')
async def ask_document(
    payload:      dict,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    """
    Multi-tool document agent.
    Automatically classifies intent and routes to the right tool.

    Examples:
      "What was the revenue?"    → answer_question (CRAG)
      "Summarise this document"  → summarize
      "Extract company name and date" → extract_fields
      "Find sections about risk"  → search

    Request:
        { "document_id": "uuid", "message": "Summarise this document for me" }
    """
    from app.agents.document_agent import document_agent

    document_id = payload.get('document_id', '').strip()
    message     = payload.get('message', '').strip()

    if not document_id:
        raise ValidationError('document_id is required.')
    if not message:
        raise ValidationError('message is required.')

    document = await _get_owned_doc(document_id, current_user.id, db)

    result = await document_agent.run(
        user_input  = message,
        document_id = document_id,
        filename    = document.original_filename,
        db          = db,
    )

    return success_response({
        'message': message,
        'intent':  result['intent'],
        'result':  result['result'],
    })