# """
# app/models/document.py
# ───────────────────────
# Document processing models.

# Document      → the uploaded PDF file
# DocumentPage  → text extracted per page (with OCR flag)
# DocumentChunk → text chunks with pgvector embeddings for RAG

# Why pgvector?
#   - Native PostgreSQL extension
#   - HNSW index for fast approximate nearest-neighbor search
#   - Keeps vectors alongside metadata in the same DB
#   - No separate vector DB to maintain (simpler architecture)
#   - Cosine similarity is ideal for semantic search
# """

# import uuid
# from enum import Enum as PyEnum

# from sqlalchemy import (
#     Boolean, Column, DateTime, ForeignKey,
#     Integer, String, Text, Float, JSON, Enum, func,
# )
# from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.orm import relationship
# from pgvector.sqlalchemy import Vector

# from app.db.database import Base
# from app.core.config import settings


# # ─────────────────────────────────────────────────────────────────
# #  Enums
# # ─────────────────────────────────────────────────────────────────

# class DocumentStatus(str, PyEnum):
#     UPLOADED         = 'uploaded'
#     PROCESSING       = 'processing'
#     EXTRACTING_TEXT  = 'extracting_text'
#     OCR_PROCESSING   = 'ocr_processing'
#     CHUNKING         = 'chunking'
#     EMBEDDING        = 'embedding'
#     READY            = 'ready'
#     FAILED           = 'failed'


# class ExtractionMethod(str, PyEnum):
#     PYMUPDF = 'pymupdf'
#     OCR     = 'ocr'


# # ─────────────────────────────────────────────────────────────────
# #  Document
# # ─────────────────────────────────────────────────────────────────

# class Document(Base):
#     __tablename__ = 'documents'

#     id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     user_id    = Column(UUID(as_uuid=True), ForeignKey('users.id',    ondelete='CASCADE'), nullable=False)
#     company_id = Column(UUID(as_uuid=True), ForeignKey('companies.id', ondelete='CASCADE'), nullable=True)

#     filename         = Column(String(500), nullable=False)
#     original_filename = Column(String(500), nullable=False)
#     file_path        = Column(String(1000), nullable=False)
#     file_size        = Column(Integer, nullable=False)         # bytes
#     mime_type        = Column(String(100), nullable=False)
#     page_count       = Column(Integer, nullable=True)

#     status           = Column(Enum(DocumentStatus), default=DocumentStatus.UPLOADED, nullable=False, index=True)
#     processing_error = Column(Text, nullable=True)
#     progress         = Column(Integer, default=0, nullable=False)  # 0-100

#     # AI-generated content
#     ai_summary       = Column(Text, nullable=True)
#     extracted_data   = Column(JSON, nullable=True)   # structured JSON extraction result

#     created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
#     updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
#     deleted    = Column(Boolean, default=False, nullable=False)

#     # Relationships
#     owner   = relationship('User',    back_populates='documents', lazy='selectin')
#     company = relationship('Company', back_populates='documents', lazy='selectin')
#     pages   = relationship('DocumentPage',  back_populates='document', cascade='all, delete-orphan', order_by='DocumentPage.page_number')
#     chunks  = relationship('DocumentChunk', back_populates='document', cascade='all, delete-orphan')

#     def __repr__(self):
#         return f'<Document {self.original_filename} status={self.status}>'

#     @property
#     def is_ready(self) -> bool:
#         return self.status == DocumentStatus.READY

#     @property
#     def file_size_mb(self) -> float:
#         return round(self.file_size / (1024 * 1024), 2)


# # ─────────────────────────────────────────────────────────────────
# #  DocumentPage  — per-page text (with extraction method)
# # ─────────────────────────────────────────────────────────────────

# class DocumentPage(Base):
#     __tablename__ = 'document_pages'

#     id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id', ondelete='CASCADE'), nullable=False, index=True)
#     page_number = Column(Integer, nullable=False)
#     text        = Column(Text, nullable=False, default='')
#     char_count  = Column(Integer, default=0, nullable=False)

