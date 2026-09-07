"""
app/repositories/document_repository.py
───────────────────────────────────────
All DB queries for Document, DocumentPage, DocumentChunk.
"""

from uuid import UUID
from typing import Optional, List, Tuple
from sqlalchemy import select, update, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.document import Document, DocumentPage, DocumentChunk, DocumentStatus


class DocumentRepository:
    """Repository for document-related database operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Document CRUD ────────────────────────────────────────────────

    async def get_by_id(self, document_id: UUID | str, user_id: UUID | str = None) -> Optional[Document]:
        """Get a document by ID with all relationships loaded."""
        q = select(Document).options(
            selectinload(Document.pages),
            selectinload(Document.chunks),
            selectinload(Document.owner),
            selectinload(Document.company)
        ).where(Document.id == str(document_id), Document.deleted == False)
        
        if user_id:
            q = q.where(Document.user_id == str(user_id))
        
        result = await self.db.execute(q)
        return result.scalar_one_or_none()

    async def get_by_user(
        self, 
        user_id: UUID | str,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Document], int]:
        """Get all documents for a specific user with pagination."""
        return await self.list_by_user(user_id, page, page_size)

    async def list_by_user(
        self, 
        user_id: UUID | str,
        page: int = 1,
        page_size: int = 20,
        status: str = None
    ) -> Tuple[List[Document], int]:
        """Get all documents for a specific user with pagination and optional status filter."""
        q = select(Document).where(
            Document.user_id == str(user_id),
            Document.deleted == False
        )
        
        if status:
            q = q.where(Document.status == status)
            
        q = q.order_by(Document.created_at.desc())

        total = (await self.db.execute(
            select(func.count()).select_from(q.subquery())
        )).scalar_one()

        result = await self.db.execute(
            q.offset((page - 1) * page_size).limit(page_size)
        )
        return result.scalars().all(), total

    async def get_by_company(
        self,
        company_id: UUID | str,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Document], int]:
        """Get all documents for a company with pagination."""
        q = select(Document).where(
            Document.company_id == str(company_id),
            Document.deleted == False
        ).order_by(Document.created_at.desc())

        total = (await self.db.execute(
            select(func.count()).select_from(q.subquery())
        )).scalar_one()

        result = await self.db.execute(
            q.offset((page - 1) * page_size).limit(page_size)
        )
        return result.scalars().all(), total

    async def create(self, **kwargs) -> Document:
        """Create a new document."""
        document = Document(**kwargs)
        self.db.add(document)
        await self.db.flush()
        await self.db.refresh(document)
        return document

    async def update(self, document_id: UUID | str, **kwargs) -> None:
        """Update a document."""
        await self.db.execute(
            update(Document)
            .where(Document.id == str(document_id))
            .values(**kwargs)
        )
        await self.db.flush()

    async def update_status(
        self, 
        document_id: UUID | str, 
        status: DocumentStatus,
        progress: int = None,
        error: str = None
    ) -> None:
        """Update document processing status."""
        values = {"status": status}
        if progress is not None:
            values["progress"] = progress
        if error is not None:
            values["processing_error"] = error

        await self.db.execute(
            update(Document)
            .where(Document.id == str(document_id))
            .values(**values)
        )
        await self.db.flush()

    async def delete(self, document_id: UUID | str) -> None:
        """Soft delete a document."""
        await self.db.execute(
            update(Document)
            .where(Document.id == str(document_id))
            .values(deleted=True)
        )
        await self.db.flush()

    async def get_by_status(
        self,
        status: DocumentStatus,
        limit: int = 10
    ) -> List[Document]:
        """Get documents by status (useful for background processing)."""
        result = await self.db.execute(
            select(Document)
            .where(Document.status == status, Document.deleted == False)
            .order_by(Document.created_at.asc())
            .limit(limit)
        )
        return result.scalars().all()

    # ── DocumentPage operations ────────────────────────────────────────

    async def create_page(self, **kwargs) -> DocumentPage:
        """Create a new document page."""
        page = DocumentPage(**kwargs)
        self.db.add(page)
        await self.db.flush()
        return page

    async def get_pages_by_document(
        self, 
        document_id: UUID | str
    ) -> List[DocumentPage]:
        """Get all pages for a document."""
        result = await self.db.execute(
            select(DocumentPage)
            .where(DocumentPage.document_id == str(document_id))
            .order_by(DocumentPage.page_number)
        )
        return result.scalars().all()

    async def delete_pages_by_document(self, document_id: UUID | str) -> None:
        """Delete all pages for a document."""
        await self.db.execute(
            select(DocumentPage)
            .where(DocumentPage.document_id == str(document_id))
        )
        # The cascade delete will handle this, but explicit if needed
        pass

    # ── DocumentChunk operations ───────────────────────────────────────

    async def create_chunk(self, **kwargs) -> DocumentChunk:
        """Create a new document chunk."""
        chunk = DocumentChunk(**kwargs)
        self.db.add(chunk)
        await self.db.flush()
        return chunk

    async def get_chunks_by_document(
        self,
        document_id: UUID | str,
        page: int = 1,
        page_size: int = 100
    ) -> Tuple[List[DocumentChunk], int]:
        """Get chunks for a document with pagination."""
        q = select(DocumentChunk).where(
            DocumentChunk.document_id == str(document_id)
        ).order_by(DocumentChunk.chunk_index)

        total = (await self.db.execute(
            select(func.count()).select_from(q.subquery())
        )).scalar_one()

        result = await self.db.execute(
            q.offset((page - 1) * page_size).limit(page_size)
        )
        return result.scalars().all(), total

    async def get_chunks_by_page(
        self, 
        page_id: UUID | str
    ) -> List[DocumentChunk]:
        """Get all chunks for a specific page."""
        result = await self.db.execute(
            select(DocumentChunk)
            .where(DocumentChunk.page_id == str(page_id))
            .order_by(DocumentChunk.chunk_index)
        )
        return result.scalars().all()

    async def get_chunks(
        self,
        document_id: UUID | str,
    ) -> List[DocumentChunk]:
        """Get all chunks for a document (alias for get_chunks_by_document)."""
        chunks, _ = await self.get_chunks_by_document(document_id, page=1, page_size=10000)
        return chunks

    async def bulk_create_pages(self, pages_data: List[dict]) -> None:
        """Bulk create document pages."""
        from app.models.document import DocumentPage
        for page_data in pages_data:
            page = DocumentPage(**page_data)
            self.db.add(page)
        await self.db.flush()

    async def bulk_create_chunks(self, chunks_data: List[dict]) -> None:
        """Bulk create document chunks."""
        from app.models.document import DocumentChunk
        for chunk_data in chunks_data:
            # Map 'metadata' to 'chunk_metadata' for the Python model
            if 'metadata' in chunk_data and 'chunk_metadata' not in chunk_data:
                chunk_data['chunk_metadata'] = chunk_data.pop('metadata')
            chunk = DocumentChunk(**chunk_data)
            self.db.add(chunk)
        await self.db.flush()

    async def update_fields(self, document_id: UUID | str, **kwargs) -> None:
        """Update specific fields of a document."""
        await self.update(document_id, **kwargs)

    async def delete_chunks_by_document(self, document_id: UUID | str) -> None:
        """Delete all chunks for a document."""
        await self.db.execute(
            select(DocumentChunk)
            .where(DocumentChunk.document_id == str(document_id))
        )
        # Cascade delete will handle this
        pass

    async def search_chunks_by_content(
        self,
        document_id: UUID | str,
        search_text: str,
        limit: int = 10
    ) -> List[DocumentChunk]:
        """Search chunks by content text."""
        result = await self.db.execute(
            select(DocumentChunk)
            .where(
                and_(
                    DocumentChunk.document_id == str(document_id),
                    DocumentChunk.content.ilike(f"%{search_text}%")
                )
            )
            .limit(limit)
        )
        return result.scalars().all()

    # ── Statistics and aggregations ────────────────────────────────────

    async def get_user_document_stats(self, user_id: UUID | str) -> dict:
        """Get document statistics for a user."""
        total_result = await self.db.execute(
            select(func.count(Document.id))
            .where(Document.user_id == str(user_id), Document.deleted == False)
        )
        total = total_result.scalar_one()

        ready_result = await self.db.execute(
            select(func.count(Document.id))
            .where(
                and_(
                    Document.user_id == str(user_id),
                    Document.status == DocumentStatus.READY,
                    Document.deleted == False
                )
            )
        )
        ready = ready_result.scalar_one()

        processing_result = await self.db.execute(
            select(func.count(Document.id))
            .where(
                and_(
                    Document.user_id == str(user_id),
                    Document.status == DocumentStatus.PROCESSING,
                    Document.deleted == False
                )
            )
        )
        processing = processing_result.scalar_one()

        return {
            "total": total,
            "ready": ready,
            "processing": processing,
            "failed": total - ready - processing
        }

    async def get_company_document_stats(self, company_id: UUID | str) -> dict:
        """Get document statistics for a company."""
        total_result = await self.db.execute(
            select(func.count(Document.id))
            .where(Document.company_id == str(company_id), Document.deleted == False)
        )
        total = total_result.scalar_one()

        ready_result = await self.db.execute(
            select(func.count(Document.id))
            .where(
                and_(
                    Document.company_id == str(company_id),
                    Document.status == DocumentStatus.READY,
                    Document.deleted == False
                )
            )
        )
        ready = ready_result.scalar_one()

        return {
            "total": total,
            "ready": ready,
            "processing": 0,  # Could be calculated similarly
            "failed": total - ready
        }
