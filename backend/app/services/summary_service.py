"""
app/services/summary_service.py
─────────────────────────────────
Hierarchical document summarization.

Why hierarchical?
  - Large documents exceed LLM context windows
  - Solution: summarize chunks → combine summaries → final summary
  - Same technique used by production document AI systems

Pipeline:
  All chunks
    ↓ batch into groups of 5
  Chunk group summaries (parallel)
    ↓ combine
  Combined summary text
    ↓ single LLM call
  Final structured summary
"""

import logging
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.document_repository import DocumentRepository
from app.services.llm_service import llm_service
from app.core.exceptions import NotFoundError, ValidationError

logger = logging.getLogger(__name__)

CHUNKS_PER_BATCH = 5      # summarize 5 chunks at a time
MAX_SUMMARY_CHARS = 1000  # max chars per chunk summary before combining


@dataclass
class SummaryResult:
    document_id:       str
    filename:          str
    executive_summary: str
    key_points:        list[str]
    important_facts:   list[str]
    important_numbers: list[str]
    risks:             list[str]
    conclusion:        str
    model:             str


class SummaryService:

    async def summarize(self, document_id: str, db: AsyncSession) -> SummaryResult:
        """
        Generate a structured summary of a document.
        Uses hierarchical summarization for large documents.
        """
        doc_repo = DocumentRepository(db)
        document = await doc_repo.get_by_id(document_id)

        if not document:
            raise NotFoundError('Document')
        if not document.is_ready:
            raise ValidationError(f'Document is not ready. Status: {document.status}')

        # If we already have a cached summary, return it
        if document.ai_summary:
            logger.info(f'[Summary] Returning cached summary for {document_id}')
            import json
            try:
                data = json.loads(document.ai_summary)
                return SummaryResult(
                    document_id       = document_id,
                    filename          = document.original_filename,
                    model             = llm_service.model,
                    **data,
                )
            except Exception:
                pass   # regenerate if cached data is corrupt

        # Load chunks
        chunks = await doc_repo.get_chunks(document_id)
        if not chunks:
            raise ValidationError('Document has no processed chunks.')

        logger.info(f'[Summary] {document.original_filename}: {len(chunks)} chunks')

        # Step 1: Batch-summarize chunks
        chunk_summaries = await self._summarize_in_batches(chunks)

        # Step 2: Generate final structured summary
        combined_text = '\n\n'.join(chunk_summaries)
        summary_data  = await llm_service.final_summary(
            combined_summaries = combined_text,
            filename           = document.original_filename,
        )

        # Step 3: Cache in DB
        import json
        await doc_repo.update_fields(document_id, ai_summary=json.dumps(summary_data))
        await db.commit()

        return SummaryResult(
            document_id       = document_id,
            filename          = document.original_filename,
            executive_summary = summary_data.get('executive_summary', ''),
            key_points        = summary_data.get('key_points', []),
            important_facts   = summary_data.get('important_facts', []),
            important_numbers = summary_data.get('important_numbers', []),
            risks             = summary_data.get('risks', []),
            conclusion        = summary_data.get('conclusion', ''),
            model             = llm_service.model,
        )

    async def _summarize_in_batches(self, chunks) -> list[str]:
        """
        Summarize chunks in groups of CHUNKS_PER_BATCH.
        For a 100-page document with 80 chunks → 16 batch summaries.
        """
        summaries = []

        for i in range(0, len(chunks), CHUNKS_PER_BATCH):
            batch       = chunks[i:i + CHUNKS_PER_BATCH]
            batch_text  = '\n\n'.join(c.content for c in batch)

            # Truncate to avoid overwhelming the LLM
            if len(batch_text) > 6000:
                batch_text = batch_text[:6000] + '...'

            summary = await llm_service.summarize_chunks(batch_text)
            summaries.append(summary[:MAX_SUMMARY_CHARS])

            logger.debug(f'[Summary] Batch {i // CHUNKS_PER_BATCH + 1} done')

        return summaries


summary_service = SummaryService()