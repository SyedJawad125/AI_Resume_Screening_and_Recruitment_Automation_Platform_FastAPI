"""
tests/test_evaluation.py
────────────────────────────
Verifies the evaluation metrics pipeline works correctly WITHOUT calling
a real LLM — per the architecture doc's testing rule: "Use mocked LLM
responses in normal CI tests. Do not require a paid LLM API for every
test." `generate_structured` (the LangChain call site every agent uses)
is patched to return a canned, already-validated Pydantic object;
everything downstream (metric computation) runs for real.
"""

from unittest.mock import AsyncMock, patch

import pytest

from app.agents.resume_parser_agent import parse_resume
from app.agents.job_analysis_agent import analyze_job_description
from app.schemas.candidate import ResumeParseResult
from app.schemas.job import JobAnalysisResult
from app.evaluation.metrics import compute_extraction_metrics, experience_extraction_accuracy


MOCK_RESUME_RESULT = ResumeParseResult(
    name="Jane Doe",
    email="jane@example.com",
    summary="Backend engineer.",
    experience_years=5,
    skills=["Python", "FastAPI", "PostgreSQL"],
)

MOCK_JOB_RESULT = JobAnalysisResult(
    job_title="Senior Python AI Engineer",
    required_skills=["Python", "FastAPI", "PostgreSQL"],
    preferred_skills=["AWS"],
    minimum_experience_years=2,
    skill_weights={"Python": 1.0},
)


@pytest.mark.asyncio
async def test_resume_parser_agent_with_mocked_llm():
    with patch(
        "app.agents.resume_parser_agent.generate_structured",
        new=AsyncMock(return_value=MOCK_RESUME_RESULT),
    ):
        result = await parse_resume("irrelevant resume text — LLM call is mocked")

    assert result.name == "Jane Doe"
    assert "Python" in result.skills

    metrics = compute_extraction_metrics(
        expected=["Python", "FastAPI", "PostgreSQL", "Docker"],
        predicted=result.skills,
    )
    # 3 of 4 expected skills found, 0 false positives → precision 1.0, recall 0.75
    assert metrics.precision == 1.0
    assert metrics.recall == 0.75


@pytest.mark.asyncio
async def test_job_analysis_agent_with_mocked_llm():
    with patch(
        "app.agents.job_analysis_agent.generate_structured",
        new=AsyncMock(return_value=MOCK_JOB_RESULT),
    ):
        result = await analyze_job_description("Senior Python AI Engineer", "irrelevant — mocked")

    assert result.minimum_experience_years == 2
    assert "FastAPI" in result.required_skills


def test_experience_accuracy_tolerance():
    pairs = [(5, 5), (5, 6), (5, 8), (None, 3)]
    # (5,5) within tolerance, (5,6) within tolerance(1), (5,8) NOT within, (None,3) skipped
    accuracy = experience_extraction_accuracy(pairs, tolerance_years=1)
    assert accuracy == 0.5  # 2 correct out of 4 total pairs
