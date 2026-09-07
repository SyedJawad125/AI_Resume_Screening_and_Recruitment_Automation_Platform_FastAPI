"""
app/api/v1/documents.py
────────────────────────
Document management endpoints.

POST   /api/v1/documents/upload           → upload PDF, start processing
GET    /api/v1/documents/                 → list user's documents
GET    /api/v1/documents/{id}             → document detail
GET    /api/v1/documents/{id}/status      → processing status + progress
DELETE /api/v1/documents/{id}             → soft delete
POST   /api/v1/documents/{id}/summary     → generate AI summary
GET    /api/v1/documents/{id}/report      → download PDF report
"""

import os
import uuid
import aiofiles
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db, AsyncSessionLocal
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.document import DocumentStatus
from app.repositories.document_repository import DocumentRepository
from app.services.summary_service import summary_service
from app.services.report_service import report_service
from app.workers.document_worker import document_worker
from app.core.config import settings
from app.core.exceptions import (
    FileTooLargeError, UnsupportedFileTypeError, NotFoundError, ForbiddenError
)
from app.utils.response import success_response, paginated_response

router = APIRouter()

ALLOWED_TYPES = {'application/pdf', 'application/x-pdf'}
ALLOWED_EXTS  = {'.pdf'}


# ─────────────────────────────────────────────────────────────────
#  Background Task Helper
# ─────────────────────────────────────────────────────────────────

async def process_document_background(document_id: str):
    """
    Background task wrapper that creates a new database session.
    FastAPI BackgroundTasks cannot use the request's db session.
    """
    async with AsyncSessionLocal() as db:
        await document_worker.process(document_id, db)


# ─────────────────────────────────────────────────────────────────
#  Upload
# ─────────────────────────────────────────────────────────────────

@router.post('/upload', status_code=202)
async def upload_document(
    background_tasks: BackgroundTasks,
    file:         UploadFile = File(...),
    current_user: User       = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    """
    Upload a PDF document.
    Returns immediately with document_id.
    Processing starts in the background.
    Poll /status to check progress.
    """
    # Validate extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTS:
        raise UnsupportedFileTypeError(['PDF'])

    # Read file into memory to check size
    content = await file.read()
    if len(content) > settings.max_file_size_bytes:
        raise FileTooLargeError(settings.MAX_FILE_SIZE_MB)

    # Generate unique filename
    doc_id        = str(uuid.uuid4())
    safe_filename = f'{doc_id}{ext}'
    file_path     = os.path.join(settings.UPLOAD_DIR, safe_filename)

    # Save file asynchronously
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)

    # Create DB record
    doc_repo = DocumentRepository(db)
    document = await doc_repo.create(
        id                = doc_id,
        user_id           = str(current_user.id),
        company_id        = str(current_user.company_id) if current_user.company_id else None,
        filename          = safe_filename,
        original_filename = file.filename,
        file_path         = file_path,
        file_size         = len(content),
        mime_type         = file.content_type or 'application/pdf',
        status            = DocumentStatus.UPLOADED,
    )
    await db.commit()

    # Start processing in background
    # Note: We pass document_id only, not db session, to avoid session issues
    background_tasks.add_task(process_document_background, doc_id)

    return success_response({
        'document_id': doc_id,
        'filename':    file.filename,
        'file_size_mb': round(len(content) / (1024 * 1024), 2),
        'status':      'uploaded',
        'message':     'Document uploaded. Processing has started.',
    }, status_code=202)


# ─────────────────────────────────────────────────────────────────
#  List
# ─────────────────────────────────────────────────────────────────

