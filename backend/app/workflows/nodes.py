"""
app/workflows/nodes.py
──────────────────────────
Each node is a small, focused async function: (state, db) -> partial state
update. Keeping DB access explicit as a second argument (rather than a
closure) keeps the nodes easy to unit test — pass a fake db/session and
assert on the returned dict.

Node responsibilities map 1:1 to the architecture doc's agent list:
  load_data_node        → gathers everything downstream nodes need
  matching_node          → Matching Agent (pure scoring math)
  evidence_node           → Evidence Retrieval Agent
  evaluation_node         → Evaluation Agent (LLM, qualitative only)
  decision_node           → Decision Agent
  shortlist_node / review_reject_node → terminal branches (per the spec's
      branching diagram); functionally a routing/tagging step today, but
      this is where phase-12 auto-notifications would hook in later.
"""

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.embeddings.service import embed_text
from app.llm.client import llm_client
from app.models.candidate import Candidate
from app.models.embedding import CandidateEmbedding, EmbeddingKind
from app.models.job import Job
from app.models.resume import Resume
from app.services.evidence_service import build_evidence, evidence_to_dict
from app.services.matching_engine import compute_final_score, SHORTLIST_THRESHOLD, REVIEW_THRESHOLD
from app.workflows.state import RecruitmentState

EVALUATION_SYSTEM_PROMPT = """You are a technical recruiting evaluator. You are given a \
candidate's matched skills, missing skills, and grounded evidence excerpts from their resume. \
Write a short qualitative summary (2-3 sentences) of the candidate's fit. \
Do NOT invent skills, experience, or facts not present in the input. \
Do NOT assign or mention a numeric score — a separate deterministic system already computed that. \
Respond with ONLY this JSON object:
{"summary": string, "strengths": [string]}"""


async def load_data_node(state: RecruitmentState, db) -> dict:
    job = (
        await db.execute(select(Job).options(selectinload(Job.requirement)).where(Job.id == state["job_id"]))
    ).scalar_one_or_none()
    if not job or not job.requirement:
        return {"error": "Job or its analyzed requirements not found."}

    candidate = (
        await db.execute(select(Candidate).where(Candidate.id == state["candidate_id"]))
    ).scalar_one_or_none()
    if not candidate:
        return {"error": "Candidate not found."}

    embedding_row = (
        await db.execute(
            select(CandidateEmbedding).where(
                CandidateEmbedding.candidate_id == candidate.id,
                CandidateEmbedding.kind == EmbeddingKind.PROFILE,
            )
        )
    ).scalar_one_or_none()
    if not embedding_row:
        return {"error": "Candidate has no profile embedding — resume processing may have failed."}

    resume = (
        await db.execute(
            select(Resume).where(Resume.candidate_id == candidate.id).order_by(Resume.created_at.desc())
        )
    ).scalars().first()

    job_embedding = embed_text(job.description)

    return {
        "candidate_profile": {
            "skills": candidate.skills,
            "experience_years": candidate.experience_years,
            "projects": candidate.projects or [],
        },
        "job_requirements": {
            "required_skills": job.requirement.required_skills,
            "preferred_skills": job.requirement.preferred_skills,
            "minimum_experience_years": job.requirement.minimum_experience_years,
            "skill_weights": job.requirement.skill_weights or {},
        },
        "job_description": job.description,
        "resume_pages": resume.pages if resume else [],
        "candidate_embedding": embedding_row.embedding,
        "job_embedding": job_embedding,
    }


