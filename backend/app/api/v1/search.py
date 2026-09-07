"""
app/api/v1/search.py
─────────────────────
Vector similarity search endpoint.

POST /api/v1/search
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.vector_search_service import vector_search_service
from app.repositories.document_repository import DocumentRepository
from app.core.exceptions import NotFoundError, ValidationError
from app.utils.response import success_response

router = APIRouter()


@router.post('/')
async def search_document(
    payload:      dict,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    """
    Semantic vector search within a document.

    Request:
        { "query": "revenue figures", "document_id": "uuid", "top_k": 5 }

    Returns top-K chunks ranked by cosine similarity.
    """
    query       = payload.get('query', '').strip()
    document_id = payload.get('document_id', '').strip()
    top_k       = int(payload.get('top_k', 5))

    if not query:
        raise ValidationError('query is required.')
    if not document_id:
        raise ValidationError('document_id is required.')
    if not 1 <= top_k <= 20:
        raise ValidationError('top_k must be between 1 and 20.')

    # Verify ownership
    doc_repo = DocumentRepository(db)
    document = await doc_repo.get_by_id(document_id, user_id=current_user.id)
    if not document:
        raise NotFoundError('Document')
    if not document.is_ready:
        raise ValidationError(f'Document is not ready. Status: {document.status}')

    results = await vector_search_service.search(
        query       = query,
        document_id = document_id,
        db          = db,
        top_k       = top_k,
    )

    return success_response({
        'query':   query,
        'count':   len(results),
        'results': [
            {
                'chunk_id':    r.chunk_id,
                'content':     r.content,
                'document_id': r.document_id,
                'page_number': r.page_number,
                'similarity':  r.similarity,
            }
            for r in results
        ],
    })