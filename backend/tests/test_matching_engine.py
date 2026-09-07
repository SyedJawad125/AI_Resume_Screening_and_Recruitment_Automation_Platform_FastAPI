"""
tests/test_matching_engine.py
────────────────────────────────
The matching engine is pure Python (no DB, no LLM), so it's fully
deterministic and testable without mocks. This is the kind of test the
architecture doc asks for: precision on skill matching, reproducibility
of the final score.
"""

from app.services.matching_engine import (
    score_required_skills,
    score_experience,
    score_preferred_skills,
    compute_final_score,
)


def test_required_skills_full_match():
    score, matched, missing = score_required_skills(
        ["Python", "FastAPI"], ["python", "fastapi", "docker"], {}
    )
    assert score == 100.0
    assert missing == []


def test_required_skills_partial_match_is_weighted():
    score, matched, missing = score_required_skills(
        ["Python", "Docker"], ["Python"], {"Python": 1.0, "Docker": 1.0}
    )
    assert score == 50.0
    assert missing == ["Docker"]


def test_experience_score_caps_at_100():
    assert score_experience(candidate_years=10, minimum_years=2) == 100.0


def test_experience_score_scales_linearly_below_minimum():
    assert score_experience(candidate_years=1, minimum_years=2) == 50.0


def test_experience_score_zero_when_missing_and_required():
    assert score_experience(candidate_years=None, minimum_years=3) == 0.0


def test_no_preferred_skills_scores_full():
    score, matched = score_preferred_skills([], ["Python"])
    assert score == 100.0


def test_final_score_is_reproducible():
    kwargs = dict(
        required_skills=["Python", "FastAPI"],
        preferred_skills=["AWS"],
        skill_weights={"Python": 1.0, "FastAPI": 1.0},
        minimum_experience_years=2,
        candidate_skills=["Python", "FastAPI"],
        candidate_experience_years=3,
        candidate_projects=[],
        candidate_embedding=[1.0, 0.0],
        job_embedding=[1.0, 0.0],
    )
    result_a = compute_final_score(**kwargs)
    result_b = compute_final_score(**kwargs)
    assert result_a == result_b  # same inputs → same output, always


def test_missing_all_required_skills_recommends_reject():
    result = compute_final_score(
        required_skills=["Python", "FastAPI", "Docker"],
        preferred_skills=[],
        skill_weights={},
        minimum_experience_years=5,
        candidate_skills=["PHP"],
        candidate_experience_years=0,
        candidate_projects=[],
        candidate_embedding=[0.0, 1.0],
        job_embedding=[1.0, 0.0],
    )
    assert result["recommendation"] == "REJECT"
