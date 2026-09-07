"""
app/utils/file_utils.py
────────────────────────
File validation and safe filename utilities.
"""
import os
import re
import uuid
from pathlib import Path

from app.core.config import settings
from app.core.exceptions import FileTooLargeError, UnsupportedFileTypeError

ALLOWED_EXTENSIONS = {'.pdf'}
ALLOWED_MIME_TYPES  = {'application/pdf', 'application/x-pdf'}


def validate_upload(filename: str, content_type: str, size_bytes: int) -> None:
    """Raise appropriate exception if file is invalid."""
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise UnsupportedFileTypeError(['PDF'])
    if size_bytes > settings.max_file_size_bytes:
        raise FileTooLargeError(settings.MAX_FILE_SIZE_MB)


def safe_filename(original: str) -> str:
    """Generate a unique, safe filename from the original."""
    ext = Path(original).suffix.lower()
    return f'{uuid.uuid4()}{ext}'


def ensure_dir(path: str) -> None:
    """Create directory if it doesn't exist."""
    os.makedirs(path, exist_ok=True)


def human_size(size_bytes: int) -> str:
    """Return human-readable file size."""
    for unit in ('B', 'KB', 'MB', 'GB'):
        if size_bytes < 1024:
            return f'{size_bytes:.1f} {unit}'
        size_bytes /= 1024
    return f'{size_bytes:.1f} TB'