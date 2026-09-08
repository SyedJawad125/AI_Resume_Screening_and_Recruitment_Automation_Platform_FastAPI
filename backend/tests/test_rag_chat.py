"""
tests/test_rag_chat.py
────────────────────────────
Verifies the RAG chat streaming generator produces the right event
sequence (sources → token* → done) without a live LLM or database —
`semantic_search_candidates` and the LangChain chain are both mocked.
"""

from unittest.mock import AsyncMock, patch

import pytest

from app.services.rag_chat_service import retrieve_then_stream, format_candidates_context


FAKE_CANDIDATES = [
    {
        "candidate_id": "abc-123",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "skills": ["Python", "FastAPI"],
        "experience_years": 5,
        "similarity": 0.87,
        "matched_evidence": "Built a FastAPI-based RAG system.",
    }
]


class _FakeChain:
    """Stands in for `prompt | llm | StrOutputParser()` — astream yields
    string chunks the way a real LangChain chain would."""

    async def astream(self, inputs):
        for chunk in ["Jane ", "Doe ", "looks like a strong match."]:
            yield chunk


def test_format_candidates_context_handles_empty_list():
    assert "No candidates" in format_candidates_context([])


def test_format_candidates_context_includes_key_fields():
    context = format_candidates_context(FAKE_CANDIDATES)
    assert "Jane Doe" in context
    assert "FastAPI" in context
    assert "0.87" in context


@pytest.mark.asyncio
async def test_retrieve_then_stream_event_sequence():
    with (
        patch(
            "app.services.rag_chat_service.semantic_search_candidates",
            new=AsyncMock(return_value=FAKE_CANDIDATES),
        ),
        patch(
            "app.services.rag_chat_service.build_rag_chain",
            return_value=_FakeChain(),
        ),
    ):
        events = [e async for e in retrieve_then_stream(db=None, company_id="fake-co", question="Who knows FastAPI?")]

    assert events[0]["event"] == "sources"
    assert events[0]["data"] == FAKE_CANDIDATES

    token_events = [e for e in events if e["event"] == "token"]
    assert len(token_events) == 3
    assert "".join(e["data"] for e in token_events) == "Jane Doe looks like a strong match."

    assert events[-1]["event"] == "done"