#     extraction_method = Column(Enum(ExtractionMethod), default=ExtractionMethod.PYMUPDF, nullable=False)
#     ocr_confidence    = Column(Float, nullable=True)   # 0-100 if OCR was used

#     created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

#     # Relationships
#     document = relationship('Document', back_populates='pages')
#     chunks   = relationship('DocumentChunk', back_populates='page', cascade='all, delete-orphan')

#     def __repr__(self):
#         return f'<DocumentPage doc={self.document_id} page={self.page_number}>'


# # ─────────────────────────────────────────────────────────────────
# #  DocumentChunk  — text chunks with pgvector embeddings
# # ─────────────────────────────────────────────────────────────────

# class DocumentChunk(Base):
#     __tablename__ = 'document_chunks'

#     id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id', ondelete='CASCADE'), nullable=False, index=True)
#     page_id     = Column(UUID(as_uuid=True), ForeignKey('document_pages.id', ondelete='CASCADE'), nullable=True)

#     chunk_index = Column(Integer, nullable=False)         # position in document
#     content     = Column(Text, nullable=False)
#     token_count = Column(Integer, default=0, nullable=False)

#     # pgvector column — 384 dims for all-MiniLM-L6-v2
#     # Change EMBEDDING_DIMENSION in .env if using a different model
#     embedding = Column(
#         Vector(settings.EMBEDDING_DIMENSION),
#         nullable=True,
#         comment=f'{settings.EMBEDDING_DIMENSION}-dim vector from {settings.EMBEDDING_MODEL}',
#     )

#     # Metadata for citations
#     metadata   = Column(JSON, nullable=True)  # {"page_number": 5, "document_id": "..."}
#     page_number = Column(Integer, nullable=True)  # denormalized for fast citation lookup

#     created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

#     # Relationships
#     document = relationship('Document',     back_populates='chunks')
#     page     = relationship('DocumentPage', back_populates='chunks')

#     def __repr__(self):
#         return f'<DocumentChunk doc={self.document_id} chunk={self.chunk_index} page={self.page_number}>'



"""
app/models/document.py
───────────────────────
Document processing models.

Document      → uploaded PDF/document file
DocumentPage  → extracted text per page
DocumentChunk → text chunks with pgvector embeddings for RAG
"""

from enum import Enum as PyEnum

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Float,
    JSON,
    Enum,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from app.db.database import Base
from app.core.config import settings

from app.models.mixins import (
    UUIDMixin,
    TimeStampMixin,
    BaseModelMixin,
)


# ═════════════════════════════════════════════════════════════════════
# Enums
# ═════════════════════════════════════════════════════════════════════


