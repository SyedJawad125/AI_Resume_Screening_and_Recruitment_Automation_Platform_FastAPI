"""
app/document_processing/ocr.py
──────────────────────────────────
OCR sits behind a clean interface so the OCR provider can be swapped
(Tesseract → cloud OCR API) via one config value (`OCR_PROVIDER`),
without touching anything that calls `get_ocr_provider()`.
"""

from abc import ABC, abstractmethod

from PIL import Image

from app.core.config import settings


class OCRProvider(ABC):
    @abstractmethod
    def extract_text(self, image: Image.Image) -> str:
        """Return plain text extracted from a single page image."""
        raise NotImplementedError


class TesseractOCRProvider(OCRProvider):
    """Default: local, free, no API key required. Good enough for a portfolio
    project; swap to a cloud OCR provider for production accuracy on messy scans."""

    def extract_text(self, image: Image.Image) -> str:
        import pytesseract

        return pytesseract.image_to_string(image)


class CloudOCRProvider(OCRProvider):
    """Placeholder for a hosted OCR API (e.g. Azure Document Intelligence,
    Google Vision). Implement `extract_text` the same way and flip
    OCR_PROVIDER=CLOUD in .env — nothing else in the app changes."""

    def __init__(self, api_key: str):
        self.api_key = api_key

    def extract_text(self, image: Image.Image) -> str:
        raise NotImplementedError(
            "CloudOCRProvider is a placeholder — implement the specific API call here."
        )


def get_ocr_provider() -> OCRProvider:
    if settings.OCR_PROVIDER.upper() == "TESSERACT":
        return TesseractOCRProvider()
    if settings.OCR_PROVIDER.upper() == "CLOUD":
        return CloudOCRProvider(api_key=settings.OCR_API_KEY)
    raise ValueError(f"Unknown OCR_PROVIDER: {settings.OCR_PROVIDER}")
