"""
app/models/embedding.py
──────────────────────────
pgvector storage for candidate embeddings. One candidate can have
multiple embeddings of different "kinds" (full profile, projects-only,
experience-only) — the matching engine and semantic search both query
by `kind` so they compare like-with-like.
"""

from enum import Enum as PyEnum

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.config import settings
from app.db.database import Base
from app.models.mixins import UUIDMixin, TimeStampMixin


class EmbeddingKind(str, PyEnum):
    PROFILE = "profile"          # full candidate summary + skills
    EXPERIENCE = "experience"    # work_experience text only
    PROJECTS = "projects"        # projects text only


class CandidateEmbedding(UUIDMixin, TimeStampMixin, Base):
    __tablename__ = "candidate_embeddings"

    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    kind = Column(Enum(EmbeddingKind), default=EmbeddingKind.PROFILE, nullable=False)

    # The exact text that was embedded — needed so semantic search can show
    # "why did this match" evidence without re-deriving it from the resume.
    source_text = Column(Text, nullable=False)
    embedding = Column(Vector(settings.EMBEDDING_DIM), nullable=False)

    candidate = relationship("Candidate", back_populates="embeddings")

    def __repr__(self):
        return f"<CandidateEmbedding candidate_id={self.candidate_id} kind={self.kind}>"
