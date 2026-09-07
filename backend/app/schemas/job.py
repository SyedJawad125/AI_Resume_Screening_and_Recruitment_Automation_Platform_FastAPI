"""
app/schemas/job.py
─────────────────────
Request/response schemas for jobs, plus the strict schema the Job Analysis
Agent's LLM output is validated against. If the LLM returns something that
doesn't fit this shape, Pydantic raises — the caller must handle it as a
failure, never silently accept malformed data.
"""

from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=20)
    location: str | None = None


class JobUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    status: str | None = None


class JobAnalysisResult(BaseModel):
    """The exact shape the Job Analysis Agent must return. Never rely on
    free-form LLM text when structured data is required — this is that
    structured contract."""

    job_title: str
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    minimum_experience_years: int = 0
    education_requirements: list[str] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    skill_weights: dict[str, float] = Field(default_factory=dict)
