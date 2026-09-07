# import asyncio
# from logging.config import fileConfig

# from sqlalchemy import pool
# from sqlalchemy.engine import Connection
# from sqlalchemy.ext.asyncio import async_engine_from_config

# from alembic import context

# # ── Fix: Base lives in app.db.database ────────────────────────────
# from app.db.database import Base

# # ── Import ALL models so Alembic detects every table ──────────────
# from app.models.user import (
#     Company, Role, Permission, User, Employee, UserToken
# )
# from app.models.document import (
#     Document, DocumentPage, DocumentChunk
# )
# from app.models.associations import role_permissions

# # ──────────────────────────────────────────────────────────────────

# config = context.config

# if config.config_file_name is not None:
#     fileConfig(config.config_file_name)

# # This is what Alembic reads to detect schema changes
# target_metadata = Base.metadata


# def run_migrations_offline() -> None:
#     """Run migrations in 'offline' mode (no DB connection needed)."""
#     url = config.get_main_option("sqlalchemy.url")
#     context.configure(
#         url=url,
#         target_metadata=target_metadata,
#         literal_binds=True,
#         dialect_opts={"paramstyle": "named"},
#     )
#     with context.begin_transaction():
#         context.run_migrations()


# def do_run_migrations(connection: Connection) -> None:
#     context.configure(
#         connection=connection,
#         target_metadata=target_metadata,
#     )
#     with context.begin_transaction():
#         context.run_migrations()


# async def run_async_migrations() -> None:
#     """Run migrations using async engine."""
#     from app.core.config import settings

#     # Override the URL from settings (reads your .env)
#     configuration = config.get_section(config.config_ini_section, {})
#     configuration["sqlalchemy.url"] = settings.SYNC_DATABASE_URL

#     connectable = async_engine_from_config(
#         configuration,
#         prefix="sqlalchemy.",
#         poolclass=pool.NullPool,
#     )

#     async with connectable.connect() as connection:
#         await connection.run_sync(do_run_migrations)

#     await connectable.dispose()


# def run_migrations_online() -> None:
#     """Run migrations in 'online' mode."""
#     asyncio.run(run_async_migrations())


# if context.is_offline_mode():
#     run_migrations_offline()
# else:
#     run_migrations_online()






"""
migrations/env.py
──────────────────
Fully SYNCHRONOUS Alembic env.
No asyncio → no Windows ProactorEventLoop issue.

Alembic migrations do not need async.
The app uses async at runtime; migrations use sync here.
"""

import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# ── Add project root to path ──────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ── Import Base from correct location ─────────────────────────────
from app.db.database import Base

# ── Import ALL models so Alembic detects every table ──────────────
from app.models.user import (
    Company, Role, Permission, User, Employee, UserToken
)
from app.models.document import (
    Document, DocumentPage, DocumentChunk
)
from app.models.associations import role_permissions
# ─────────────────────────────────────────────────────────────────

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_url() -> str:
    """
    Read SYNC_DATABASE_URL from .env via settings.
    Falls back to alembic.ini sqlalchemy.url if settings fail.
    """
    try:
        from app.core.config import settings
        url = settings.SYNC_DATABASE_URL
        # Replace asyncpg/psycopg with psycopg2 for sync Alembic
        url = url.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
        url = url.replace("postgresql+psycopg://",  "postgresql+psycopg2://")
        return url
    except Exception:
        return config.get_main_option("sqlalchemy.url")


def run_migrations_offline() -> None:
    """Offline mode — generate SQL script without DB connection."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Online mode — connect to DB and run migrations synchronously.
    Uses psycopg2 (sync driver) — no asyncio required.
    """
    url = get_url()

    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = url

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()