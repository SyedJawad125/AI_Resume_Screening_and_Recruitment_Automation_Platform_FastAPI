"""
alembic/env.py
─────────────────
Async-aware Alembic environment. Uses the app's own Settings/Base so
migrations are always generated against the live model metadata —
never hand-maintain a second copy of the schema.
"""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.core.config import settings
from app.db.database import Base

# Import every model module so Base.metadata is fully populated.
from app.models import user  # noqa: F401
from app.models import job  # noqa: F401
from app.models import candidate  # noqa: F401
from app.models import resume  # noqa: F401
from app.models import embedding  # noqa: F401
from app.models import application  # noqa: F401
from app.models import interview  # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    from sqlalchemy import text

    # pgvector's Vector column type requires the extension to exist before
    # SQLAlchemy/Alembic can reflect or create tables that use it.
    connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    connection.commit()

    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
