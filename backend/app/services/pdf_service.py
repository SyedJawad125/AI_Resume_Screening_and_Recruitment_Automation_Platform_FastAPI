"""
app/services/pdf_service.py
────────────────────────────
PDF text extraction using PyMuPDF (fitz).

Pipeline:
  1. Open PDF
  2. Extract text page by page
  3. Check if text is sufficient (>50 chars/page avg)
  4. If not — flag for OCR
  5. Return per-page results

Why PyMuPDF (fitz)?
  - Fastest Python PDF library
  - Handles complex layouts, tables, multi-column
  - Returns text with position metadata
  - ~10x faster than pdfplumber for large documents
"""

import logging
from dataclasses import dataclass
from pathlib import Path

logger = logging.getLogger(__name__)

MIN_CHARS_PER_PAGE = 50   # below this → page is likely scanned


@dataclass
class PageResult:
    page_number:   int
    text:          str
    char_count:    int
    needs_ocr:     bool


@dataclass
class PDFExtractionResult:
    page_count:    int
    pages:         list[PageResult]
    needs_ocr:     bool    # True if most pages have insufficient text
    total_chars:   int


class PDFService:

    def extract(self, file_path: str) -> PDFExtractionResult:
        """
        Extract text from all pages of a PDF.
        Returns per-page results and an overall OCR flag.
        """
        import fitz  # PyMuPDF

        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f'PDF not found: {file_path}')

        logger.info(f'[PDF] Extracting: {path.name}')

        doc    = fitz.open(str(path))
        pages  = []
        total_chars = 0

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text('text').strip()
            text = self._clean_text(text)

            char_count = len(text)
            total_chars += char_count
            needs_ocr   = char_count < MIN_CHARS_PER_PAGE

            pages.append(PageResult(
                page_number = page_num + 1,   # 1-indexed
                text        = text,
                char_count  = char_count,
                needs_ocr   = needs_ocr,
            ))

        doc.close()

        # OCR needed if more than 30% of pages are text-poor
        poor_pages  = sum(1 for p in pages if p.needs_ocr)
        needs_ocr   = (poor_pages / max(len(pages), 1)) > 0.3

        logger.info(
            f'[PDF] {path.name}: {len(pages)} pages, '
            f'{total_chars} chars, OCR needed: {needs_ocr}'
        )

        return PDFExtractionResult(
            page_count  = len(pages),
            pages       = pages,
            needs_ocr   = needs_ocr,
            total_chars = total_chars,
        )

    def get_page_images(self, file_path: str) -> list[tuple[int, bytes]]:
        """
        Convert PDF pages to PNG images (for OCR).
        Returns list of (page_number, png_bytes) tuples.
        Uses 300 DPI — good balance between OCR accuracy and speed.
        """
        import fitz

        doc    = fitz.open(file_path)
        images = []
        mat    = fitz.Matrix(300 / 72, 300 / 72)   # 300 DPI scaling

        for page_num in range(len(doc)):
            page     = doc[page_num]
            pix      = page.get_pixmap(matrix=mat, alpha=False)
            png_data = pix.tobytes('png')
            images.append((page_num + 1, png_data))

        doc.close()
        return images

    def get_metadata(self, file_path: str) -> dict:
        """Extract PDF metadata (author, title, creation date, etc.)."""
        import fitz
        doc  = fitz.open(file_path)
        meta = doc.metadata
        doc.close()
        return meta

    def _clean_text(self, text: str) -> str:
        """Remove excessive whitespace and non-printable characters."""
        import re
        text = re.sub(r'\n{3,}', '\n\n', text)      # max 2 consecutive newlines
        text = re.sub(r'[ \t]{2,}', ' ', text)       # collapse spaces
        text = re.sub(r'[^\x20-\x7E\n\t]', '', text) # remove non-ASCII (basic)
        return text.strip()


pdf_service = PDFService()