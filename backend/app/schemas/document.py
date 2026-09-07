"""
app/schemas/document.py
────────────────────────
Pydantic schemas for all document-related endpoints.
"""

import uuid
from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, field_validator


# ─────────────────────────────────────────────────────────────────
#  Document Upload / Response
# ─────────────────────────────────────────────────────────────────

class DocumentUploadResponse(BaseModel):
    document_id:   str
    filename:      str
    file_size_mb:  float
    status:        str
    message:       str = 'Document uploaded successfully. Processing has started.'


class DocumentStatusResponse(BaseModel):
    document_id: str
    filename:    str
    status:      str
    progress:    int          # 0-100
    page_count:  Optional[int] = None
    error:       Optional[str] = None


class DocumentListItem(BaseModel):
    id:           str
    filename:     str
    file_size_mb: float
    status:       str
    page_count:   Optional[int]
    created_at:   datetime

    class Config:
        from_attributes = True


class DocumentDetail(BaseModel):
    id:              str
    filename:        str
    file_size_mb:    float
    mime_type:       str
    status:          str
    page_count:      Optional[int]
    ai_summary:      Optional[str]
    extracted_data:  Optional[dict]
    created_at:      datetime
    updated_at:      datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────
#  Search schemas
# ─────────────────────────────────────────────────────────────────

class SearchRequest(BaseModel):
    query:       str
    document_id: str
    top_k:       int = 5

    @field_validator('top_k')
    @classmethod
    def valid_top_k(cls, v):
        if v < 1 or v > 20:
            raise ValueError('top_k must be between 1 and 20.')
        return v


class SearchResult(BaseModel):
    chunk_id:    str
    content:     str
    document_id: str
    page_number: Optional[int]
    similarity:  float


class SearchResponse(BaseModel):
    query:   str
    results: list[SearchResult]
    count:   int


# ─────────────────────────────────────────────────────────────────
#  Chat / RAG schemas
# ─────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    document_id: str
    question:    str


class Citation(BaseModel):
    chunk_id:    str
    document_id: str
    filename:    str
    page_number: Optional[int]


class ChatResponse(BaseModel):
    question:  str
    answer:    str
    citations: list[Citation]
    model:     str


# ─────────────────────────────────────────────────────────────────
#  Extraction schemas
# ─────────────────────────────────────────────────────────────────

class ExtractionRequest(BaseModel):
    fields: list[str]

    @field_validator('fields')
    @classmethod
    def at_least_one_field(cls, v):
        if not v:
            raise ValueError('At least one field is required.')
        if len(v) > 20:
            raise ValueError('Maximum 20 fields per extraction request.')
        return v


class FieldResult(BaseModel):
    value:  Optional[Any]
    status: str    # found | not_found | uncertain


class ExtractionResponse(BaseModel):
    document_id: str
    fields:      dict[str, FieldResult]
    model:       str


# ─────────────────────────────────────────────────────────────────
#  Summary schema
# ─────────────────────────────────────────────────────────────────

class SummaryResponse(BaseModel):
    document_id:       str
    filename:          str
    executive_summary: str
    key_points:        list[str]
    important_facts:   list[str]
    important_numbers: list[str]
    risks:             list[str]
    conclusion:        str
    model:             str