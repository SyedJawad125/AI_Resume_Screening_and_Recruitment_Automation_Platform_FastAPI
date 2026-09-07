"""
app/models/candidate.py
──────────────────────────
Structured candidate profile.

Design decision: education / work_experience / projects / certifications /
languages are stored as JSONB arrays-of-objects on Candidate rather than as
five separate normalized tables (candidate_education, candidate_experience,
...). Rationale: we never need to filter/join on individual work-experience
rows across candidates in this project — we only ever read/display them as
a unit per candidate, and search happens via the vector embedding, not SQL
WHERE clauses on nested fields. JSONB keeps the schema simple without losing
query-ability (Postgres can still index into JSONB if needed later).
`skills` stays a flat ARRAY(String) because the matching engine DOES need
fast set-intersection against job requirements — that's the one field worth
a first-class column.
"""

from sqlalchemy import Column, String, Text, Integer, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.mixins import BaseModelMixin


class Candidate(BaseModelMixin, Base):
    __tablename__ = "candidates"

    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    experience_years = Column(Integer, nullable=True)

    skills = Column(ARRAY(String), default=list, nullable=False)
    education = Column(JSON, default=list, nullable=False)          # [{degree, institution, year}]
    work_experience = Column(JSON, default=list, nullable=False)    # [{title, company, years, description}]
    projects = Column(JSON, default=list, nullable=False)           # [{name, description, technologies}]
    certifications = Column(ARRAY(String), default=list, nullable=False)
    languages = Column(ARRAY(String), default=list, nullable=False)

    raw_llm_output = Column(JSON, nullable=True)  # auditability of the extraction

    resumes = relationship("Resume", back_populates="candidate", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")
    embeddings = relationship("CandidateEmbedding", back_populates="candidate", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Candidate {self.name or self.email}>"
