"""
app/workflows/rag_chat_graph.py
────────────────────────────────────
Self-correcting agentic RAG retrieval graph (CRAG-style: Corrective RAG).

    START
      │
      ▼
   retrieve ──────────────────────┐
      │                           │
      ▼                           │
    grade                         │
      │                           │
   ┌──┴──────────────┐            │
   │ relevant enough │ not relevant, iterations remain,
   │ OR out of tries │ ENABLE_QUERY_REWRITE=True
   ▼                 ▼            │
  END            rewrite_query ───┘
                 (loops back to retrieve)

This graph owns ONLY retrieval quality — deciding whether what came back
from pgvector is good enough to answer from, and if not, reformulating
the query and trying again (bounded by MAX_AGENT_ITERATIONS so a
persistently bad query can't loop forever, and by AGENT_TIMEOUT as a
wall-clock backstop). Generation (turning good context into a
recruiter-facing answer) happens OUTSIDE this graph, in
rag_chat_service.py, because generation wants to support streaming
(`.astream()`) and a LangGraph node's output isn't naturally streamable
token-by-token to an HTTP response the same way a raw chain is.
"""

import asyncio
from typing import TypedDict

from langgraph.graph import StateGraph, END

from app.core.config import settings
from app.core.exceptions import AppException
from app.llm.langchain_client import generate_structured
from app.schemas.workflow import RelevanceGrade, RewrittenQuery
from app.services.search_service import semantic_search_candidates


class AgentTimeoutError(AppException):
    default_message = "The search agent took too long to respond. Try a simpler query."


class AgenticRagState(TypedDict, total=False):
    company_id: str
    top_k: int

    original_question: str
    current_query: str
    iteration: int

    retrieved_candidates: list[dict]
    grade_relevant: bool
    grade_score: float
    grade_reasoning: str
    low_confidence: bool


GRADE_SYSTEM_PROMPT = """You are a retrieval quality grader for a recruiting search system. \
Given a recruiter's question and a list of retrieved candidate profiles, judge whether the \
candidates actually address the question — not whether they're perfect, just whether they're \
genuinely on-topic and useful. A handful of loosely related candidates with the right general \
skill area counts as relevant; completely unrelated candidates do not."""

REWRITE_SYSTEM_PROMPT = """You are a search query optimizer for a semantic (embedding-based) \
candidate search system. The previous query did not retrieve sufficiently relevant candidates. \
Rewrite it to be more specific and retrieval-friendly — e.g. expand vague terms into concrete \
skills/technologies, remove filler words, keep it a short natural-language phrase (not a boolean \
query, this is embedding search, not keyword search)."""


def build_agentic_rag_graph(db):
    async def retrieve_node(state: AgenticRagState) -> dict:
        candidates = await semantic_search_candidates(
            db, state["company_id"], state["current_query"], state.get("top_k", 10)
        )
        return {"retrieved_candidates": candidates}

    async def grade_node(state: AgenticRagState) -> dict:
        candidates_summary = "\n".join(
            f"- {c['name'] or 'Unnamed'}: skills={c['skills']}, similarity={c['similarity']}"
            for c in state["retrieved_candidates"]
        ) or "No candidates were retrieved."

        user_prompt = f"Recruiter's question: {state['original_question']}\n\nRetrieved candidates:\n{candidates_summary}"

        grade = await generate_structured(GRADE_SYSTEM_PROMPT, user_prompt, RelevanceGrade)
        return {
            "grade_relevant": grade.relevant,
            "grade_score": grade.score,
            "grade_reasoning": grade.reasoning,
        }

    async def rewrite_query_node(state: AgenticRagState) -> dict:
        user_prompt = (
            f"Original question: {state['original_question']}\n"
            f"Current query: {state['current_query']}\n"
            f"Why it didn't retrieve well: {state.get('grade_reasoning', 'low relevance score')}"
        )
        rewritten = await generate_structured(REWRITE_SYSTEM_PROMPT, user_prompt, RewrittenQuery)
        return {"current_query": rewritten.rewritten_query, "iteration": state.get("iteration", 0) + 1}

    def route_after_grade(state: AgenticRagState) -> str:
        is_good_enough = state.get("grade_relevant") and state.get("grade_score", 0.0) >= settings.GRADING_THRESHOLD
        can_retry = (
            settings.ENABLE_QUERY_REWRITE
            and state.get("iteration", 0) < settings.MAX_AGENT_ITERATIONS - 1
        )
        if is_good_enough or not can_retry:
            return "accept"
        return "rewrite"

    graph = StateGraph(AgenticRagState)
    graph.add_node("retrieve", retrieve_node)
    graph.add_node("grade", grade_node)
    graph.add_node("rewrite_query", rewrite_query_node)

    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "grade")
    graph.add_conditional_edges("grade", route_after_grade, {"accept": END, "rewrite": "rewrite_query"})
    graph.add_edge("rewrite_query", "retrieve")

    return graph.compile()


async def run_agentic_retrieval(db, company_id: str, question: str, top_k: int = 10) -> AgenticRagState:
    """Runs the retrieve -> grade -> rewrite loop (if USE_AGENT_MODE is on)
    and returns the final state: the best retrieved_candidates found,
    whether they were graded relevant, and how many rewrite iterations it
    took. Bounded by AGENT_TIMEOUT as a wall-clock safety net on top of
    the iteration cap already enforced inside the graph."""

    if not settings.USE_AGENT_MODE:
        # Agent mode off: single retrieval pass, no grading/rewriting —
        # cheapest possible path, useful for cost-sensitive deployments.
        candidates = await semantic_search_candidates(db, company_id, question, top_k)
        return {
            "original_question": question,
            "current_query": question,
            "retrieved_candidates": candidates,
            "grade_relevant": True,
            "grade_score": 1.0,
            "grade_reasoning": "Agent mode disabled — grading skipped.",
            "iteration": 0,
            "low_confidence": False,
        }

    compiled = build_agentic_rag_graph(db)
    initial_state: AgenticRagState = {
        "company_id": company_id,
        "top_k": top_k,
        "original_question": question,
        "current_query": question,
        "iteration": 0,
    }

    try:
        final_state = await asyncio.wait_for(compiled.ainvoke(initial_state), timeout=settings.AGENT_TIMEOUT)
    except asyncio.TimeoutError:
        raise AgentTimeoutError()

    final_state["low_confidence"] = not (
        final_state.get("grade_relevant") and final_state.get("grade_score", 0.0) >= settings.GRADING_THRESHOLD
    )
    return final_state
