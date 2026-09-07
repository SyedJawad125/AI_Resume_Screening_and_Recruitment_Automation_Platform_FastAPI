"""
app/workers/document_worker.py
────────────────────────────────
Async document processing pipeline.

This orchestrates the full pipeline in a FastAPI BackgroundTask:
  Upload → Extract → OCR → Clean → Chunk → Embed → Store → Ready

Why BackgroundTasks?
  - Upload endpoint returns immediately (202 Accepted)
  - Processing happens async in the background
  - User polls /status endpoint to check progress
  - For production scale: replace with Celery + Redis

Status progression:
  uploaded → processing → extracting_text → [ocr_processing]
  → chunking → embedding → ready / failed
"""

import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import DocumentStatus, ExtractionMethod
from app.repositories.document_repository import DocumentRepository
from app.services.pdf_service import pdf_service
from app.services.ocr_service import ocr_service
from app.services.chunking_service import chunking_service
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)


class DocumentWorker:

    async def process(self, document_id: str, db: AsyncSession) -> None:
        """
        Full document processing pipeline.
        Called as a FastAPI BackgroundTask after upload.
        Updates document status at each step.
        """
        doc_repo = DocumentRepository(db)

        try:
            # ── 1. Load document ───────────────────────────────────
            document = await doc_repo.get_by_id(document_id)
            if not document:
                logger.error(f'[Worker] Document not found: {document_id}')
                return

            logger.info(f'[Worker] Processing: {document.original_filename} ({document_id})')
            await doc_repo.update_status(document_id, DocumentStatus.PROCESSING, progress=5)
            await db.commit()

            # ── 2. PDF text extraction ─────────────────────────────
            await doc_repo.update_status(document_id, DocumentStatus.EXTRACTING_TEXT, progress=15)
            await db.commit()

            extraction = pdf_service.extract(document.file_path)
            await doc_repo.update_fields(document_id, page_count=extraction.page_count)
            await db.commit()

            logger.info(
                f'[Worker] Extracted {extraction.page_count} pages, '
                f'{extraction.total_chars} chars, OCR needed: {extraction.needs_ocr}'
            )

            # ── 3. OCR (if needed) ─────────────────────────────────
            pages_data = []

            if extraction.needs_ocr:
                await doc_repo.update_status(document_id, DocumentStatus.OCR_PROCESSING, progress=30)
                await db.commit()

                page_images = pdf_service.get_page_images(document.file_path)
                ocr_results = ocr_service.extract_pages(page_images)

                for page_result in extraction.pages:
                    pg_num = page_result.page_number

                    # Use OCR text where PyMuPDF text was insufficient
                    ocr_page   = next((o for o in ocr_results if o.page_number == pg_num), None)
                    use_ocr    = page_result.needs_ocr and ocr_page

                    text       = ocr_page.text if use_ocr else page_result.text
                    method     = ExtractionMethod.OCR if use_ocr else ExtractionMethod.PYMUPDF
                    confidence = ocr_page.confidence if use_ocr else None

                    pages_data.append({
                        'document_id':       document_id,
                        'page_number':       pg_num,
                        'text':              text,
                        'char_count':        len(text),
                        'extraction_method': method,
                        'ocr_confidence':    confidence,
                    })

                logger.info(f'[Worker] OCR complete for {document_id}')
            else:
                # PyMuPDF was sufficient — use directly
                for page_result in extraction.pages:
                    pages_data.append({
                        'document_id':       document_id,
                        'page_number':       page_result.page_number,
                        'text':              page_result.text,
                        'char_count':        page_result.char_count,
                        'extraction_method': ExtractionMethod.PYMUPDF,
                        'ocr_confidence':    None,
                    })

            # ── 4. Store pages ─────────────────────────────────────
            await doc_repo.bulk_create_pages(pages_data)
            await db.commit()

            # ── 5. Chunking ────────────────────────────────────────
            await doc_repo.update_status(document_id, DocumentStatus.CHUNKING, progress=55)
            await db.commit()

            page_dicts  = [{'page_number': p['page_number'], 'text': p['text']} for p in pages_data]
            chunks      = chunking_service.chunk_document(page_dicts, document_id)
            logger.info(f'[Worker] {len(chunks)} chunks created')

            # ── 6. Embedding ───────────────────────────────────────
            await doc_repo.update_status(document_id, DocumentStatus.EMBEDDING, progress=70)
            await db.commit()

            if chunks:
                # Batch embed all chunks (much faster than one by one)
                texts      = [c.content for c in chunks]
                embeddings = embedding_service.embed_batch(texts)

                chunk_dicts = []
                for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                    # Get page_id by matching page_number
                    page_rows = [p for p in pages_data if p['page_number'] == chunk.page_number]

                    chunk_dicts.append({
                        'document_id': document_id,
                        'chunk_index': chunk.chunk_index,
                        'content':     chunk.content,
                        'token_count': chunk.token_count,
                        'embedding':   embedding,
                        'page_number': chunk.page_number,
                        'metadata':    chunk.metadata,
                    })

                await doc_repo.bulk_create_chunks(chunk_dicts)
                await db.commit()

            logger.info(f'[Worker] Embeddings stored for {document_id}')

            # ── 7. Mark as ready ───────────────────────────────────
            await doc_repo.update_status(document_id, DocumentStatus.READY, progress=100)
            await db.commit()
            logger.info(f'[Worker] ✅ Document ready: {document_id}')

        except Exception as e:
            logger.exception(f'[Worker] ❌ Failed: {document_id} — {e}')
            try:
                await doc_repo.update_status(
                    document_id, DocumentStatus.FAILED,
                    error=str(e), progress=0,
                )
                await db.commit()
            except Exception as db_err:
                logger.error(f'[Worker] Could not update failed status: {db_err}')


document_worker = DocumentWorker()