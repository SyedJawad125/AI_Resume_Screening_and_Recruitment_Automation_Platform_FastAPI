"""
app/core/logging.py
────────────────────
Structured logging configuration for the entire app.
Call setup_logging() once at startup in main.py lifespan.
"""
import logging
import sys
from app.core.config import settings


def setup_logging() -> None:
    """Configure root logger with level from settings."""
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    fmt = logging.Formatter(
        fmt   = '%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
        datefmt = '%Y-%m-%d %H:%M:%S',
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(fmt)

    root = logging.getLogger()
    root.setLevel(level)
    root.handlers = [handler]

    # Quiet noisy third-party loggers
    for noisy in ('httpx', 'httpcore', 'uvicorn.access', 'sqlalchemy.engine'):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    logging.getLogger('app').setLevel(level)
    logging.getLogger('core').setLevel(level)


def get_logger(name: str) -> logging.Logger:
    """Get a named logger. Usage: logger = get_logger(__name__)"""
    return logging.getLogger(name)