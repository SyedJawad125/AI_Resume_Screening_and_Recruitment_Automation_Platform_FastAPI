"""
app/services/matching_service.py
─────────────────────────────────────
Orchestrates one candidate-vs-job screening:

    Candidate + Job → Hard requirement data → Matching Engine (scoring) →
    Evidence Retrieval → Application + CandidateScore persisted

This is the non-LLM-randomness path described in section 12 of the spec:
the LLM was already used upstream (Job Analysis Agent, Resume Parser
Agent) to produce structured data; this step is pure, deterministic
computation over that structured data.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError, ValidationError
from app.models.application import Application, CandidateScore, Recommendation
from app.models.candidate import Candidate
from app.models.resume import Resume
from app.workflows.graph import run_recruitment_workflow


async def screen_candidate(db: AsyncSession, job_id: str, candidate_id: str) -> Application:
    """Runs the full LangGraph recruitment workflow (load_data → matching →
    evidence → evaluation → decision → shortlist/review_reject) and
    persists the result. The graph is the single source of truth for how a
    candidate gets scored — this function's job is purely to translate the
    graph's final state into database rows."""

    candidate = (await db.execute(select(Candidate).where(Candidate.id == candidate_id))).scalar_one_or_none()
    if not candidate:
        raise NotFoundError("Candidate")

    final_state = await run_recruitment_workflow(db, candidate_id=candidate_id, job_id=job_id)

    if final_state.get("error"):
        raise ValidationError(final_state["error"])

    resume = (
        await db.execute(select(Resume).where(Resume.candidate_id == candidate.id).order_by(Resume.created_at.desc()))
    ).scalars().first()

    strengths = list(final_state.get("llm_strengths", []))
    if candidate.experience_years:
        strengths.insert(0, f"{candidate.experience_years} years of professional experience")

    existing = (
        await db.execute(
            select(Application).where(Application.job_id == job_id, Application.candidate_id == candidate_id)
        )
    ).scalar_one_or_none()

    application = existing or Application(job_id=job_id, candidate_id=candidate_id, resume_id=resume.id if resume else None)
    if not existing:
        db.add(application)
        await db.flush()

    score_row = application.score or CandidateScore(application_id=application.id)
    score_row.required_skills_score = final_state["skill_score"]
    score_row.experience_score = final_state["experience_score"]
    score_row.semantic_score = final_state["semantic_score"]
    score_row.projects_score = final_state["projects_score"]
    score_row.preferred_skills_score = final_state["preferred_skills_score"]
    score_row.final_score = final_state["final_score"]
    score_row.recommendation = Recommendation(final_state["recommendation"])
    score_row.confidence = final_state["confidence"]
    score_row.matched_required_skills = final_state["matched_required_skills"]
    score_row.missing_required_skills = final_state["missing_required_skills"]
    score_row.matched_preferred_skills = final_state["matched_preferred_skills"]
    score_row.evidence = final_state["retrieved_evidence"]
    score_row.strengths = strengths
    score_row.weights_used = final_state["explanation"]["breakdown"]

    if not application.score:
        db.add(score_row)

    await db.commit()
    await db.refresh(application)
    return application


async def screen_all_candidates_for_job(db: AsyncSession, job_id: str) -> list[Application]:
    """Batch-screen every candidate who has a resume tied to this job."""
    candidate_ids = (
        (await db.execute(select(Resume.candidate_id).where(Resume.job_id == job_id, Resume.candidate_id.is_not(None))))
        .scalars()
        .all()
    )
    applications = []
    for candidate_id in set(candidate_ids):
        applications.append(await screen_candidate(db, job_id, str(candidate_id)))
    return applications
