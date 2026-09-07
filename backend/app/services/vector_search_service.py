# """
# app/services/vector_search_service.py
# ───────────────────────────────────────
# pgvector similarity search service.

# Flow:
#   1. Embed user query → 384-dim vector
#   2. Run pgvector cosine similarity search
#   3. Filter by document_id
#   4. Return top-K chunks with scores

# Why pgvector over FAISS/Pinecone?
#   - No separate infrastructure — lives in PostgreSQL
#   - ACID transactions — vectors stay consistent with metadata
#   - SQL joins — can filter by user_id, company_id, date, etc.
#   - Simpler architecture for medium scale (< 10M vectors)
#   - HNSW index gives sub-millisecond search at millions of vectors
# """

# import logging
# from dataclasses import dataclass
# from typing import Optional

# from sqlalchemy.ext.asyncio import AsyncSession

# from app.services.embedding_service import embedding_service
# from app.core.config import settings

# logger = logging.getLogger(__name__)


# @dataclass
# class SearchResult:
#     chunk_id:    str
#     content:     str
#     page_number: Optional[int]
#     chunk_index: int
#     document_id: str
#     similarity:  float


# class VectorSearchService:

#     async def search(
#         self,
#         query:       str,
#         document_id: str,
#         db:          AsyncSession,
#         top_k:       int = None,
#         min_similarity: float = None,
#     ) -> list[SearchResult]:
#         """
#         Semantic search within a document.

#         Steps:
#           1. Embed the query
#           2. Run cosine similarity search with pgvector
#           3. Filter by relevance threshold
#           4. Return ranked results
#         """
#         top_k           = top_k or settings.TOP_K
#         min_similarity  = min_similarity or settings.RELEVANCE_THRESHOLD

#         logger.info(f'[Search] Query: "{query[:50]}..." | doc={document_id} | top_k={top_k}')

#         # Embed the query
#         query_embedding = embedding_service.embed_text(query)

#         # pgvector search
#         from sqlalchemy import text
#         sql = text("""
#             SELECT
#                 id::text                                             AS chunk_id,
#                 content,
#                 page_number,
#                 chunk_index,
#                 document_id::text,
#                 1 - (embedding <=> CAST(:embedding AS vector))      AS similarity
#             FROM document_chunks
#             WHERE document_id = :document_id
#               AND embedding IS NOT NULL
#             ORDER BY embedding <=> CAST(:embedding AS vector)
#             LIMIT :top_k
#         """)

#         result = await db.execute(sql, {
#             'embedding':   str(query_embedding),
#             'document_id': document_id,
#             'top_k':       top_k * 2,     # fetch extra, then filter by threshold
#         })

#         rows    = result.fetchall()
#         results = []

#         for row in rows:
#             if row.similarity < min_similarity:
#                 continue
#             results.append(SearchResult(
#                 chunk_id    = row.chunk_id,
#                 content     = row.content,
#                 page_number = row.page_number,
#                 chunk_index = row.chunk_index,
#                 document_id = row.document_id,
#                 similarity  = round(float(row.similarity), 4),
#             ))
#             if len(results) >= top_k:
#                 break

#         logger.info(f'[Search] Found {len(results)} results above threshold {min_similarity}')
#         return results

#     def build_context(self, results: list[SearchResult], max_chars: int = 6000) -> str:
#         """
#         Build LLM context string from search results.
#         Includes page citations inline so the LLM can reference them.

#         max_chars: prevents exceeding LLM context window
#         """
#         parts      = []
#         total_len  = 0

#         for r in results:
#             page_ref = f'[Page {r.page_number}]' if r.page_number else ''
#             section  = f'{page_ref}\n{r.content}\n'

#             if total_len + len(section) > max_chars:
#                 break

#             parts.append(section)
#             total_len += len(section)

#         return '\n---\n'.join(parts)


# vector_search_service = VectorSearchService()




"""
app/services/vector_search_service.py
───────────────────────────────────────
Fixed: embedding call wrapped in asyncio.to_thread()
to prevent blocking FastAPI event loop.
"""
import asyncio
import logging
from dataclasses import dataclass
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from app.services.embedding_service import embedding_service
from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class SearchResult:
    chunk_id:    str
    content:     str
    page_number: Optional[int]
    chunk_index: int
    document_id: str
    similarity:  float


class VectorSearchService:

    async def search(
        self,
        query:          str,
        document_id:    str,
        db:             AsyncSession,
        top_k:          int   = None,
        min_similarity: float = None,
    ) -> list[SearchResult]:

        top_k          = top_k or settings.TOP_K
        min_similarity = min_similarity or settings.RELEVANCE_THRESHOLD

        # ✅ Run sync embedding in thread pool — never blocks event loop
        query_embedding = await asyncio.to_thread(
            embedding_service.embed_text, query
        )

        from sqlalchemy import text
        sql = text("""
            SELECT
                id::text                                              AS chunk_id,
                content,
                page_number,
                chunk_index,
                document_id::text,
                1 - (embedding <=> CAST(:embedding AS vector))       AS similarity
            FROM document_chunks
            WHERE document_id = :document_id
              AND embedding IS NOT NULL
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT :top_k
        """)

        result = await db.execute(sql, {
            'embedding':   str(query_embedding),
            'document_id': document_id,
            'top_k':       top_k * 2,
        })

        rows    = result.fetchall()
        results = []
        for row in rows:
            sim = float(row.similarity)
            if sim < min_similarity:
                continue
            results.append(SearchResult(
                chunk_id    = row.chunk_id,
                content     = row.content,
                page_number = row.page_number,
                chunk_index = row.chunk_index,
                document_id = row.document_id,
                similarity  = round(sim, 4),
            ))
            if len(results) >= top_k:
                break

        logger.info(f'[Search] "{query[:50]}" → {len(results)} results')
        return results

    def build_context(self, results: list[SearchResult], max_chars: int = 6000) -> str:
        parts     = []
        total_len = 0
        for r in results:
            pg      = f'[Page {r.page_number}]' if r.page_number else ''
            section = f'{pg}\n{r.content}\n'
            if total_len + len(section) > max_chars:
                break
            parts.append(section)
            total_len += len(section)
        return '\n---\n'.join(parts)


vector_search_service = VectorSearchService()