"""
app/services/chunking_service.py
──────────────────────────────────
UPDATED: Uses LangChain RecursiveCharacterTextSplitter.

Before: custom sentence-boundary splitter
After:  LangChain RecursiveCharacterTextSplitter

Why RecursiveCharacterTextSplitter?
  - Tries to split on paragraphs → sentences → words → chars (in order)
  - Preserves semantic meaning better than fixed-size splitting
  - Industry standard for RAG chunking
  - chunk_size measured in characters (more precise than words)
  - chunk_overlap prevents losing context at chunk boundaries
  - LangChain Document objects carry metadata natively
"""

import logging
from dataclasses import dataclass

from langchain_core.documents import Document as LCDocument
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class Chunk:
    chunk_index: int
    content:     str
    page_number: int
    token_count: int
    metadata:    dict


class ChunkingService:
    """
    Document chunking using LangChain RecursiveCharacterTextSplitter.

    Splitting priority (recursive):
      1. Double newline (paragraphs)
      2. Single newline
      3. Period/sentence end
      4. Space (words)
      5. Character (last resort)
    """

    def __init__(self, chunk_size: int = None, chunk_overlap: int = None):
        # LangChain splitter measures in characters (not words)
        # Multiply word-count settings by ~5 (avg chars per word)
        char_size    = (chunk_size    or settings.CHUNK_SIZE)    * 5
        char_overlap = (chunk_overlap or settings.CHUNK_OVERLAP) * 5

        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size        = char_size,
            chunk_overlap     = char_overlap,
            length_function   = len,
            separators        = ['\n\n', '\n', '. ', '! ', '? ', ' ', ''],
            keep_separator    = True,
            add_start_index   = True,   # metadata: start_index in original text
        )

    def chunk_document(
        self,
        pages:       list[dict],   # [{'page_number': 1, 'text': '...'}]
        document_id: str,
    ) -> list[Chunk]:
        """
        Chunk all pages using LangChain splitter.
        Each page becomes a LangChain Document with page metadata,
        then the splitter divides it into chunks preserving that metadata.
        """
        # Build LangChain Document objects per page
        lc_docs = []
        for page in pages:
            text = page.get('text', '').strip()
            if not text:
                continue
            lc_docs.append(LCDocument(
                page_content = text,
                metadata     = {
                    'page_number': page['page_number'],
                    'document_id': document_id,
                },
            ))

        if not lc_docs:
            return []

        # Split all pages — LangChain preserves metadata in each chunk
        split_docs = self._splitter.split_documents(lc_docs)

        # Convert to our Chunk dataclass
        chunks = []
        for idx, doc in enumerate(split_docs):
            page_number = doc.metadata.get('page_number', 1)
            content     = doc.page_content.strip()
            if not content:
                continue

            chunks.append(Chunk(
                chunk_index = idx,
                content     = content,
                page_number = page_number,
                token_count = len(content.split()),
                metadata    = {
                    'document_id': document_id,
                    'page_number': page_number,
                    'chunk_index': idx,
                    'start_index': doc.metadata.get('start_index', 0),
                },
            ))

        logger.info(
            f'[Chunking] {document_id}: {len(lc_docs)} pages → '
            f'{len(chunks)} chunks '
            f'(size={self._splitter._chunk_size} chars, '
            f'overlap={self._splitter._chunk_overlap} chars)'
        )
        return chunks

    def chunk_text(self, text: str, document_id: str, page_number: int = 1) -> list[Chunk]:
        """Chunk a single text string (utility method)."""
        return self.chunk_document(
            [{'page_number': page_number, 'text': text}],
            document_id,
        )

    def split_for_summary(self, text: str, max_chunk_size: int = 4000) -> list[str]:
        """
        Split text into larger chunks for summarisation.
        Larger chunks = fewer LLM calls for hierarchical summarisation.
        """
        splitter = RecursiveCharacterTextSplitter(
            chunk_size    = max_chunk_size,
            chunk_overlap = 200,
            separators    = ['\n\n', '\n', '. ', ' ', ''],
        )
        return [doc.page_content for doc in splitter.create_documents([text])]


chunking_service = ChunkingService()