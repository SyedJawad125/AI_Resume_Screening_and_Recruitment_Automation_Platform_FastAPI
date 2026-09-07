"""
app/models/resume.py
────────────────────────
Resume (uploaded file + extracted text) and ProcessingJob (status tracker
for the async upload → OCR → parse → embed pipeline).
"""

from enum import Enum as PyEnum

from sqlalchemy import Column, String, Text, Integer, ForeignKey, Enum, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.mixins import BaseModelMixin


class ProcessingStatus(str, PyEnum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Resume(BaseModelMixin, Base):
    __tablename__ = "resumes"

    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="SET NULL"), nullable=True)
    uploaded_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    original_filename = Column(String(500), nullable=False)
    storage_path = Column(String(1000), nullable=False)
    file_size_bytes = Column(Integer, nullable=True)
    content_type = Column(String(100), nullable=True)

    used_ocr = Column(Boolean, default=False, nullable=False)
    raw_text = Column(Text, nullable=True)
    page_count = Column(Integer, nullable=True)
    # [{"page": 1, "text": "..."}] — preserves page attribution for evidence citations
    pages = Column(JSON, nullable=True)

    status = Column(Enum(ProcessingStatus), default=ProcessingStatus.QUEUED, nullable=False)
    error_message = Column(Text, nullable=True)

    candidate = relationship("Candidate", back_populates="resumes")

    def __repr__(self):
        return f"<Resume {self.original_filename} status={self.status}>"
