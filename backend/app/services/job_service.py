"""
app/services/job_service.py
────────────────────────────────
Business logic for jobs — kept out of the API route functions so routes
stay thin (parse request → call service → format response).
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.agents.job_analysis_agent import analyze_job_description
from app.core.exceptions import NotFoundError
from app.models.job import Job, JobRequirement, JobStatus


async def create_job(db: AsyncSession, company_id: str, created_by_id: str, title: str, description: str, location: str | None) -> Job:
    job = Job(
        company_id=company_id,
        created_by_id=created_by_id,
        title=title,
        description=description,
        location=location,
        status=JobStatus.DRAFT,
    )
    db.add(job)
    await db.flush()

    # Run the Job Analysis Agent immediately so the job is screening-ready
    # as soon as it's created. If the LLM call fails, the job still exists
    # (as DRAFT) — the recruiter can retry analysis via a separate endpoint
    # rather than losing the whole creation.
    analysis = await analyze_job_description(title, description)

    requirement = JobRequirement(
        job_id=job.id,
        required_skills=analysis.required_skills,
        preferred_skills=analysis.preferred_skills,
        minimum_experience_years=analysis.minimum_experience_years,
        education_requirements=analysis.education_requirements,
        responsibilities=analysis.responsibilities,
        skill_weights=analysis.skill_weights,
        raw_llm_output=analysis.model_dump(),
    )
    db.add(requirement)
    job.status = JobStatus.OPEN

    await db.commit()
    await db.refresh(job)
    return job


async def get_job_with_requirement(db: AsyncSession, job_id: str) -> Job:
    result = await db.execute(
        select(Job).options(selectinload(Job.requirement)).where(Job.id == job_id, Job.deleted == False)  # noqa: E712
    )
    job = result.scalar_one_or_none()
    if not job:
        raise NotFoundError("Job")
    return job


async def list_jobs(db: AsyncSession, company_id: str, page: int, page_size: int):
    from sqlalchemy import func

    q = select(Job).where(Job.company_id == company_id, Job.deleted == False).order_by(Job.created_at.desc())  # noqa: E712
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
    result = await db.execute(q.offset((page - 1) * page_size).limit(page_size))
    return result.scalars().all(), total
