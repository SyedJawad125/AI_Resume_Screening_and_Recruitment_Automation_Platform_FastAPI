"""
app/services/search_service.py
───────────────────────────────────
Semantic candidate search (RAG retrieval step):

    Recruiter query → embed → pgvector similarity search → top-k candidates
    with the resume evidence that explains why each one matched.

This is deliberately just the retrieval half of RAG (section 17). The
LLM-answer-generation half (grounded natural-language answer with
citations) is a thin layer on top of this — see app/api/v1/search.py.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.embeddings.service import embed_text
from app.models.candidate import Candidate
from app.models.embedding import CandidateEmbedding, EmbeddingKind


async def semantic_search_candidates(
    db: AsyncSession, company_id: str, query: str, top_k: int = 10
) -> list[dict]:
    query_vector = embed_text(query)

    # cosine_distance: 0 = identical, 2 = opposite. Convert to a 0-1 similarity
    # score for the response so it reads naturally to the recruiter.
    distance_expr = CandidateEmbedding.embedding.cosine_distance(query_vector)

    stmt = (
        select(Candidate, distance_expr.label("distance"), CandidateEmbedding.source_text)
        .join(CandidateEmbedding, CandidateEmbedding.candidate_id == Candidate.id)
        .where(
            Candidate.company_id == company_id,
            CandidateEmbedding.kind == EmbeddingKind.PROFILE,
        )
        .order_by(distance_expr)
        .limit(top_k)
    )

    rows = (await db.execute(stmt)).all()

    results = []
    for candidate, distance, source_text in rows:
        similarity = round(max(0.0, 1.0 - (distance / 2.0)), 4)
        results.append(
            {
                "candidate_id": str(candidate.id),
                "name": candidate.name,
                "email": candidate.email,
                "skills": candidate.skills,
                "experience_years": candidate.experience_years,
                "similarity": similarity,
                "matched_evidence": source_text[:400],
            }
        )
    return results
