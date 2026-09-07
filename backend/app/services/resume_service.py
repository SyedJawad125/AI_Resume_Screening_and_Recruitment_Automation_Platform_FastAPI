"""
app/services/resume_service.py
───────────────────────────────────
Orchestrates the resume pipeline described in the architecture doc:

    Upload → Validate → Extract text (+ OCR if needed) → Clean →
    Resume Parser Agent → Structured Candidate → Postgres →
    Embedding → pgvector

This runs synchronously per resume for now (Phase: Celery/Redis batch
processing comes later and will call this same function from a task —
the pipeline logic itself doesn't change, only how it's invoked).
"""

import os
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ValidationError
from app.document_processing.extractor import extract_document
from app.agents.resume_parser_agent import parse_resume
from app.embeddings.service import embed_text, candidate_profile_text
from app.models.candidate import Candidate
from app.models.resume import Resume, ProcessingStatus
from app.models.embedding import CandidateEmbedding, EmbeddingKind


def _validate_upload(filename: str, size_bytes: int) -> None:
    ext = "." + filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext not in settings.allowed_resume_extensions_list:
        raise ValidationError(f"Unsupported file type '{ext}'. Allowed: {settings.allowed_resume_extensions_list}")

    max_bytes = settings.MAX_RESUME_FILE_SIZE_MB * 1024 * 1024
    if size_bytes > max_bytes:
        raise ValidationError(f"File exceeds the {settings.MAX_RESUME_FILE_SIZE_MB}MB limit.")


async def create_queued_resume(
    db: AsyncSession,
    company_id: str,
    job_id: str | None,
    uploaded_by_id: str,
    filename: str,
    file_bytes: bytes,
) -> Resume:
    """Fast path, called directly from the API request: validate, save the
    file to disk, and create a QUEUED Resume row. Returns immediately —
    the actual extraction/parsing/embedding happens in a Celery task
    (see app.tasks.resume_tasks) so the upload endpoint never blocks on
    OCR or an LLM call."""

    _validate_upload(filename, len(file_bytes))

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    storage_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4()}_{filename}")
    with open(storage_path, "wb") as f:
        f.write(file_bytes)

    resume = Resume(
        company_id=company_id,
        job_id=job_id,
        uploaded_by_id=uploaded_by_id,
        original_filename=filename,
        storage_path=storage_path,
        file_size_bytes=len(file_bytes),
        status=ProcessingStatus.QUEUED,
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume


async def run_resume_pipeline(db: AsyncSession, resume_id: str) -> Resume:
    """The heavy pipeline: extract → OCR fallback → parse → embed → persist.
    Called synchronously (process_resume_upload, below) for single ad-hoc
    uploads, or from a Celery task (app.tasks.resume_tasks) for batches —
    same function either way, so behavior never diverges between the two
    call paths."""

    resume = (await db.execute(select(Resume).where(Resume.id == resume_id))).scalar_one_or_none()
    if not resume:
        raise ValidationError(f"Resume {resume_id} not found.")

    resume.status = ProcessingStatus.PROCESSING
    await db.commit()

    try:
        with open(resume.storage_path, "rb") as f:
            file_bytes = f.read()

        extracted = extract_document(file_bytes, resume.original_filename)
        resume.raw_text = extracted.full_text
        resume.pages = extracted.pages
        resume.page_count = extracted.page_count
        resume.used_ocr = extracted.used_ocr

        if not extracted.full_text.strip():
            raise ValidationError("No extractable text found in the document (even after OCR).")

        parsed = await parse_resume(extracted.full_text)

        candidate = Candidate(
            company_id=resume.company_id,
            name=parsed.name,
            email=parsed.email,
            phone=parsed.phone,
            location=parsed.location,
            summary=parsed.summary,
            experience_years=parsed.experience_years,
            skills=parsed.skills,
            education=[e.model_dump() for e in parsed.education],
            work_experience=[w.model_dump() for w in parsed.work_experience],
            projects=[p.model_dump() for p in parsed.projects],
            certifications=parsed.certifications,
            languages=parsed.languages,
            raw_llm_output=parsed.model_dump(),
        )
        db.add(candidate)
        await db.flush()

        resume.candidate_id = candidate.id

        profile_text = candidate_profile_text(candidate)
        if profile_text.strip():
            vector = embed_text(profile_text)
            db.add(
                CandidateEmbedding(
                    candidate_id=candidate.id,
                    kind=EmbeddingKind.PROFILE,
                    source_text=profile_text,
                    embedding=vector,
                )
            )

        resume.status = ProcessingStatus.COMPLETED

    except Exception as exc:
        resume.status = ProcessingStatus.FAILED
        resume.error_message = str(exc)

    await db.commit()
    await db.refresh(resume)
    return resume


async def process_resume_upload(
    db: AsyncSession,
    company_id: str,
    job_id: str | None,
    uploaded_by_id: str,
    filename: str,
    file_bytes: bytes,
) -> Resume:
    """Convenience wrapper for synchronous, single-file processing (used by
    tests and small ad-hoc uploads). Batch uploads from the API go through
    create_queued_resume() + a Celery task instead — see app/api/v1/jobs.py."""
    resume = await create_queued_resume(db, company_id, job_id, uploaded_by_id, filename, file_bytes)
    return await run_resume_pipeline(db, str(resume.id))
