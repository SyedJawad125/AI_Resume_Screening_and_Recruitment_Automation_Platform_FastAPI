"""
app/main.py
─────────────
FastAPI application factory. This is the ONLY file that wires
everything together — routers, middleware, exception handlers.
Business logic never lives here.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import AppException, app_exception_handler, unhandled_exception_handler
from app.api.v1 import auth, users, health, jobs, candidates, search, processing, interviews


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description="AI-Powered Resume Screening & Recruitment Automation Platform — API",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)

    # health check is unprefixed-ish but still lives under /api/v1 for consistency
    app.include_router(health.router, prefix=settings.API_V1_PREFIX, tags=["Health"])
    app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Auth"])
    app.include_router(users.router, prefix=f"{settings.API_V1_PREFIX}/users", tags=["Users"])
    app.include_router(jobs.router, prefix=f"{settings.API_V1_PREFIX}/jobs", tags=["Jobs"])
    app.include_router(candidates.router, prefix=f"{settings.API_V1_PREFIX}/candidates", tags=["Candidates"])
    app.include_router(search.router, prefix=f"{settings.API_V1_PREFIX}/search", tags=["Search"])
    app.include_router(processing.router, prefix=f"{settings.API_V1_PREFIX}/processing", tags=["Processing"])
    app.include_router(interviews.router, prefix=f"{settings.API_V1_PREFIX}/interviews", tags=["Interviews"])

    return app


app = create_app()
