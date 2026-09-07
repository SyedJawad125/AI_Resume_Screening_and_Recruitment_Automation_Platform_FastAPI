"""
app/tasks/resume_tasks.py
────────────────────────────
Celery tasks are synchronous by design; our pipeline is async (async
SQLAlchemy, async LLM/embedding calls). Each task run gets its own event
loop and its own DB session — Celery worker processes don't share an
event loop across tasks, so this is the correct pattern (not a hack).

Retries: transient failures (DB hiccup, LLM rate limit) get automatic
exponential-backoff retries at the Celery level, on top of the retries
already inside app.llm.client for the LLM call itself.
"""

import asyncio

from app.db.database import AsyncSessionLocal
from app.services.resume_service import run_resume_pipeline
from app.tasks.celery_app import celery_app


@celery_app.task(
    name="process_resume",
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=60,
    max_retries=3,
)
def process_resume_task(self, resume_id: str) -> str:
    """Entry point Celery calls. Delegates to the shared async pipeline so
    behavior is identical to the synchronous single-upload path."""

    async def _run():
        async with AsyncSessionLocal() as db:
            resume = await run_resume_pipeline(db, resume_id)
            return str(resume.status)

    return asyncio.run(_run())
