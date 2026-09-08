"""
tests/test_agentic_rag.py
────────────────────────────
Verifies the agentic RAG graph's decision logic — does it accept a good
retrieval, and does it loop through rewrite→retrieve when the grade is
poor? Both `semantic_search_candidates` and `generate_structured` (the
grading/rewriting LLM calls) are mocked, so this tests the graph's
routing logic itself, not the LLM's judgment.
"""

from unittest.mock import AsyncMock, patch

import pytest

from app.schemas.workflow import RelevanceGrade, RewrittenQuery
from app.workflows.rag_chat_graph import run_agentic_retrieval


GOOD_CANDIDATES = [{"name": "Jane", "skills": ["Python"], "similarity": 0.9, "experience_years": 5, "matched_evidence": "..."}]


@pytest.mark.asyncio
async def test_accepts_immediately_when_grade_is_good():
    """First retrieval graded relevant → no rewrite loop, iteration stays 0."""
    with (
        patch("app.workflows.rag_chat_graph.semantic_search_candidates", new=AsyncMock(return_value=GOOD_CANDIDATES)),
        patch(
            "app.workflows.rag_chat_graph.generate_structured",
            new=AsyncMock(return_value=RelevanceGrade(relevant=True, score=0.9, reasoning="Good match.")),
        ),
    ):
        result = await run_agentic_retrieval(db=None, company_id="co1", question="Python devs?")

    assert result["iteration"] == 0
    assert result["low_confidence"] is False
    assert result["retrieved_candidates"] == GOOD_CANDIDATES


@pytest.mark.asyncio
async def test_rewrites_and_retries_when_grade_is_poor():
    """First grade is poor → rewrite_query runs → retrieve runs again →
    second grade is good → accept. Total: 1 rewrite iteration."""
    grade_calls = {"count": 0}

    async def fake_generate_structured(system_prompt, user_prompt, output_model):
        if output_model is RewrittenQuery:
            return RewrittenQuery(rewritten_query="better query", reasoning="more specific")
        # RelevanceGrade calls: first poor, second good
        grade_calls["count"] += 1
        if grade_calls["count"] == 1:
            return RelevanceGrade(relevant=False, score=0.2, reasoning="Not relevant.")
        return RelevanceGrade(relevant=True, score=0.85, reasoning="Much better now.")

    with (
        patch("app.workflows.rag_chat_graph.semantic_search_candidates", new=AsyncMock(return_value=GOOD_CANDIDATES)),
        patch("app.workflows.rag_chat_graph.generate_structured", side_effect=fake_generate_structured),
    ):
        result = await run_agentic_retrieval(db=None, company_id="co1", question="vague query")

    assert result["iteration"] == 1
    assert result["current_query"] == "better query"
    assert result["low_confidence"] is False
    assert grade_calls["count"] == 2


@pytest.mark.asyncio
async def test_gives_up_after_max_iterations_and_flags_low_confidence():
    """Grade is ALWAYS poor → graph must stop at MAX_AGENT_ITERATIONS
    rather than looping forever, and must flag low_confidence=True."""
    with (
        patch("app.workflows.rag_chat_graph.semantic_search_candidates", new=AsyncMock(return_value=[])),
        patch(
            "app.workflows.rag_chat_graph.generate_structured",
            new=AsyncMock(
                side_effect=lambda system_prompt, user_prompt, output_model: (
                    RelevanceGrade(relevant=False, score=0.1, reasoning="Still bad.")
                    if output_model is RelevanceGrade
                    else RewrittenQuery(rewritten_query="another attempt")
                )
            ),
        ),
        patch("app.workflows.rag_chat_graph.settings") as mock_settings,
    ):
        mock_settings.USE_AGENT_MODE = True
        mock_settings.ENABLE_QUERY_REWRITE = True
        mock_settings.MAX_AGENT_ITERATIONS = 3
        mock_settings.GRADING_THRESHOLD = 0.6
        mock_settings.AGENT_TIMEOUT = 30

        result = await run_agentic_retrieval(db=None, company_id="co1", question="impossible query")

    assert result["low_confidence"] is True
    assert result["iteration"] == mock_settings.MAX_AGENT_ITERATIONS - 1


@pytest.mark.asyncio
async def test_agent_mode_off_skips_grading_entirely():
    """USE_AGENT_MODE=False → single retrieval, no LLM grading call at all."""
    with (
        patch("app.workflows.rag_chat_graph.semantic_search_candidates", new=AsyncMock(return_value=GOOD_CANDIDATES)),
        patch("app.workflows.rag_chat_graph.generate_structured", new=AsyncMock()) as mock_generate,
        patch("app.workflows.rag_chat_graph.settings") as mock_settings,
    ):
        mock_settings.USE_AGENT_MODE = False

        result = await run_agentic_retrieval(db=None, company_id="co1", question="any query")

    mock_generate.assert_not_called()
    assert result["retrieved_candidates"] == GOOD_CANDIDATES
    assert result["low_confidence"] is False
