"""
app/repositories/user_repository.py
─────────────────────────────────────
All DB queries for User, Role, Permission, Employee, Company.
"""

from uuid import UUID
from typing import Optional

from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import User, Role, Permission, Employee, Company


class UserRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── User ───────────────────────────────────────────────────────

    async def get_by_id(self, user_id: UUID | str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.id == str(user_id), User.deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.email == email, User.deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.username == username, User.deleted == False)
        )
        return result.scalar_one_or_none()

    async def create(self, **kwargs) -> User:
        user = User(**kwargs)
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def update(self, user_id: UUID | str, **kwargs) -> None:
        await self.db.execute(
            update(User).where(User.id == str(user_id)).values(**kwargs)
        )
        await self.db.flush()

    async def list_by_company(
        self,
        company_id: UUID | str,
        page:      int = 1,
        page_size: int = 20,
    ) -> tuple[list[User], int]:
        q = select(User).where(
            User.company_id == str(company_id),
            User.deleted == False,
        ).order_by(User.created_at.desc())

        total  = (await self.db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
        result = await self.db.execute(q.offset((page - 1) * page_size).limit(page_size))
        return result.scalars().all(), total

    # ── Role ───────────────────────────────────────────────────────

    async def get_role_by_id(self, role_id: UUID | str) -> Optional[Role]:
        result = await self.db.execute(
            select(Role)
            .options(selectinload(Role.permissions))
            .where(Role.id == str(role_id), Role.deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_role_by_code(self, code_name: str) -> Optional[Role]:
        result = await self.db.execute(
            select(Role).where(Role.code_name == code_name, Role.deleted == False)
        )
        return result.scalar_one_or_none()

    async def list_roles(self) -> list[Role]:
        result = await self.db.execute(
            select(Role).where(Role.deleted == False).order_by(Role.name)
        )
        return result.scalars().all()

    async def create_role(self, **kwargs) -> Role:
        role = Role(**kwargs)
        self.db.add(role)
        await self.db.flush()
        return role

    # ── Permission ─────────────────────────────────────────────────

    async def list_permissions(self, module: str = None) -> list[Permission]:
        q = select(Permission).order_by(Permission.module_name, Permission.name)
        if module:
            q = q.where(Permission.module_name == module)
        result = await self.db.execute(q)
        return result.scalars().all()

    async def get_permission_by_code(self, code_name: str) -> Optional[Permission]:
        result = await self.db.execute(
            select(Permission).where(Permission.code_name == code_name)
        )
        return result.scalar_one_or_none()

    # ── Employee ───────────────────────────────────────────────────

    async def get_employee_by_user(self, user_id: UUID | str) -> Optional[Employee]:
        result = await self.db.execute(
            select(Employee).where(Employee.user_id == str(user_id), Employee.deleted == False)
        )
        return result.scalar_one_or_none()

    async def create_employee(self, **kwargs) -> Employee:
        emp = Employee(**kwargs)
        self.db.add(emp)
        await self.db.flush()
        return emp

    # ── Company ────────────────────────────────────────────────────

    async def get_company_by_id(self, company_id: UUID | str) -> Optional[Company]:
        result = await self.db.execute(
            select(Company).where(Company.id == str(company_id), Company.deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_company_by_slug(self, slug: str) -> Optional[Company]:
        result = await self.db.execute(
            select(Company).where(Company.slug == slug, Company.deleted == False)
        )
        return result.scalar_one_or_none()

    async def create_company(self, **kwargs) -> Company:
        company = Company(**kwargs)
        self.db.add(company)
        await self.db.flush()
        return company

    async def list_companies(self, page: int = 1, page_size: int = 20) -> tuple[list[Company], int]:
        q      = select(Company).where(Company.deleted == False).order_by(Company.name)
        total  = (await self.db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
        result = await self.db.execute(q.offset((page - 1) * page_size).limit(page_size))
        return result.scalars().all(), total


class ChunkRepository:
    """pgvector similarity search queries."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def similarity_search(
        self,
        query_embedding: list[float],
        document_id:     str,
        top_k:           int = 5,
    ) -> list[tuple]:
        """
        Cosine similarity search using pgvector <=> operator.
        Returns list of (chunk, similarity_score) tuples.

        Why cosine similarity?
          - Measures angle between vectors, not magnitude
          - Better for semantic similarity than Euclidean distance
          - Standard for sentence embedding comparison
        """
        from sqlalchemy import text
        from pgvector.sqlalchemy import Vector

        sql = text("""
            SELECT
                id,
                content,
                page_number,
                chunk_index,
                document_id,
                1 - (embedding <=> CAST(:embedding AS vector)) AS similarity
            FROM document_chunks
            WHERE document_id = :document_id
              AND embedding IS NOT NULL
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT :top_k
        """)

        result = await self.db.execute(sql, {
            'embedding':   str(query_embedding),
            'document_id': document_id,
            'top_k':       top_k,
        })
        return result.fetchall()

    async def get_chunk_by_id(self, chunk_id: str):
        from app.models.document import DocumentChunk
        result = await self.db.execute(
            select(DocumentChunk).where(DocumentChunk.id == chunk_id)
        )
        return result.scalar_one_or_none()