"""
app/services/rag_chat_service.py
─────────────────────────────────────
The generation half of RAG. Retrieval quality is now owned by the
agentic graph in rag_chat_graph.py (retrieve -> grade -> rewrite -> retry);
this module takes whatever candidates that graph settled on and turns
them into a recruiter-facing answer — via `.ainvoke()` for a complete
response or `.astream()` for token-by-token SSE.
"""

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from app.llm.langchain_client import get_chat_model
from app.workflows.rag_chat_graph import run_agentic_retrieval

RAG_SYSTEM_PROMPT = """You are a recruiting assistant answering a recruiter's question about \
candidates in their pipeline. You are given a set of retrieved candidate profiles (name, \
skills, experience, and a matched resume excerpt). Answer the recruiter's question using ONLY \
the information in these candidate profiles.

Rules:
- Cite candidates by name when you reference them.
- If none of the retrieved candidates are actually relevant to the question, say so plainly —
  do not stretch a weak match into a confident answer.
- Never invent a skill, project, or experience detail not present in the given profiles.
- Keep the answer concise: a few sentences, not an essay."""


def format_candidates_context(candidates: list[dict]) -> str:
    if not candidates:
        return "No candidates were retrieved for this query."

    blocks = []
    for c in candidates:
        blocks.append(
            f"- {c['name'] or 'Unnamed candidate'} (similarity: {c['similarity']})\n"
            f"  Skills: {', '.join(c['skills'])}\n"
            f"  Experience: {c['experience_years']} years\n"
            f"  Matched excerpt: {c['matched_evidence']}"
        )
    return "\n".join(blocks)


def build_rag_chain():
    """prompt | llm | StrOutputParser — a plain LangChain Runnable. No
    structured output here (unlike the extraction agents): this is a
    natural-language answer for a human recruiter to read, not data that
    gets persisted, so free text is the right output type."""
    llm = get_chat_model()
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", RAG_SYSTEM_PROMPT),
            ("human", "Retrieved candidates:\n{context}\n\nRecruiter's question: {question}"),
        ]
    )
    return prompt | llm | StrOutputParser()


async def retrieve_and_answer(db, company_id: str, question: str, top_k: int = 10) -> dict:
    """Non-streaming path: run the agentic retrieval loop, then invoke the
    generation chain once for a complete answer. Used by the plain POST
    endpoint. Returns retrieval metadata (iterations used, confidence) so
    the recruiter can see when the agent had to work harder to find a match."""
    retrieval = await run_agentic_retrieval(db, company_id, question, top_k)

    chain = build_rag_chain()
    answer = await chain.ainvoke(
        {"context": format_candidates_context(retrieval["retrieved_candidates"]), "question": question}
    )

    return {
        "answer": answer,
        "sources": retrieval["retrieved_candidates"],
        "retrieval_meta": {
            "final_query": retrieval["current_query"],
            "iterations_used": retrieval["iteration"],
            "low_confidence": retrieval["low_confidence"],
            "grade_score": retrieval.get("grade_score"),
        },
    }


async def retrieve_then_stream(db, company_id: str, question: str, top_k: int = 10):
    """Streaming path for the SSE endpoint: the agentic retrieve/grade/
    rewrite loop still runs up-front (it's the part that needs multiple
    LLM round-trips and isn't naturally streamable), then the generation
    chain's token stream is yielded as it's produced. Event order:
    'retrieval_meta' (once) -> 'sources' (once) -> 'token' (repeated) -> 'done'."""
    retrieval = await run_agentic_retrieval(db, company_id, question, top_k)
    chain = build_rag_chain()

    yield {
        "event": "retrieval_meta",
        "data": {
            "iterations_used": retrieval["iteration"],
            "low_confidence": retrieval["low_confidence"],
            "grade_score": retrieval.get("grade_score"),
        },
    }
    yield {"event": "sources", "data": retrieval["retrieved_candidates"]}

    async for chunk in chain.astream(
        {"context": format_candidates_context(retrieval["retrieved_candidates"]), "question": question}
    ):
        yield {"event": "token", "data": chunk}

    yield {"event": "done", "data": None}
