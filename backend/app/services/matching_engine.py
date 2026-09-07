"""
app/services/matching_engine.py
────────────────────────────────────
The candidate score is NEVER "the LLM says 87%". It's a weighted sum of
five independently computed, inspectable sub-scores:

    Required Skills       35%   (default; configurable via .env)
    Experience             20%
    Semantic Similarity    20%
    Relevant Projects      15%
    Preferred Skills       10%

Every sub-score and the weights used are persisted on CandidateScore, so
the final number is reproducible: re-running this function on the same
inputs always yields the same score (no LLM call in this file at all).
"""

import numpy as np

from app.core.config import settings

WEIGHTS = {
    "required_skills": settings.SCORE_WEIGHT_REQUIRED_SKILLS,
    "experience": settings.SCORE_WEIGHT_EXPERIENCE,
    "semantic": settings.SCORE_WEIGHT_SEMANTIC,
    "projects": settings.SCORE_WEIGHT_PROJECTS,
    "preferred_skills": settings.SCORE_WEIGHT_PREFERRED_SKILLS,
}

assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-6, "Scoring weights in .env must sum to 1.0"

SHORTLIST_THRESHOLD = 75.0
REVIEW_THRESHOLD = 50.0


def _normalize(skill: str) -> str:
    return skill.strip().lower()


def score_required_skills(required_skills: list[str], candidate_skills: list[str], skill_weights: dict) -> tuple[float, list[str], list[str]]:
    if not required_skills:
        return 100.0, [], []

    candidate_set = {_normalize(s) for s in candidate_skills}
    matched, missing = [], []
    weighted_total = 0.0
    weighted_matched = 0.0

    for skill in required_skills:
        weight = skill_weights.get(skill, 1.0)
        weighted_total += weight
        if _normalize(skill) in candidate_set:
            matched.append(skill)
            weighted_matched += weight
        else:
            missing.append(skill)

    score = (weighted_matched / weighted_total * 100) if weighted_total > 0 else 0.0
    return round(score, 2), matched, missing


def score_preferred_skills(preferred_skills: list[str], candidate_skills: list[str]) -> tuple[float, list[str]]:
    if not preferred_skills:
        return 100.0, []

    candidate_set = {_normalize(s) for s in candidate_skills}
    matched = [s for s in preferred_skills if _normalize(s) in candidate_set]
    score = len(matched) / len(preferred_skills) * 100
    return round(score, 2), matched


def score_experience(candidate_years: int | None, minimum_years: int) -> float:
    if minimum_years <= 0:
        return 100.0
    if candidate_years is None:
        return 0.0
    return round(min(candidate_years / minimum_years, 1.0) * 100, 2)


def score_semantic_similarity(candidate_embedding: list[float], job_embedding: list[float]) -> float:
    """Cosine similarity, scaled to 0-100. Embeddings are already
    L2-normalized (see embeddings.service), so this is just a dot product."""
    a = np.array(candidate_embedding)
    b = np.array(job_embedding)
    similarity = float(np.dot(a, b))  # already normalized → equals cosine similarity
    similarity = max(0.0, min(1.0, similarity))  # clamp for safety
    return round(similarity * 100, 2)


def score_projects(required_skills: list[str], preferred_skills: list[str], projects: list[dict]) -> float:
    """Rewards candidates whose PROJECTS (not just a skills list) actually
    used the required/preferred technologies — a stronger signal than a
    bare skill mention."""
    all_target_skills = {_normalize(s) for s in (required_skills + preferred_skills)}
    if not all_target_skills or not projects:
        return 0.0 if projects == [] else 50.0  # neutral score if no target skills to check against

    project_techs: set[str] = set()
    for p in projects:
        for tech in p.get("technologies", []):
            project_techs.add(_normalize(tech))

    overlap = all_target_skills & project_techs
    score = len(overlap) / len(all_target_skills) * 100
    return round(score, 2)


def compute_final_score(
    required_skills: list[str],
    preferred_skills: list[str],
    skill_weights: dict,
    minimum_experience_years: int,
    candidate_skills: list[str],
    candidate_experience_years: int | None,
    candidate_projects: list[dict],
    candidate_embedding: list[float],
    job_embedding: list[float],
) -> dict:
    required_score, matched_required, missing_required = score_required_skills(
        required_skills, candidate_skills, skill_weights
    )
    preferred_score, matched_preferred = score_preferred_skills(preferred_skills, candidate_skills)
    experience_score = score_experience(candidate_experience_years, minimum_experience_years)
    semantic_score = score_semantic_similarity(candidate_embedding, job_embedding)
    projects_score = score_projects(required_skills, preferred_skills, candidate_projects)

    final_score = (
        required_score * WEIGHTS["required_skills"]
        + experience_score * WEIGHTS["experience"]
        + semantic_score * WEIGHTS["semantic"]
        + projects_score * WEIGHTS["projects"]
        + preferred_score * WEIGHTS["preferred_skills"]
    )
    final_score = round(final_score, 2)

    if final_score >= SHORTLIST_THRESHOLD:
        recommendation = "SHORTLIST"
    elif final_score >= REVIEW_THRESHOLD:
        recommendation = "REVIEW"
    else:
        recommendation = "REJECT"

    # Confidence: how much of the required-skill signal we actually had data
    # for. Not a made-up number — it reflects data completeness.
    confidence = round(1.0 - (len(missing_required) / len(required_skills)) if required_skills else 1.0, 2)
    confidence = max(0.0, min(1.0, confidence))

    return {
        "required_skills_score": required_score,
        "experience_score": experience_score,
        "semantic_score": semantic_score,
        "projects_score": projects_score,
        "preferred_skills_score": preferred_score,
        "final_score": final_score,
        "recommendation": recommendation,
        "confidence": confidence,
        "matched_required_skills": matched_required,
        "missing_required_skills": missing_required,
        "matched_preferred_skills": matched_preferred,
        "weights_used": WEIGHTS,
    }
