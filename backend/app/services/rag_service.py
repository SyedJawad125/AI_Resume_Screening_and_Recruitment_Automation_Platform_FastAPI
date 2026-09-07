"""
app/services/rag_service.py
────────────────────────────
UPDATED: Uses LangGraph CRAG agent when USE_AGENT_MODE=True.
Falls back to simple RAG chain for lightweight requests.

Before: simple retrieve → generate
After:  LangGraph CRAG (retrieve → grade → [rewrite] → generate)
"""

import logging
from dataclasses import dataclass
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.vector_search_service import vector_search_service
from app.services.llm_service import llm_service
from app.repositories.document_repository import DocumentRepository
from app.core.exceptions import NotFoundError, ValidationError
from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class Citation:
    chunk_id:    str
    document_id: str
    filename:    str
    page_number: Optional[int]


@dataclass
class RAGResponse:
    question:        str
    answer:          str
    citations:       list[Citation]
    model:           str
    chunks_used:     int
    iterations:      int = 1
    query_rewritten: bool = False
    mode:            str = 'simple'   # 'simple' | 'crag'


class RAGService:

    async def answer(
        self,
        question:    str,
        document_id: str,
        db:          AsyncSession,
        top_k:       int = 5,
        use_agent:   bool = None,    # None = use settings default
    ) -> RAGResponse:
        """
        Answer a question about a document.

        If use_agent=True (or USE_AGENT_MODE=True in settings):
          → LangGraph CRAG agent (grade + rewrite + re-retrieve)
        Else:
          → Simple RAG chain (fast, fewer LLM calls)
        """
        # Load and validate document
        doc_repo = DocumentRepository(db)
        document = await doc_repo.get_by_id(document_id)
        if not document:
            raise NotFoundError('Document')
        if not document.is_ready:
            raise ValidationError(f'Document not ready. Status: {document.status}')

        use_agent_mode = use_agent if use_agent is not None else settings.USE_AGENT_MODE

        if use_agent_mode:
            return await self._agent_answer(question, document, db, top_k)
        else:
            return await self._simple_answer(question, document, db, top_k)

    # ── Agent Mode (LangGraph CRAG) ────────────────────────────────

    async def _agent_answer(self, question, document, db, top_k) -> RAGResponse:
        """Run LangGraph CRAG agent."""
        from app.agents.rag_agent import rag_agent

        result = await rag_agent.run(
            question    = question,
            document_id = str(document.id),
            filename    = document.original_filename,
            db          = db,
            top_k       = top_k,
        )

        citations = [
            Citation(
                chunk_id    = c['chunk_id'],
                document_id = c['document_id'],
                filename    = document.original_filename,
                page_number = c.get('page_number'),
            )
            for c in result['citations']
        ]

        return RAGResponse(
            question        = question,
            answer          = result['answer'],
            citations       = citations,
            model           = settings.GROQ_MODEL,
            chunks_used     = result['chunks_used'],
            iterations      = result['iterations'],
            query_rewritten = result['query_rewritten'],
            mode            = 'crag',
        )

    # ── Simple Mode (direct RAG chain) ─────────────────────────────

    async def _simple_answer(self, question, document, db, top_k) -> RAGResponse:
        """Simple retrieve → generate without grading."""
        results = await vector_search_service.search(
            query       = question,
            document_id = str(document.id),
            db          = db,
            top_k       = top_k,
        )

        if not results:
            return RAGResponse(
                question    = question,
                answer      = 'I could not find this information in the provided document.',
                citations   = [],
                model       = settings.GROQ_MODEL,
                chunks_used = 0,
                mode        = 'simple',
            )

        context = vector_search_service.build_context(results)
        answer  = await llm_service.answer_from_context(
            question = question,
            context  = context,
            filename = document.original_filename,
        )

        citations = [
            Citation(
                chunk_id    = r.chunk_id,
                document_id = r.document_id,
                filename    = document.original_filename,
                page_number = r.page_number,
            )
            for r in results
        ]

        return RAGResponse(
            question    = question,
            answer      = answer,
            citations   = citations,
            model       = settings.GROQ_MODEL,
            chunks_used = len(results),
            mode        = 'simple',
        )


rag_service = RAGService()