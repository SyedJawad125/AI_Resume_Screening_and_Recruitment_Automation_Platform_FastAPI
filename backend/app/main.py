# """
# app/main.py
# ────────────
# FastAPI application entry point.
# CORRECT file: app/main.py  (NOT the root main.py)
# """

# import logging
# import os
# from contextlib import asynccontextmanager

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from app.core.config import settings
# from app.core.exceptions import register_exception_handlers
# from app.core.logging import setup_logging

# # ── Import all routers ────────────────────────────────────────────
# from app.api.v1 import auth
# from app.api.v1 import documents
# from app.api.v1 import search
# from app.api.v1 import chat
# from app.api.v1 import extraction
# from app.api.v1 import reports
# from app.api.v1 import users    # ← users.py handles: users, roles, permissions, companies


# # ─────────────────────────────────────────────────────────────────
# #  Startup / Shutdown
# # ─────────────────────────────────────────────────────────────────

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # ── Startup ───────────────────────────────────────────────────
#     setup_logging()
#     logger = logging.getLogger('app')
#     logger.info(f'Starting {settings.APP_NAME} [{settings.ENVIRONMENT}]')

#     # Create required directories
#     os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
#     os.makedirs(settings.REPORT_DIR, exist_ok=True)
#     logger.info(f'Upload dir: {settings.UPLOAD_DIR} | Report dir: {settings.REPORT_DIR}')

#     yield

#     # ── Shutdown ──────────────────────────────────────────────────
#     from app.db.database import engine
#     await engine.dispose()
#     logger.info('Database connections closed.')


# # ─────────────────────────────────────────────────────────────────
# #  FastAPI App
# # ─────────────────────────────────────────────────────────────────

# app = FastAPI(
#     title       = settings.APP_NAME,
#     description = 'AI Document Processing & RAG System — FastAPI + pgvector + LangGraph + Groq',
#     version     = '1.0.0',
#     docs_url    = '/api/docs',
#     redoc_url   = '/api/redoc',
#     openapi_url = '/api/openapi.json',
#     lifespan    = lifespan,
# )


# # ─────────────────────────────────────────────────────────────────
# #  Middleware
# # ─────────────────────────────────────────────────────────────────

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins     = settings.allowed_origins,
#     allow_credentials = True,
#     allow_methods     = ['*'],
#     allow_headers     = ['*'],
# )


# # ─────────────────────────────────────────────────────────────────
# #  Exception Handlers
# # ─────────────────────────────────────────────────────────────────

# register_exception_handlers(app)


# # ─────────────────────────────────────────────────────────────────
# #  Routers — all under /api/v1/
# # ─────────────────────────────────────────────────────────────────

# PREFIX = '/api/v1'

# app.include_router(auth.router,       prefix=f'{PREFIX}/auth',       tags=['Authentication'])
# app.include_router(users.router,      prefix=f'{PREFIX}/users',      tags=['Users & Roles & Companies'])
# app.include_router(documents.router,  prefix=f'{PREFIX}/documents',  tags=['Documents'])
# app.include_router(search.router,     prefix=f'{PREFIX}/search',     tags=['Search'])
# app.include_router(chat.router,       prefix=f'{PREFIX}/chat',       tags=['Chat / RAG'])
# app.include_router(extraction.router, prefix=f'{PREFIX}/extraction', tags=['Extraction'])
# app.include_router(reports.router,    prefix=f'{PREFIX}/reports',    tags=['Reports'])


# # ─────────────────────────────────────────────────────────────────
# #  Health Check
# # ─────────────────────────────────────────────────────────────────

# @app.get('/health', tags=['Health'])
# async def health_check():
#     return {
#         'status':  'healthy',
#         'app':     settings.APP_NAME,
#         'version': '1.0.0',
#         'env':     settings.ENVIRONMENT,
#     }





"""
app/main.py
────────────────────────────────────────────────────────────
FastAPI application entry point.
CORRECT file: app/main.py (NOT the root main.py)
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging

# ── Import routers ────────────────────────────────────────────────
# users.py contains:
#   - Users
#   - Roles
#   - Permissions
#   - Companies
from app.api.v1 import auth
from app.api.v1 import user
from app.api.v1 import documents
from app.api.v1 import search
from app.api.v1 import chat
from app.api.v1 import extraction
from app.api.v1 import reports


# ────────────────────────────────────────────────────────────────
# Startup / Shutdown
# ────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────
    setup_logging()

    logger = logging.getLogger("app")
    logger.info(
        f"Starting {settings.APP_NAME} [{settings.ENVIRONMENT}]"
    )

    # Create required directories
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.REPORT_DIR, exist_ok=True)

    logger.info(
        f"Upload dir: {settings.UPLOAD_DIR} | "
        f"Report dir: {settings.REPORT_DIR}"
    )

    yield

    # ── Shutdown ─────────────────────────────────────────────────
    from app.db.database import engine

    await engine.dispose()

    logger.info("Database connections closed.")


# ────────────────────────────────────────────────────────────────
# FastAPI Application
# ────────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "AI Document Processing & RAG System — "
        "FastAPI + PostgreSQL + pgvector + LangGraph + Groq"
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)


# ────────────────────────────────────────────────────────────────
# CORS Middleware
# ────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ────────────────────────────────────────────────────────────────
# Exception Handlers
# ────────────────────────────────────────────────────────────────

register_exception_handlers(app)


# ────────────────────────────────────────────────────────────────
# API Routers
# ────────────────────────────────────────────────────────────────

PREFIX = "/api/v1"

# Authentication
app.include_router(
    auth.router,
    prefix=f"{PREFIX}/auth",
    tags=["Authentication"],
)

# Users + Roles + Permissions + Companies
app.include_router(
    user.router,
    prefix=f"{PREFIX}/users",
    tags=["Users & Roles & Permissions & Companies"],
)

# Documents
app.include_router(
    documents.router,
    prefix=f"{PREFIX}/documents",
    tags=["Documents"],
)

# Search
app.include_router(
    search.router,
    prefix=f"{PREFIX}/search",
    tags=["Search"],
)

# Chat / RAG
app.include_router(
    chat.router,
    prefix=f"{PREFIX}/chat",
    tags=["Chat / RAG"],
)

# Extraction
app.include_router(
    extraction.router,
    prefix=f"{PREFIX}/extraction",
    tags=["Extraction"],
)

# Reports
app.include_router(
    reports.router,
    prefix=f"{PREFIX}/reports",
    tags=["Reports"],
)


# ────────────────────────────────────────────────────────────────
# Health Check
# ────────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "env": settings.ENVIRONMENT,
    }