"""
app/services/ocr_service.py
────────────────────────────
OCR for scanned/image-based PDFs using Tesseract.

Pipeline:
  1. Receive PNG image bytes (from pdf_service.get_page_images)
  2. Pre-process image (denoise, deskew, threshold)
  3. Run Tesseract OCR
  4. Return text + confidence score

Why Tesseract?
  - Free, open-source, widely used
  - Good accuracy for clean scanned documents
  - Supports 100+ languages
  - pytesseract wraps it cleanly for Python

Image pre-processing improves accuracy:
  - Grayscale: removes color noise
  - Gaussian blur: reduces digital noise
  - Adaptive threshold: handles uneven lighting
  - Deskewing: fixes tilted scans
"""

import io
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class OCRResult:
    page_number: int
    text:        str
    confidence:  float    # 0-100 average word confidence


class OCRService:

    def extract_page(self, page_number: int, image_bytes: bytes) -> OCRResult:
        """
        Run OCR on a single PDF page image.
        image_bytes: PNG bytes from pdf_service.get_page_images()
        """
        try:
            import pytesseract
            from PIL import Image
            import cv2
            import numpy as np

            # Load image from bytes
            image_array = np.frombuffer(image_bytes, np.uint8)
            img         = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

            # Pre-process for better OCR accuracy
            processed = self._preprocess(img)

            # Run Tesseract
            pil_img    = Image.fromarray(processed)
            ocr_data   = pytesseract.image_to_data(
                pil_img,
                output_type=pytesseract.Output.DICT,
                config='--psm 3',  # fully automatic page segmentation
            )

            # Extract text and confidence
            text, confidence = self._parse_ocr_data(ocr_data)

            logger.info(f'[OCR] Page {page_number}: {len(text)} chars, confidence={confidence:.1f}%')

            return OCRResult(
                page_number = page_number,
                text        = text,
                confidence  = confidence,
            )

        except Exception as e:
            logger.error(f'[OCR] Page {page_number} failed: {e}')
            from app.core.exceptions import OCRError
            raise OCRError(f'OCR failed on page {page_number}: {str(e)}')

    def extract_pages(self, pages: list[tuple[int, bytes]]) -> list[OCRResult]:
        """Run OCR on multiple pages. Returns results in page order."""
        results = []
        for page_number, image_bytes in pages:
            result = self.extract_page(page_number, image_bytes)
            results.append(result)
        return results

    def _preprocess(self, img) -> object:
        """
        Image pre-processing pipeline for better OCR accuracy.

        Steps:
          1. Grayscale — removes color, reduces complexity
          2. Gaussian blur — removes noise
          3. Adaptive threshold — handles uneven lighting (scanned docs often have shadows)
          4. Deskew — fixes tilted pages (up to ±10 degrees)
        """
        import cv2
        import numpy as np

        # 1. Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 2. Denoise
        denoised = cv2.fastNlMeansDenoising(gray, h=10)

        # 3. Adaptive threshold
        # Better than global threshold for documents with variable background
        thresh = cv2.adaptiveThreshold(
            denoised, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            11, 2,
        )

        # 4. Deskew
        deskewed = self._deskew(thresh)

        return deskewed

    def _deskew(self, image) -> object:
        """Correct page tilt. Scanned docs are often slightly rotated."""
        import cv2
        import numpy as np

        try:
            coords  = np.column_stack(np.where(image > 0))
            angle   = cv2.minAreaRect(coords)[-1]

            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle

            # Only correct small angles (big angles = wrong detection)
            if abs(angle) > 10:
                return image

            (h, w)   = image.shape[:2]
            center   = (w // 2, h // 2)
            M        = cv2.getRotationMatrix2D(center, angle, 1.0)
            rotated  = cv2.warpAffine(image, M, (w, h),
                                       flags=cv2.INTER_CUBIC,
                                       borderMode=cv2.BORDER_REPLICATE)
            return rotated
        except Exception:
            return image  # return unchanged if deskew fails

    def _parse_ocr_data(self, data: dict) -> tuple[str, float]:
        """Extract text and average confidence from Tesseract output dict."""
        words       = []
        confidences = []

        for i, word in enumerate(data['text']):
            conf = int(data['conf'][i])
            if conf > 0 and word.strip():   # conf=-1 means no word detected
                words.append(word)
                confidences.append(conf)

        text       = ' '.join(words)
        avg_conf   = sum(confidences) / max(len(confidences), 1)

        return text, avg_conf


ocr_service = OCRService()