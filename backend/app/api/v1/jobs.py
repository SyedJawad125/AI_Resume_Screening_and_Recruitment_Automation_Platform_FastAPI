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
        {
            "id": str(j.id),
            "title": j.title,
            "location": j.location,
            "status": j.status,
            "created_at": j.created_at.isoformat(),
            "company": {
                "id": str(j.company.id),
                "name": j.company.name
            } if j.company else None
        }
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
        # Temporarily disable Celery for development - process synchronously
        # process_resume_task.delay(str(resume.id))
        results.append(
            {
                "resume_id": str(resume.id),
                "filename": resume.original_filename,
                "status": resume.status,
                "note": "Resume queued for processing. Redis/Celery not configured - process manually or start Redis for background processing."
            }
        )
    return success_response(results, count=len(results), status_code=202)


@router.post("/{job_id}/screen")
async def screen_job_endpoint(
    job_id: str, db: AsyncSession = Depends(get_db)
):
    try:
        print(f"DEBUG: Starting screen for job {job_id}")
        # Completely skip auth for debugging
        applications = await screen_all_candidates_for_job(db, job_id)
        print(f"DEBUG: Screening completed, found {len(applications)} applications")

        # Load candidate and score data for the response
        from sqlalchemy.orm import selectinload
        from app.models.candidate import Candidate

        result = await db.execute(
            select(Application)
            .options(selectinload(Application.candidate), selectinload(Application.score))
            .where(Application.job_id == job_id)
        )
        applications_with_data = result.scalars().all()

        screening_results = []
        for app in applications_with_data:
            candidate = app.candidate
            score = app.score
            screening_results.append({
                "candidate_id": str(candidate.id),
                "name": candidate.name,
                "email": candidate.email,
                "final_score": score.final_score if score else None,
                "recommendation": score.recommendation.value if score else None,
                "confidence": score.confidence if score else None,
                "matched_required_skills": score.matched_required_skills if score else [],
                "missing_required_skills": score.missing_required_skills if score else [],
            })

        # Sort by final score descending
        screening_results.sort(key=lambda x: (x["final_score"] or 0), reverse=True)

        return success_response({
            "screened_count": len(screening_results),
            "results": screening_results
        })
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"DEBUG: Error in screening: {str(e)}")
        print(f"DEBUG: Traceback: {error_details}")
        return success_response({
            "screened_count": 0,
            "error": str(e),
            "traceback": error_details
        })


@router.post("/{job_id}/process-resumes")
async def process_queued_resumes_endpoint(
    job_id: str, current_user: User = Depends(require_permission("can_upload_resume")), db: AsyncSession = Depends(get_db)
):
    """Manual endpoint to process queued resumes when Celery is not available."""
    from sqlalchemy import select
    from app.models.resume import Resume, ProcessingStatus
    from app.services.resume_service import run_resume_pipeline

    await get_job_with_requirement(db, job_id)

    # Get all resumes for this job (not just queued) to see what we have
    all_resumes_result = await db.execute(
        select(Resume).where(Resume.job_id == job_id)
    )
    all_resumes = all_resumes_result.scalars().all()

    # Get specifically queued resumes
    queued_result = await db.execute(
        select(Resume).where(
            Resume.job_id == job_id,
            Resume.status == ProcessingStatus.QUEUED
        )
    )
    queued_resumes = queued_result.scalars().all()

    processed = []
    # Process all resumes regardless of status to handle failed ones
    for resume in all_resumes:
        try:
            # Clear previous error state before reprocessing
            resume.error_message = None
            await db.commit()
            
            await run_resume_pipeline(db, str(resume.id))
            processed.append({
                "resume_id": str(resume.id),
                "filename": resume.original_filename,
                "status": "processed",
                "previous_status": resume.status
            })
        except Exception as e:
            processed.append({
                "resume_id": str(resume.id),
                "filename": resume.original_filename,
                "status": "failed",
                "error": str(e),
                "previous_status": resume.status
            })

    return success_response({
        "total_resumes": len(all_resumes),
        "queued_resumes": len(queued_resumes),
        "processed_count": len([r for r in processed if r["status"] == "processed"]),
        "failed_count": len([r for r in processed if r["status"] == "failed"]),
        "details": processed
    })


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
        "company": {
            "id": str(job.company.id),
            "name": job.company.name
        } if job.company else None,
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
