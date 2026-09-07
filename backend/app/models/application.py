"""
app/models/application.py
────────────────────────────
Application = the join between a Candidate and a Job.
CandidateScore = the transparent, explainable scoring breakdown for one
Application — every sub-score is stored individually so the score is
auditable and reproducible, never just a single opaque LLM-generated number.
"""

from enum import Enum as PyEnum

from sqlalchemy import Column, Float, ForeignKey, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.mixins import BaseModelMixin


class Recommendation(str, PyEnum):
    SHORTLIST = "SHORTLIST"
    REVIEW = "REVIEW"
    REJECT = "REJECT"


class Application(BaseModelMixin, Base):
    __tablename__ = "applications"

    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)

    job = relationship("Job", back_populates="applications")
    candidate = relationship("Candidate", back_populates="applications")
    score = relationship("CandidateScore", back_populates="application", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Application job_id={self.job_id} candidate_id={self.candidate_id}>"


class CandidateScore(BaseModelMixin, Base):
    __tablename__ = "candidate_scores"

    application_id = Column(
        UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, unique=True
    )

    # Sub-scores (0-100 scale) — each computed by a distinct, inspectable step
    required_skills_score = Column(Float, nullable=False, default=0.0)
    experience_score = Column(Float, nullable=False, default=0.0)
    semantic_score = Column(Float, nullable=False, default=0.0)
    projects_score = Column(Float, nullable=False, default=0.0)
    preferred_skills_score = Column(Float, nullable=False, default=0.0)

    final_score = Column(Float, nullable=False, default=0.0)
    recommendation = Column(Enum(Recommendation), nullable=False, default=Recommendation.REVIEW)
    confidence = Column(Float, nullable=False, default=0.0)

    matched_required_skills = Column(JSON, default=list, nullable=False)
    missing_required_skills = Column(JSON, default=list, nullable=False)
    matched_preferred_skills = Column(JSON, default=list, nullable=False)

    # [{"requirement": "FastAPI", "evidence": "...", "resume_page": 2}]
    # or {"requirement": "AWS", "evidence": null} → "Evidence not found in resume."
    evidence = Column(JSON, default=list, nullable=False)

    strengths = Column(JSON, default=list, nullable=False)
    weights_used = Column(JSON, nullable=False)  # snapshot of weights at scoring time (reproducibility)

    application = relationship("Application", back_populates="score")

    def __repr__(self):
        return f"<CandidateScore application_id={self.application_id} final={self.final_score}>"
