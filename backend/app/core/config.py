"""
app/core/config.py
───────────────────
Centralized configuration. Everything comes from environment variables
(.env locally, real env vars in production). Never hardcode secrets here.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "HireMind AI"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str

    # Redis / Celery
    REDIS_URL: str = "redis://redis:6379/0"

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS — comma-separated origins in .env, parsed to a list here
    CORS_ORIGINS: str = "http://localhost:3000"

    # LLM provider (configurable — never hard-code which provider is used)
    LLM_PROVIDER: str = "GROQ"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    LLM_TIMEOUT_SECONDS: int = 60
    LLM_MAX_RETRIES: int = 3

    # Embeddings
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_DIM: int = 384

    # OCR (abstracted — swappable provider)
    OCR_PROVIDER: str = "TESSERACT"
    OCR_API_KEY: str = ""

    # File uploads
    MAX_RESUME_FILE_SIZE_MB: int = 10
    ALLOWED_RESUME_EXTENSIONS: str = ".pdf,.docx"
    UPLOAD_DIR: str = "/app/uploads"

    # Scoring weights (must sum to 1.0 — validated at import time in matching engine)
    SCORE_WEIGHT_REQUIRED_SKILLS: float = 0.35
    SCORE_WEIGHT_EXPERIENCE: float = 0.20
    SCORE_WEIGHT_SEMANTIC: float = 0.20
    SCORE_WEIGHT_PROJECTS: float = 0.15
    SCORE_WEIGHT_PREFERRED_SKILLS: float = 0.10

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def allowed_resume_extensions_list(self) -> list[str]:
        return [e.strip().lower() for e in self.ALLOWED_RESUME_EXTENSIONS.split(",") if e.strip()]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
