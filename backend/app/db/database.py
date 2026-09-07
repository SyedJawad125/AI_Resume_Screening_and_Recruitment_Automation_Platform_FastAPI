# """
# app/db/database.py
# ───────────────────
# Async SQLAlchemy engine and session setup.

# Why async?
#   - FastAPI is async-first
#   - asyncpg is the fastest PostgreSQL driver for Python
#   - Async DB calls don't block the event loop — better throughput

# Session lifecycle:
#   - One session per HTTP request
#   - Auto-committed on success, auto-rolled-back on exception
#   - Injected into routes via FastAPI Depends()
# """

# from collections.abc import AsyncGenerator

# from sqlalchemy.ext.asyncio import (
#     AsyncSession,
#     async_sessionmaker,
#     create_async_engine,
# )
# from sqlalchemy.orm import DeclarativeBase

# from app.core.config import settings


# # ─────────────────────────────────────────────────────────────────
# #  Engine
# # ─────────────────────────────────────────────────────────────────

# engine = create_async_engine(
#     settings.DATABASE_URL,
#     echo=settings.DEBUG,           # logs all SQL in dev mode
#     pool_size=10,
#     max_overflow=20,
#     pool_pre_ping=True,            # reconnect on stale connections
# )


# # ─────────────────────────────────────────────────────────────────
# #  Session Factory
# # ─────────────────────────────────────────────────────────────────

# AsyncSessionLocal = async_sessionmaker(
#     bind=engine,
#     class_=AsyncSession,
#     expire_on_commit=False,       # don't expire objects after commit
#     autocommit=False,
#     autoflush=False,
# )


# # ─────────────────────────────────────────────────────────────────
# #  Base Model
# # ─────────────────────────────────────────────────────────────────

# class Base(DeclarativeBase):
#     """All SQLAlchemy models inherit from this."""
#     pass


# # ─────────────────────────────────────────────────────────────────
# #  Dependency — inject DB session into routes
# # ─────────────────────────────────────────────────────────────────

# async def get_db() -> AsyncGenerator[AsyncSession, None]:
#     """
#     FastAPI dependency that provides a database session.
#     Usage in routes:
#         async def my_route(db: AsyncSession = Depends(get_db)):
#     """
#     async with AsyncSessionLocal() as session:
#         try:
#             yield session
#             await session.commit()
#         except Exception:
#             await session.rollback()
#             raise
#         finally:
#             await session.close()



"""
app/db/database.py
───────────────────
Async SQLAlchemy engine, session factory, Base model class.

Base is defined HERE — import it from here everywhere:
    from app.db.database import Base, get_db
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


# ── Engine ────────────────────────────────────────────────────────
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

# ── Session Factory ───────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ── Base ─────────────────────────────────────────────────────────
# ALL models inherit from this.
# Alembic imports this to detect table changes.
class Base(DeclarativeBase):
    pass


# ── Dependency ────────────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Inject DB session into FastAPI routes.
    Usage: db: AsyncSession = Depends(get_db)
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()