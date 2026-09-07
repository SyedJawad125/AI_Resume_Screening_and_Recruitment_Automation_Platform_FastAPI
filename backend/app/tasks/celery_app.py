"""
app/tasks/celery_app.py
────────────────────────────
Celery app instance. Redis is used as both broker and result backend —
one fewer moving part than RabbitMQ, and plenty for this scale (50-100
resumes per batch).

Run a worker with:
    celery -A app.tasks.celery_app worker --loglevel=info --concurrency=4
"""

from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "hiremind",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.resume_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_track_started=True,
    result_expires=3600,
    # Resume processing (extraction + OCR + LLM parsing) can take a while
    # per file — don't let Celery kill a task mid-LLM-call.
    task_time_limit=300,
    task_soft_time_limit=270,
    worker_prefetch_multiplier=1,  # fair-dispatch: don't hog a batch of files on one worker
)
