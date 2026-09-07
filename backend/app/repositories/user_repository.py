"""
app/repositories/user_repository.py
──────────────────────────────────────
Repository pattern: keeps raw SQLAlchemy queries out of API route
functions and services. Routes/services call these methods; they
never build `select(...)` statements themselves for User/Role/etc.
"""

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, Role, Permission, Company


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Users ─────────────────────────────────────────────────────

    async def get_by_id(self, user_id: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.id == user_id, User.deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.email == email, User.deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none()

    async def list_by_company(self, company_id: str, page: int, page_size: int):
        q = (
            select(User)
            .where(User.company_id == company_id, User.deleted == False)  # noqa: E712
            .order_by(User.created_at.desc())
        )
        total = (await self.db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
        result = await self.db.execute(q.offset((page - 1) * page_size).limit(page_size))
        return result.scalars().all(), total

    # ── Roles ─────────────────────────────────────────────────────

    async def list_roles(self) -> list[Role]:
        result = await self.db.execute(select(Role).where(Role.deleted == False))  # noqa: E712
        return result.scalars().all()

    async def get_role_by_id(self, role_id: str) -> Role | None:
        result = await self.db.execute(
            select(Role).where(Role.id == role_id, Role.deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none()

    async def get_role_by_code(self, code_name: str) -> Role | None:
        result = await self.db.execute(select(Role).where(Role.code_name == code_name))
        return result.scalar_one_or_none()

    async def create_role(self, name: str, code_name: str, description: str) -> Role:
        role = Role(name=name, code_name=code_name, description=description)
        self.db.add(role)
        await self.db.flush()
        return role

    # ── Permissions ───────────────────────────────────────────────

    async def list_permissions(self) -> list[Permission]:
        result = await self.db.execute(select(Permission).order_by(Permission.module_name))
        return result.scalars().all()

    # ── Companies ─────────────────────────────────────────────────

    async def list_companies(self, page: int, page_size: int):
        q = select(Company).where(Company.deleted == False).order_by(Company.created_at.desc())  # noqa: E712
        total = (await self.db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
        result = await self.db.execute(q.offset((page - 1) * page_size).limit(page_size))
        return result.scalars().all(), total

    async def get_company_by_id(self, company_id: str) -> Company | None:
        result = await self.db.execute(
            select(Company).where(Company.id == company_id, Company.deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none()

    async def get_company_by_slug(self, slug: str) -> Company | None:
        result = await self.db.execute(select(Company).where(Company.slug == slug))
        return result.scalar_one_or_none()

    async def create_company(self, **kwargs) -> Company:
        company = Company(**kwargs)
        self.db.add(company)
        await self.db.flush()
        return company
