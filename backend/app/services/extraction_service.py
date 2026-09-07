"""
app/services/extraction_service.py
────────────────────────────────────
Structured JSON data extraction from documents.

Example:
  Input:  fields = ['company_name', 'revenue', 'employees']
  Output: {'company_name': {'value': 'Acme Corp', 'status': 'found'},
           'revenue':      {'value': '$14.2M',    'status': 'found'},
           'employees':    {'value': None,         'status': 'not_found'}}

Why this matters:
  - Automated data extraction from contracts, reports, invoices
  - Structured output validated by Pydantic
  - LLM explicitly told NOT to invent values
  - Status field shows confidence: found / not_found / uncertain
"""

import logging
from dataclasses import dataclass
from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.document_repository import DocumentRepository
from app.services.vector_search_service import vector_search_service
from app.services.llm_service import llm_service
from app.core.exceptions import NotFoundError, ValidationError

logger = logging.getLogger(__name__)


@dataclass
class FieldResult:
    value:  Optional[Any]
    status: str   # found | not_found | uncertain


@dataclass
class ExtractionResult:
    document_id: str
    filename:    str
    fields:      dict[str, FieldResult]
    model:       str


class ExtractionService:

    async def extract(
        self,
        document_id: str,
        fields:      list[str],
        db:          AsyncSession,
    ) -> ExtractionResult:
        """
        Extract specific fields from a document using RAG + LLM.

        Strategy:
          1. For each field, find relevant chunks via vector search
          2. Build context from relevant chunks
          3. Ask LLM to extract all fields from context
          4. Validate and return results
        """
        doc_repo = DocumentRepository(db)
        document = await doc_repo.get_by_id(document_id)

        if not document:
            raise NotFoundError('Document')
        if not document.is_ready:
            raise ValidationError(f'Document not ready. Status: {document.status}')

        # Build a combined query from all field names
        # This retrieves chunks most relevant to ALL requested fields
        combined_query = ', '.join(fields)

        results = await vector_search_service.search(
            query       = combined_query,
            document_id = document_id,
            db          = db,
            top_k       = 10,   # more context for extraction
            min_similarity = 0.2,  # lower threshold — cast a wider net
        )

        if not results:
            # Return all fields as not_found
            return ExtractionResult(
                document_id = document_id,
                filename    = document.original_filename,
                fields      = {f: FieldResult(value=None, status='not_found') for f in fields},
                model       = llm_service.model,
            )

        context = vector_search_service.build_context(results, max_chars=8000)

        # Ask LLM to extract all fields
        raw = await llm_service.extract_fields(
            fields   = fields,
            context  = context,
            filename = document.original_filename,
        )

        # Parse and validate LLM output
        field_results = {}
        for field in fields:
            raw_field = raw.get(field, {})
            if isinstance(raw_field, dict):
                status = raw_field.get('status', 'not_found')
                value  = raw_field.get('value')
            else:
                # LLM returned just a value (not dict format)
                value  = raw_field if raw_field else None
                status = 'found' if value else 'not_found'

            # Normalize status
            if status not in ('found', 'not_found', 'uncertain'):
                status = 'uncertain'

            field_results[field] = FieldResult(value=value, status=status)

        logger.info(
            f'[Extraction] {document.original_filename}: {len(fields)} fields, '
            f'{sum(1 for r in field_results.values() if r.status == "found")} found'
        )

        return ExtractionResult(
            document_id = document_id,
            filename    = document.original_filename,
            fields      = field_results,
            model       = llm_service.model,
        )


extraction_service = ExtractionService()