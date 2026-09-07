"""
app/api/v1/candidates.py
──────────────────────────
GET /api/v1/candidates/{candidate_id}                → full candidate profile
GET /api/v1/candidates/{candidate_id}/score?job_id=.. → explainable score for a specific job
POST /api/v1/candidates/compare                        → compare 2+ candidates for a job
"""

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.core.exceptions import NotFoundError, ValidationError
from app.models.user import User
from app.models.candidate import Candidate
from app.models.application import Application
from app.utils.response import success_response

router = APIRouter()


@router.get("/{candidate_id}")
async def get_candidate(candidate_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    candidate = (await db.execute(select(Candidate).where(Candidate.id == candidate_id))).scalar_one_or_none()
    if not candidate:
        raise NotFoundError("Candidate")

    return success_response(
        {
            "id": str(candidate.id),
            "name": candidate.name,
            "email": candidate.email,
            "phone": candidate.phone,
            "location": candidate.location,
            "summary": candidate.summary,
            "experience_years": candidate.experience_years,
            "skills": candidate.skills,
            "education": candidate.education,
            "work_experience": candidate.work_experience,
            "projects": candidate.projects,
            "certifications": candidate.certifications,
            "languages": candidate.languages,
        }
    )


@router.get("/{candidate_id}/score")
async def get_candidate_score(
    candidate_id: str,
    job_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application)
        .options(selectinload(Application.score))
        .where(Application.candidate_id == candidate_id, Application.job_id == job_id)
    )
    application = result.scalar_one_or_none()
    if not application or not application.score:
        raise NotFoundError("Score for this candidate/job pair — has screening been run yet?")

    score = application.score
    return success_response(
        {
            "final_score": score.final_score,
            "recommendation": score.recommendation,
            "confidence": score.confidence,
            "breakdown": {
                "required_skills_score": score.required_skills_score,
                "experience_score": score.experience_score,
                "semantic_score": score.semantic_score,
                "projects_score": score.projects_score,
                "preferred_skills_score": score.preferred_skills_score,
            },
            "weights_used": score.weights_used,
            "matched_required_skills": score.matched_required_skills,
            "missing_required_skills": score.missing_required_skills,
            "matched_preferred_skills": score.matched_preferred_skills,
            "strengths": score.strengths,
            "evidence": score.evidence,
        }
    )


class CompareRequest(BaseModel):
    job_id: str
    candidate_ids: list[str]


@router.post("/compare")
async def compare_candidates(
    payload: CompareRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    if len(payload.candidate_ids) < 2:
        raise ValidationError("Provide at least two candidate_ids to compare.")

    result = await db.execute(
        select(Application)
        .options(selectinload(Application.candidate), selectinload(Application.score))
        .where(Application.job_id == payload.job_id, Application.candidate_id.in_(payload.candidate_ids))
    )
    applications = result.scalars().all()

    rows = []
    for app_ in applications:
        if not app_.score:
            continue
        rows.append(
            {
                "candidate_id": str(app_.candidate_id),
                "name": app_.candidate.name,
                "required_skills_score": app_.score.required_skills_score,
                "experience_score": app_.score.experience_score,
                "semantic_score": app_.score.semantic_score,
                "projects_score": app_.score.projects_score,
                "preferred_skills_score": app_.score.preferred_skills_score,
                "final_score": app_.score.final_score,
                "recommendation": app_.score.recommendation,
            }
        )

    rows.sort(key=lambda r: r["final_score"], reverse=True)
    return success_response(rows, count=len(rows))
