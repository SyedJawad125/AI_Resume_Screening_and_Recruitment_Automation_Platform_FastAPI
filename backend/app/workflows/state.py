"""
app/workflows/state.py
──────────────────────────
Typed state passed between LangGraph nodes. Every node reads what it
needs from this dict and writes back only its own fields — this is what
makes the graph debuggable: at any point you can dump `state` and see
exactly what each agent has produced so far.
"""

from typing import TypedDict


class RecruitmentState(TypedDict, total=False):
    # Inputs
    candidate_id: str
    job_id: str

    # Populated by load_data_node
    candidate_profile: dict
    job_requirements: dict
    job_description: str
    resume_pages: list
    candidate_embedding: list
    job_embedding: list

    # Populated by matching_node
    skill_score: float
    experience_score: float
    semantic_score: float
    projects_score: float
    preferred_skills_score: float
    final_score: float
    matched_required_skills: list
    missing_required_skills: list
    matched_preferred_skills: list

    # Populated by evidence_node
    retrieved_evidence: list

    # Populated by evaluation_node (LLM — qualitative only, never touches the score)
    llm_strengths: list
    llm_summary: str

    # Populated by decision_node
    recommendation: str
    confidence: float
    explanation: dict

    # Error tracking — any node can set this; the graph short-circuits on it
    error: str | None
