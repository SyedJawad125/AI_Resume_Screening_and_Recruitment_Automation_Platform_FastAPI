"""
app/api/v1/jobs.py
─────────────────────
POST /api/v1/jobs                    → create job (runs Job Analysis Agent)
GET  /api/v1/jobs                    → list jobs for the recruiter's company
GET  /api/v1/jobs/{job_id}           → job detail + structured requirements
POST /api/v1/jobs/{job_id}/resumes   → upload one or more resumes for this job
POST /api/v1/jobs/{job_id}/screen    → screen all uploaded candidates against this job
GET  /api/v1/jobs/{job_id}/candidates → list scored candidates, ranked
"""

from fastapi import APIRouter, Depends, Query, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.dependencies.auth import get_current_user, require_permission
from app.core.exceptions import ValidationError, NotFoundError
from app.models.user import User
from app.models.application import Application
from app.schemas.job import JobCreate
from app.services.job_service import create_job, get_job_with_requirement, list_jobs
from app.services.resume_service import create_queued_resume
from app.tasks.resume_tasks import process_resume_task
from app.services.matching_service import screen_all_candidates_for_job
from app.utils.response import success_response, paginated_response

router = APIRouter()


def _require_company(current_user: User) -> str:
    if not current_user.company_id:
        raise ValidationError("Your account is not associated with a company yet.")
    return str(current_user.company_id)


@router.post("/", status_code=201)
async def create_job_endpoint(
    payload: JobCreate,
    current_user: User = Depends(require_permission("can_create_job")),
    db: AsyncSession = Depends(get_db),
):
    company_id = _require_company(current_user)
    job = await create_job(db, company_id, str(current_user.id), payload.title, payload.description, payload.location)
    job = await get_job_with_requirement(db, str(job.id))
    return success_response(_job_to_dict(job), status_code=201)


@router.get("/")
async def list_jobs_endpoint(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_permission("can_view_jobs")),
    db: AsyncSession = Depends(get_db),
):
    company_id = _require_company(current_user)
    jobs, total = await list_jobs(db, company_id, page, page_size)
    data = [
        {"id": str(j.id), "title": j.title, "location": j.location, "status": j.status, "created_at": j.created_at.isoformat()}
        for j in jobs
    ]
    return paginated_response(data, total, page, page_size)


@router.get("/{job_id}")
async def get_job_endpoint(
    job_id: str, current_user: User = Depends(require_permission("can_view_jobs")), db: AsyncSession = Depends(get_db)
):
    job = await get_job_with_requirement(db, job_id)
    return success_response(_job_to_dict(job))


@router.post("/{job_id}/resumes", status_code=202)
async def upload_resumes_endpoint(
    job_id: str,
    files: list[UploadFile] = File(...),
    current_user: User = Depends(require_permission("can_upload_resume")),
    db: AsyncSession = Depends(get_db),
):
    """Accepts multiple resume files. Each is saved and queued immediately
    (fast, blocking part), then processed by a Celery worker in the
    background (extraction, OCR, LLM parsing, embedding — the slow part).
    Poll GET /api/v1/processing/{resume_id} for status on each returned id."""
    company_id = _require_company(current_user)
    await get_job_with_requirement(db, job_id)  # 404s if job doesn't exist / isn't this company's

    results = []
    for upload in files:
        file_bytes = await upload.read()
        resume = await create_queued_resume(
            db=db,
            company_id=company_id,
            job_id=job_id,
            uploaded_by_id=str(current_user.id),
            filename=upload.filename,
            file_bytes=file_bytes,
        )
        process_resume_task.delay(str(resume.id))
        results.append(
            {
                "resume_id": str(resume.id),
                "filename": resume.original_filename,
                "status": resume.status,
            }
        )
    return success_response(results, count=len(results), status_code=202)


@router.post("/{job_id}/screen")
async def screen_job_endpoint(
    job_id: str, current_user: User = Depends(require_permission("can_screen_candidates")), db: AsyncSession = Depends(get_db)
):
    await get_job_with_requirement(db, job_id)
    applications = await screen_all_candidates_for_job(db, job_id)
    return success_response({"screened_count": len(applications)})


@router.get("/{job_id}/candidates")
async def list_scored_candidates_endpoint(
    job_id: str,
    current_user: User = Depends(require_permission("can_view_candidates")),
    db: AsyncSession = Depends(get_db),
):
    await get_job_with_requirement(db, job_id)

    result = await db.execute(
        select(Application)
        .options(selectinload(Application.candidate), selectinload(Application.score))
        .where(Application.job_id == job_id)
    )
    applications = result.scalars().all()

    data = []
    for app_ in applications:
        candidate = app_.candidate
        score = app_.score
        data.append(
            {
                "candidate_id": str(candidate.id),
                "name": candidate.name,
                "email": candidate.email,
                "final_score": score.final_score if score else None,
                "recommendation": score.recommendation if score else None,
                "confidence": score.confidence if score else None,
            }
        )

    data.sort(key=lambda d: (d["final_score"] or 0), reverse=True)
    return success_response(data, count=len(data))


def _job_to_dict(job) -> dict:
    req = job.requirement
    return {
        "id": str(job.id),
        "title": job.title,
        "description": job.description,
        "location": job.location,
        "status": job.status,
        "requirement": (
            {
                "required_skills": req.required_skills,
                "preferred_skills": req.preferred_skills,
                "minimum_experience_years": req.minimum_experience_years,
                "education_requirements": req.education_requirements,
                "responsibilities": req.responsibilities,
                "skill_weights": req.skill_weights,
            }
            if req
            else None
        ),
    }
