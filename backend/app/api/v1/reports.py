"""
app/api/v1/reports.py
──────────────────────
PDF report generation and download.

GET /api/v1/reports/{document_id}
"""

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.report_service import report_service
from app.services.summary_service import summary_service
from app.repositories.document_repository import DocumentRepository
from app.core.exceptions import NotFoundError, ValidationError

router = APIRouter()


@router.get('/{document_id}')
async def download_report(
    document_id:  str,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    """
    Generate and download a full PDF report.

    The report includes:
      - Document information
      - Executive summary (if generated)
      - Extracted data (if run)
      - Processing info
    """
    doc_repo = DocumentRepository(db)
    document = await doc_repo.get_by_id(document_id, user_id=current_user.id)
    if not document:
        raise NotFoundError('Document')
    if not document.is_ready:
        raise ValidationError(f'Document is not ready. Status: {document.status}')

    doc_info = {
        'filename':     document.original_filename,
        'page_count':   document.page_count,
        'file_size_mb': document.file_size_mb,
        'created_at':   document.created_at.isoformat(),
    }

    # Include summary if available
    summary_data = None
    if document.ai_summary:
        import json
        try:
            summary_data = json.loads(document.ai_summary)
        except Exception:
            pass

    # Include extraction data if available
    extraction_data = None
    if document.extracted_data:
        extraction_data = document.extracted_data

    pdf_bytes = report_service.generate_report(
        document_info   = doc_info,
        summary         = summary_data,
        extraction_data = extraction_data,
    )

    return Response(
        content      = pdf_bytes,
        media_type   = 'application/pdf',
        headers      = {
            'Content-Disposition': f'attachment; filename="report_{document.original_filename}"',
            'Content-Length':      str(len(pdf_bytes)),
        },
    )