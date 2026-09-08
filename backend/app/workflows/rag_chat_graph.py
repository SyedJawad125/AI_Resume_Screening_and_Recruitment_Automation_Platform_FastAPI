"""
app/workflows/rag_chat_graph.py
────────────────────────────────────
A second, distinct LangGraph workflow (separate from the recruitment
scoring graph in graph.py): a 2-node retrieve → generate RAG pipeline.

Small on purpose — this is intentionally the simplest possible graph
that's still a *graph* rather than a plain function call, because the
value here is the explicit state boundary between "what was retrieved"
and "what was generated," which makes it trivial to later insert a
re-ranking node, a query-rewriting node, or a relevance-check node
between the two without touching call sites.
"""

from typing import TypedDict

from langgraph.graph import StateGraph, END

from app.services.rag_chat_service import build_rag_chain, format_candidates_context
from app.services.search_service import semantic_search_candidates


class RagChatState(TypedDict, total=False):
    company_id: str
    question: str
    top_k: int
    retrieved_candidates: list[dict]
    answer: str


def build_rag_chat_graph(db):
    async def retrieve_node(state: RagChatState) -> dict:
        candidates = await semantic_search_candidates(db, state["company_id"], state["question"], state.get("top_k", 10))
        return {"retrieved_candidates": candidates}

    async def generate_node(state: RagChatState) -> dict:
        chain = build_rag_chain()
        context = format_candidates_context(state["retrieved_candidates"])
        answer = await chain.ainvoke({"context": context, "question": state["question"]})
        return {"answer": answer}

    graph = StateGraph(RagChatState)
    graph.add_node("retrieve", retrieve_node)
    graph.add_node("generate", generate_node)
    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", END)

    return graph.compile()


async def run_rag_chat(db, company_id: str, question: str, top_k: int = 10) -> RagChatState:
    compiled = build_rag_chat_graph(db)
    return await compiled.ainvoke({"company_id": company_id, "question": question, "top_k": top_k})
