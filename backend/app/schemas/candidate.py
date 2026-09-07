"""
app/schemas/candidate.py
────────────────────────────
Strict schema for Resume Parser Agent output, plus response schemas
for the candidates API.
"""

from pydantic import BaseModel, Field


class WorkExperienceItem(BaseModel):
    title: str = ""
    company: str = ""
    years: str = ""
    description: str = ""


class EducationItem(BaseModel):
    degree: str = ""
    institution: str = ""
    year: str = ""


class ProjectItem(BaseModel):
    name: str = ""
    description: str = ""
    technologies: list[str] = Field(default_factory=list)


class ResumeParseResult(BaseModel):
    """Exact shape the Resume Parser Agent must return."""

    name: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    summary: str | None = None
    experience_years: int | None = None
    skills: list[str] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    work_experience: list[WorkExperienceItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)


class CandidateOut(BaseModel):
    id: str
    name: str | None
    email: str | None
    experience_years: int | None
    skills: list[str]
