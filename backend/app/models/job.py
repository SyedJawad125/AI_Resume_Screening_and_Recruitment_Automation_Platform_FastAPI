"""
app/models/job.py
────────────────────
Job postings + their AI-extracted structured requirements.

Design decision: the raw `description` text lives on `Job`, but everything
the matching engine needs (required/preferred skills, weights, experience
threshold) lives on `JobRequirement` as a separate 1:1 table. This keeps
"what the recruiter typed" and "what the AI extracted" cleanly separated —
if we re-run the Job Analysis Agent with a better prompt later, we only
touch JobRequirement rows, never the source text.
"""

from enum import Enum as PyEnum

from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.mixins import BaseModelMixin


class JobStatus(str, PyEnum):
    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"
    ARCHIVED = "archived"


class Job(BaseModelMixin, Base):
    __tablename__ = "jobs"

    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=True)
    status = Column(Enum(JobStatus), default=JobStatus.DRAFT, nullable=False)

    company = relationship("Company", foreign_keys=[company_id])
    created_by = relationship("User", foreign_keys=[created_by_id])
    requirement = relationship(
        "JobRequirement", back_populates="job", uselist=False, cascade="all, delete-orphan"
    )
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Job {self.title}>"


class JobRequirement(BaseModelMixin, Base):
    """AI-extracted structured requirements — the Job Analysis Agent's output.
    Never free-form text: everything here is validated Pydantic-shaped data
    before it's persisted (see app.schemas.job.JobAnalysisResult)."""

    __tablename__ = "job_requirements"

    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, unique=True)

    required_skills = Column(ARRAY(String), default=list, nullable=False)
    preferred_skills = Column(ARRAY(String), default=list, nullable=False)
    minimum_experience_years = Column(Integer, default=0, nullable=False)
    education_requirements = Column(ARRAY(String), default=list, nullable=False)
    responsibilities = Column(ARRAY(String), default=list, nullable=False)

    # {"Python": 1.0, "FastAPI": 0.9, ...} — per-skill importance used by the matcher
    skill_weights = Column(JSON, default=dict, nullable=False)

    # Raw LLM response kept for auditability/debugging — never displayed as truth
    raw_llm_output = Column(JSON, nullable=True)

    job = relationship("Job", back_populates="requirement")

    def __repr__(self):
        return f"<JobRequirement job_id={self.job_id}>"
