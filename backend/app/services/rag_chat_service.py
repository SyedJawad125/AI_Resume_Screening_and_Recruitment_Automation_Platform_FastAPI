"""
app/services/rag_chat_service.py
─────────────────────────────────────
The generation half of RAG (the retrieval half is search_service.py's
`semantic_search_candidates`). Built as a proper LangChain
Runnable — `prompt | llm | StrOutputParser()` — so it supports both
`.ainvoke()` (for the non-streaming endpoint / LangGraph node) and
`.astream()` (for the SSE streaming endpoint) with the exact same chain.

Grounding discipline: the prompt hands the model ONLY the retrieved
candidates' summaries/skills/evidence, and instructs it to answer solely
from that context and cite candidates by name — this is what keeps the
"AI Search" answer from turning into an ungrounded guess.
"""

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from app.llm.langchain_client import get_chat_model
from app.services.search_service import semantic_search_candidates

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
    """Non-streaming path: retrieve, then invoke the chain once for a
    complete answer. Used by the LangGraph node and the plain POST endpoint."""
    candidates = await semantic_search_candidates(db, company_id, question, top_k)
    chain = build_rag_chain()
    answer = await chain.ainvoke({"context": format_candidates_context(candidates), "question": question})
    return {"answer": answer, "sources": candidates}


async def retrieve_then_stream(db, company_id: str, question: str, top_k: int = 10):
    """Streaming path for the SSE endpoint: retrieval still happens
    up-front (it's fast — a single pgvector query), then the chain's
    token stream is yielded as it's generated. Yields the candidate list
    first (as a labeled SSE event) so the frontend can render "searching
    N candidates..." before tokens start arriving, then yields text chunks."""
    candidates = await semantic_search_candidates(db, company_id, question, top_k)
    chain = build_rag_chain()

    yield {"event": "sources", "data": candidates}

    async for chunk in chain.astream({"context": format_candidates_context(candidates), "question": question}):
        yield {"event": "token", "data": chunk}

    yield {"event": "done", "data": None}