@router.get('/')
async def list_documents(
    page:         int = Query(1, ge=1),
    page_size:    int = Query(20, ge=1, le=100),
    status:       str = Query(None),
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    doc_repo          = DocumentRepository(db)
    documents, total  = await doc_repo.list_by_user(
        current_user.id, status=status, page=page, page_size=page_size
    )
    data = [
        {
            'id':           str(d.id),
            'filename':     d.original_filename,
            'file_size_mb': d.file_size_mb,
            'status':       d.status,
            'progress':     d.progress,
            'page_count':   d.page_count,
            'created_at':   d.created_at.isoformat(),
        }
        for d in documents
    ]
    return paginated_response(data, total, page, page_size)


# ─────────────────────────────────────────────────────────────────
#  Detail
# ─────────────────────────────────────────────────────────────────

@router.get('/{document_id}')
async def get_document(
    document_id:  str,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    doc_repo = DocumentRepository(db)
    document = await doc_repo.get_by_id(document_id)
    if not document:
        raise NotFoundError('Document')
    
    # Check if user has access to this document
    if str(document.user_id) != str(current_user.id) and not current_user.is_superuser:
        raise ForbiddenError('You do not have access to this document')

    return success_response({
        'id':             str(document.id),
        'filename':       document.original_filename,
        'file_size_mb':   document.file_size_mb,
        'mime_type':      document.mime_type,
        'status':         document.status,
        'progress':       document.progress,
        'page_count':     document.page_count,
        'error':          document.processing_error,
        'created_at':     document.created_at.isoformat(),
        'updated_at':     document.updated_at.isoformat(),
    })


# ─────────────────────────────────────────────────────────────────
#  Status
# ─────────────────────────────────────────────────────────────────

@router.get('/{document_id}/status')
async def document_status(
    document_id:  str,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    doc_repo = DocumentRepository(db)
    document = await doc_repo.get_by_id(document_id)
    if not document:
        raise NotFoundError('Document')
    
    # Check if user has access to this document
    if str(document.user_id) != str(current_user.id) and not current_user.is_superuser:
        raise ForbiddenError('You do not have access to this document')

    return success_response({
        'document_id': str(document.id),
        'filename':    document.original_filename,
        'status':      document.status,
        'progress':    document.progress,
        'page_count':  document.page_count,
        'error':       document.processing_error,
    })


# ─────────────────────────────────────────────────────────────────
#  Delete
# ─────────────────────────────────────────────────────────────────

@router.delete('/{document_id}')
async def delete_document(
    document_id:  str,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    doc_repo = DocumentRepository(db)
    document = await doc_repo.get_by_id(document_id)
    if not document:
        raise NotFoundError('Document')
    
    # Check if user has access to this document
    if str(document.user_id) != str(current_user.id) and not current_user.is_superuser:
        raise ForbiddenError('You do not have access to this document')

    await doc_repo.delete(document_id)
    await db.commit()
    return success_response({'message': 'Document deleted.'})


# ─────────────────────────────────────────────────────────────────
#  Summary
# ─────────────────────────────────────────────────────────────────

@router.post('/{document_id}/summary')
async def generate_summary(
    document_id:  str,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    """Generate AI summary using hierarchical summarization."""
    doc_repo = DocumentRepository(db)
    document = await doc_repo.get_by_id(document_id)
    if not document:
        raise NotFoundError('Document')
    
    # Check if user has access to this document
    if str(document.user_id) != str(current_user.id) and not current_user.is_superuser:
        raise ForbiddenError('You do not have access to this document')

    result = await summary_service.summarize(document_id, db)
    return success_response({
        'document_id':       result.document_id,
        'filename':          result.filename,
        'executive_summary': result.executive_summary,
        'key_points':        result.key_points,
        'important_facts':   result.important_facts,
        'important_numbers': result.important_numbers,
        'risks':             result.risks,
        'conclusion':        result.conclusion,
        'model':             result.model,
    })


# ─────────────────────────────────────────────────────────────────
#  Report Download
# ─────────────────────────────────────────────────────────────────

@router.get('/{document_id}/report')
async def download_report(
    document_id:  str,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    """Generate and download a PDF report."""
    doc_repo = DocumentRepository(db)
    document = await doc_repo.get_by_id(document_id)
    if not document:
        raise NotFoundError('Document')
    
    # Check if user has access to this document
    if str(document.user_id) != str(current_user.id) and not current_user.is_superuser:
        raise ForbiddenError('You do not have access to this document')

    # Build report data
    doc_info = {
        'filename':     document.original_filename,
        'page_count':   document.page_count,
        'file_size_mb': document.file_size_mb,
        'created_at':   document.created_at.isoformat(),
    }

    # Load summary if available
    summary_data = None
    if document.ai_summary:
        import json
        try:
            summary_data = json.loads(document.ai_summary)
        except Exception:
            pass

    # Generate PDF
    pdf_bytes   = report_service.generate_report(doc_info, summary=summary_data)
    report_path = report_service.save_report(pdf_bytes, document_id)
    
    return FileResponse(
        path             = report_path,
        media_type       = 'application/pdf',
        filename         = f'report_{document.original_filename}',
    )