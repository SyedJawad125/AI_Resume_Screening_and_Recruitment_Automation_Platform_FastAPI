"""
app/models/interview.py
──────────────────────────
AI interview system: after a candidate is shortlisted, generate
job-specific questions, collect answers, and produce a structured
technical assessment.
"""

from enum import Enum as PyEnum

from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.mixins import BaseModelMixin


class InterviewStatus(str, PyEnum):
    CREATED = "created"
    QUESTIONS_GENERATED = "questions_generated"
    ANSWERS_SUBMITTED = "answers_submitted"
    EVALUATED = "evaluated"


class Interview(BaseModelMixin, Base):
    __tablename__ = "interviews"

    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(InterviewStatus), default=InterviewStatus.CREATED, nullable=False)

    questions = relationship(
        "InterviewQuestion", back_populates="interview", cascade="all, delete-orphan", order_by="InterviewQuestion.order"
    )
    evaluation_result = relationship(
        "EvaluationResult", back_populates="interview", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Interview job_id={self.job_id} candidate_id={self.candidate_id}>"


class InterviewQuestion(BaseModelMixin, Base):
    __tablename__ = "interview_questions"

    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    order = Column(Integer, nullable=False, default=0)
    question_text = Column(Text, nullable=False)
    topic = Column(String(100), nullable=True)  # e.g. "system design", "FastAPI", "RAG"

    interview = relationship("Interview", back_populates="questions")
    answer = relationship("InterviewAnswer", back_populates="question", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<InterviewQuestion {self.question_text[:40]}>"


class InterviewAnswer(BaseModelMixin, Base):
    __tablename__ = "interview_answers"

    question_id = Column(
        UUID(as_uuid=True), ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    answer_text = Column(Text, nullable=False)

    question = relationship("InterviewQuestion", back_populates="answer")

    def __repr__(self):
        return f"<InterviewAnswer question_id={self.question_id}>"


class EvaluationResult(BaseModelMixin, Base):
    """Final technical assessment for one interview — one row per interview,
    aggregating all per-question evaluation into the 5-dimension rubric
    from the architecture doc."""

    __tablename__ = "evaluation_results"

    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, unique=True)

    technical_knowledge = Column(Float, nullable=False, default=0.0)
    problem_solving = Column(Float, nullable=False, default=0.0)
    communication = Column(Float, nullable=False, default=0.0)
    role_fit = Column(Float, nullable=False, default=0.0)
    overall = Column(Float, nullable=False, default=0.0)

    # [{"question": "...", "answer": "...", "evaluation": "...", "score": 8}]
    per_question_feedback = Column(JSON, default=list, nullable=False)
    summary = Column(Text, nullable=True)

    interview = relationship("Interview", back_populates="evaluation_result")

    def __repr__(self):
        return f"<EvaluationResult interview_id={self.interview_id} overall={self.overall}>"