class DocumentStatus(str, PyEnum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    EXTRACTING_TEXT = "extracting_text"
    OCR_PROCESSING = "ocr_processing"
    CHUNKING = "chunking"
    EMBEDDING = "embedding"
    READY = "ready"
    FAILED = "failed"


class ExtractionMethod(str, PyEnum):
    PYMUPDF = "pymupdf"
    OCR = "ocr"


# ═════════════════════════════════════════════════════════════════════
# Document
# ═════════════════════════════════════════════════════════════════════


# class Document(BaseModelMixin, Base):
#     __tablename__ = "documents"

#     # ────────────────────────────────────────────────────────────────
#     # Ownership / Multi-tenancy
#     # ────────────────────────────────────────────────────────────────

#     user_id = Column(
#         UUID(as_uuid=True),
#         ForeignKey(
#             "users.id",
#             ondelete="CASCADE",
#         ),
#         nullable=False,
#         index=True,
#     )

#     company_id = Column(
#         UUID(as_uuid=True),
#         ForeignKey(
#             "companies.id",
#             ondelete="CASCADE",
#         ),
#         nullable=True,
#         index=True,
#     )

#     # ────────────────────────────────────────────────────────────────
#     # File information
#     # ────────────────────────────────────────────────────────────────

#     filename = Column(
#         String(500),
#         nullable=False,
#     )

#     original_filename = Column(
#         String(500),
#         nullable=False,
#     )

#     file_path = Column(
#         String(1000),
#         nullable=False,
#     )

#     file_size = Column(
#         Integer,
#         nullable=False,
#     )

#     mime_type = Column(
#         String(100),
#         nullable=False,
#     )

#     page_count = Column(
#         Integer,
#         nullable=True,
#     )

#     # ────────────────────────────────────────────────────────────────
#     # Processing
#     # ────────────────────────────────────────────────────────────────

#     status = Column(
#         Enum(DocumentStatus),
#         default=DocumentStatus.UPLOADED,
#         nullable=False,
#         index=True,
#     )

#     processing_error = Column(
#         Text,
#         nullable=True,
#     )

#     progress = Column(
#         Integer,
#         default=0,
#         nullable=False,
#     )

#     # ────────────────────────────────────────────────────────────────
#     # AI-generated content
#     # ────────────────────────────────────────────────────────────────

#     ai_summary = Column(
#         Text,
#         nullable=True,
#     )

#     extracted_data = Column(
#         JSON,
#         nullable=True,
#     )

#     # ────────────────────────────────────────────────────────────────
#     # Relationships
#     # ────────────────────────────────────────────────────────────────

#     owner = relationship(
#         "User",
#         back_populates="documents",
#         foreign_keys=[user_id],
#         lazy="selectin",
#     )

#     company = relationship(
#         "Company",
#         back_populates="documents",
#         lazy="selectin",
#         foreign_keys="company_id",
#     )

#     pages = relationship(
#         "DocumentPage",
#         back_populates="document",
#         cascade="all, delete-orphan",
#         order_by="DocumentPage.page_number",
#     )

#     chunks = relationship(
#         "DocumentChunk",
#         back_populates="document",
#         cascade="all, delete-orphan",
#     )

#     def __repr__(self):
#         return (
#             f"<Document "
#             f"{self.original_filename} "
#             f"status={self.status}>"
#         )

#     @property
#     def is_ready(self) -> bool:
#         return self.status == DocumentStatus.READY

#     @property
#     def file_size_mb(self) -> float:
#         return round(
#             self.file_size / (1024 * 1024),
#             2,
#         )


class Document(BaseModelMixin, Base):
    __tablename__ = "documents"

    # ────────────────────────────────────────────────────────────────
    # Ownership / Multi-tenancy
    # ────────────────────────────────────────────────────────────────

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    company_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "companies.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    # ────────────────────────────────────────────────────────────────
    # File information
    # ────────────────────────────────────────────────────────────────

    filename = Column(
        String(500),
        nullable=False,
    )

    original_filename = Column(
        String(500),
        nullable=False,
    )

    file_path = Column(
        String(1000),
        nullable=False,
    )

    file_size = Column(
        Integer,
        nullable=False,
    )

    mime_type = Column(
        String(100),
        nullable=False,
    )

    page_count = Column(
        Integer,
        nullable=True,
    )

    # ────────────────────────────────────────────────────────────────
    # Processing
    # ────────────────────────────────────────────────────────────────

    status = Column(
        Enum(DocumentStatus),
        default=DocumentStatus.UPLOADED,
        nullable=False,
        index=True,
    )

    processing_error = Column(
        Text,
        nullable=True,
    )

    progress = Column(
        Integer,
        default=0,
        nullable=False,
    )

    # ────────────────────────────────────────────────────────────────
    # AI-generated content
    # ────────────────────────────────────────────────────────────────

    ai_summary = Column(
        Text,
        nullable=True,
    )

    extracted_data = Column(
        JSON,
        nullable=True,
    )

    # ────────────────────────────────────────────────────────────────
    # Relationships - FIXED
    # ────────────────────────────────────────────────────────────────

    owner = relationship(
        "User",
        back_populates="documents",
        foreign_keys=[user_id],  # ✅ Use list with column object
        lazy="selectin",
    )

    company = relationship(
        "Company",
        back_populates="documents",
        foreign_keys=[company_id],  # ✅ Use list with column object
        lazy="selectin",
    )

    pages = relationship(
        "DocumentPage",
        back_populates="document",
        cascade="all, delete-orphan",
        order_by="DocumentPage.page_number",
    )

    chunks = relationship(
        "DocumentChunk",
        back_populates="document",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return (
            f"<Document "
            f"{self.original_filename} "
            f"status={self.status}>"
        )

    @property
    def is_ready(self) -> bool:
        return self.status == DocumentStatus.READY

    @property
    def file_size_mb(self) -> float:
        return round(
            self.file_size / (1024 * 1024),
            2,
        )


# ═════════════════════════════════════════════════════════════════════
# DocumentPage
# ═════════════════════════════════════════════════════════════════════


class DocumentPage(UUIDMixin, TimeStampMixin, Base):
    __tablename__ = "document_pages"

    document_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "documents.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    page_number = Column(
        Integer,
        nullable=False,
    )

    text = Column(
        Text,
        nullable=False,
        default="",
    )

    char_count = Column(
        Integer,
        default=0,
        nullable=False,
    )

    extraction_method = Column(
        Enum(ExtractionMethod),
        default=ExtractionMethod.PYMUPDF,
        nullable=False,
    )

    ocr_confidence = Column(
        Float,
        nullable=True,
    )

    # ────────────────────────────────────────────────────────────────
    # Relationships
    # ────────────────────────────────────────────────────────────────

    document = relationship(
        "Document",
        back_populates="pages",
    )

    chunks = relationship(
        "DocumentChunk",
        back_populates="page",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return (
            f"<DocumentPage "
            f"doc={self.document_id} "
            f"page={self.page_number}>"
        )


# ═════════════════════════════════════════════════════════════════════
# DocumentChunk
# ═════════════════════════════════════════════════════════════════════


class DocumentChunk(UUIDMixin, TimeStampMixin, Base):
    __tablename__ = "document_chunks"

    document_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "documents.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    page_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "document_pages.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    # ────────────────────────────────────────────────────────────────
    # Chunk information
    # ────────────────────────────────────────────────────────────────

    chunk_index = Column(
        Integer,
        nullable=False,
    )

    content = Column(
        Text,
        nullable=False,
    )

    token_count = Column(
        Integer,
        default=0,
        nullable=False,
    )

    # ────────────────────────────────────────────────────────────────
    # pgvector embedding
    # ────────────────────────────────────────────────────────────────

    embedding = Column(
        Vector(settings.EMBEDDING_DIMENSION),
        nullable=True,
        comment=(
            f"{settings.EMBEDDING_DIMENSION}-dim vector "
            f"from {settings.EMBEDDING_MODEL}"
        ),
    )

    # ────────────────────────────────────────────────────────────────
    # Citation metadata
    #
    # Python attribute is `chunk_metadata` because `metadata`
    # is reserved by SQLAlchemy's Declarative API.
    #
    # Database column remains `metadata`.
    # ────────────────────────────────────────────────────────────────

    chunk_metadata = Column(
        "metadata",
        JSON,
        nullable=True,
    )

    page_number = Column(
        Integer,
        nullable=True,
    )

    # ────────────────────────────────────────────────────────────────
    # Relationships
    # ────────────────────────────────────────────────────────────────

    document = relationship(
        "Document",
        back_populates="chunks",
    )

    page = relationship(
        "DocumentPage",
        back_populates="chunks",
    )

    def __repr__(self):
        return (
            f"<DocumentChunk "
            f"doc={self.document_id} "
            f"chunk={self.chunk_index} "
            f"page={self.page_number}>"
        )