async def matching_node(state: RecruitmentState, db=None) -> dict:
    if state.get("error"):
        return {}

    req = state["job_requirements"]
    profile = state["candidate_profile"]

    result = compute_final_score(
        required_skills=req["required_skills"],
        preferred_skills=req["preferred_skills"],
        skill_weights=req["skill_weights"],
        minimum_experience_years=req["minimum_experience_years"],
        candidate_skills=profile["skills"],
        candidate_experience_years=profile["experience_years"],
        candidate_projects=profile["projects"],
        candidate_embedding=state["candidate_embedding"],
        job_embedding=state["job_embedding"],
    )

    return {
        "skill_score": result["required_skills_score"],
        "experience_score": result["experience_score"],
        "semantic_score": result["semantic_score"],
        "projects_score": result["projects_score"],
        "preferred_skills_score": result["preferred_skills_score"],
        "final_score": result["final_score"],
        "matched_required_skills": result["matched_required_skills"],
        "missing_required_skills": result["missing_required_skills"],
        "matched_preferred_skills": result["matched_preferred_skills"],
    }


async def evidence_node(state: RecruitmentState, db=None) -> dict:
    if state.get("error"):
        return {}

    req = state["job_requirements"]
    all_requirements = req["required_skills"] + req["preferred_skills"]
    evidence = build_evidence(all_requirements, state.get("resume_pages", []))
    return {"retrieved_evidence": evidence_to_dict(evidence)}


async def evaluation_node(state: RecruitmentState, db=None) -> dict:
    """LLM step — but scoped tightly: it only narrates the ALREADY-COMPUTED
    matched/missing skills and evidence. It never sees or influences the
    final_score, so it cannot invent a different number than the
    deterministic matching engine produced."""
    if state.get("error"):
        return {}

    user_prompt = (
        f"Matched required skills: {state['matched_required_skills']}\n"
        f"Missing required skills: {state['missing_required_skills']}\n"
        f"Matched preferred skills: {state['matched_preferred_skills']}\n"
        f"Evidence: {state['retrieved_evidence']}"
    )

    try:
        raw, _ = await llm_client.generate_json(EVALUATION_SYSTEM_PROMPT, user_prompt)
        return {"llm_summary": raw.get("summary", ""), "llm_strengths": raw.get("strengths", [])}
    except Exception:
        # Qualitative narration is a nice-to-have; never fail the whole
        # workflow because the LLM narration call hiccuped.
        return {"llm_summary": "", "llm_strengths": []}


async def decision_node(state: RecruitmentState, db=None) -> dict:
    if state.get("error"):
        return {"recommendation": "REVIEW", "confidence": 0.0, "explanation": {"error": state["error"]}}

    final_score = state["final_score"]
    if final_score >= SHORTLIST_THRESHOLD:
        recommendation = "SHORTLIST"
    elif final_score >= REVIEW_THRESHOLD:
        recommendation = "REVIEW"
    else:
        recommendation = "REJECT"

    required = state["job_requirements"]["required_skills"]
    confidence = round(
        1.0 - (len(state["missing_required_skills"]) / len(required)) if required else 1.0, 2
    )

    explanation = {
        "final_score": final_score,
        "breakdown": {
            "required_skills_score": state["skill_score"],
            "experience_score": state["experience_score"],
            "semantic_score": state["semantic_score"],
            "projects_score": state["projects_score"],
            "preferred_skills_score": state["preferred_skills_score"],
        },
        "matched_required_skills": state["matched_required_skills"],
        "missing_required_skills": state["missing_required_skills"],
        "evidence": state["retrieved_evidence"],
        "llm_summary": state.get("llm_summary", ""),
        "llm_strengths": state.get("llm_strengths", []),
    }

    return {"recommendation": recommendation, "confidence": max(0.0, min(1.0, confidence)), "explanation": explanation}


async def shortlist_node(state: RecruitmentState, db=None) -> dict:
    return {}  # terminal branch — hook for future auto-notify/auto-advance logic


async def review_reject_node(state: RecruitmentState, db=None) -> dict:
    return {}  # terminal branch — hook for future auto-notify logic


def route_after_decision(state: RecruitmentState) -> str:
    if state.get("error"):
        return "review_reject"
    return "shortlist" if state.get("recommendation") == "SHORTLIST" else "review_reject"
