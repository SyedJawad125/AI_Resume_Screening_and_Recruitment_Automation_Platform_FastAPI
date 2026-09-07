"""
app/agents/resume_parser_agent.py
─────────────────────────────────────
Responsibilities:
  - Parse cleaned resume text into a structured candidate profile.
  - Validate extracted fields against ResumeParseResult before use.

Same discipline as the Job Analysis Agent: strict JSON contract, validated
with Pydantic, never trusted blindly.
"""

from pydantic import ValidationError as PydanticValidationError

from app.llm.client import llm_client
from app.schemas.candidate import ResumeParseResult
from app.core.exceptions import AppException

# Resumes can be long; truncate to keep prompts within reasonable token/cost
# bounds. 12k characters covers the vast majority of real resumes.
MAX_RESUME_CHARS = 12_000

SYSTEM_PROMPT = """You are a resume parsing engine. Given raw resume text, extract a \
structured candidate profile. Respond with ONLY a JSON object with exactly these keys:

{
  "name": string or null,
  "email": string or null,
  "phone": string or null,
  "location": string or null,
  "summary": string or null (2-3 sentence professional summary),
  "experience_years": integer or null (total years of professional experience),
  "skills": [string],
  "education": [{"degree": string, "institution": string, "year": string}],
  "work_experience": [{"title": string, "company": string, "years": string, "description": string}],
  "projects": [{"name": string, "description": string, "technologies": [string]}],
  "certifications": [string],
  "languages": [string]
}

Rules:
- Only extract information explicitly present in the text. Never invent employers, dates, or skills.
- If a field cannot be determined, use null (or an empty list for list fields).
- Respond with raw JSON only — no markdown, no commentary."""


async def parse_resume(resume_text: str) -> ResumeParseResult:
    truncated = resume_text[:MAX_RESUME_CHARS]
    raw, llm_meta = await llm_client.generate_json(SYSTEM_PROMPT, truncated)

    try:
        return ResumeParseResult.model_validate(raw)
    except PydanticValidationError as exc:
        raise AppException(f"LLM returned a candidate profile that doesn't match the expected schema: {exc}")
