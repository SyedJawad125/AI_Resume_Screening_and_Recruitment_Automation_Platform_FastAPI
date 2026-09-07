# # init_db.py
# from app.database import Base, engine
# from app import models # ensure all models are imported
# # from app.models.rank import Rank
# # Create all tables
# Base.metadata.create_all(bind=engine)
# print("✅ Database tables created successfully.")




"""
init_db.py
───────────
Creates pgvector HNSW index after alembic upgrade head.
Fixed: uses app.db.database (not app.database)
"""
import asyncio
import sys

# Windows fix
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


async def init_db():
    print('🔧 Initialising database...')

    from app.db.database import engine     # ✅ correct path
    from sqlalchemy import text

    async with engine.begin() as conn:
        # Enable extensions
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS vector;'))
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))

        # Create HNSW index for fast vector search
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw
            ON document_chunks
            USING hnsw (embedding vector_cosine_ops)
            WITH (m = 16, ef_construction = 64);
        """))
        print('✅ pgvector HNSW index created!')

    await engine.dispose()
    print('✅ Database initialisation complete!')
    print('\n   Next: python add_permissions.py')


if __name__ == '__main__':
    asyncio.run(init_db())