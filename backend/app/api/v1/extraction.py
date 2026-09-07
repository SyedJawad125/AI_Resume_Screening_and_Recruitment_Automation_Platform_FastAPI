"""
app/api/v1/extraction.py
─────────────────────────
Structured JSON extraction endpoint.

POST /api/v1/extraction/{document_id}
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.extraction_service import extraction_service
from app.repositories.document_repository import DocumentRepository
from app.core.exceptions import NotFoundError, ValidationError
from app.utils.response import success_response

router = APIRouter()


@router.post('/{document_id}')
async def extract_fields(
    document_id:  str,
    payload:      dict,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    """
    Extract specific fields from a document.

    Request:
        { "fields": ["company_name", "revenue", "employees", "founded_year"] }

    Response:
        {
            "company_name": {"value": "Acme Corp", "status": "found"},
            "revenue":      {"value": "$14.2M",    "status": "found"},
            "employees":    {"value": null,         "status": "not_found"}
        }

    Status values:
        found     → extracted with high confidence
        not_found → not present in document
        uncertain → found but LLM has low confidence
    """
    fields = payload.get('fields', [])

    if not fields:
        raise ValidationError('fields list is required and must not be empty.')
    if len(fields) > 20:
        raise ValidationError('Maximum 20 fields per request.')

    # Verify ownership
    doc_repo = DocumentRepository(db)
    document = await doc_repo.get_by_id(document_id, user_id=current_user.id)
    if not document:
        raise NotFoundError('Document')

    result = await extraction_service.extract(
        document_id = document_id,
        fields      = fields,
        db          = db,
    )

    return success_response({
        'document_id': result.document_id,
        'filename':    result.filename,
        'model':       result.model,
        'fields': {
            field: {
                'value':  r.value,
                'status': r.status,
            }
            for field, r in result.fields.items()
        },
    })