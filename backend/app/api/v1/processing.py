"""
app/api/v1/processing.py
────────────────────────────
GET /api/v1/processing/{resume_id}

Polls the status of a single resume's async pipeline (Queued → Processing
→ Completed/Failed). We reuse the Resume row itself as the status tracker
rather than adding a separate `processing_jobs` table — a resume's
lifecycle IS the processing job for this pipeline, and nothing else in
the app needs to enqueue tracked async work yet. Add a dedicated
ProcessingJob table only if/when something beyond resume ingestion needs
the same tracking (YAGNI over the letter of the original schema list).
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.models.resume import Resume
from app.utils.response import success_response

router = APIRouter()


@router.get("/{resume_id}")
async def get_processing_status(
    resume_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    resume = (await db.execute(select(Resume).where(Resume.id == resume_id))).scalar_one_or_none()
    if not resume:
        raise NotFoundError("Resume")

    return success_response(
        {
            "resume_id": str(resume.id),
            "filename": resume.original_filename,
            "status": resume.status,
            "used_ocr": resume.used_ocr,
            "candidate_id": str(resume.candidate_id) if resume.candidate_id else None,
            "error": resume.error_message,
        }
    )
