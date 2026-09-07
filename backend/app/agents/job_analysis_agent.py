"""
app/agents/job_analysis_agent.py
────────────────────────────────────
Responsibilities (per the architecture doc):
  - Analyze job description text.
  - Extract required skills, preferred skills, experience requirements.
  - Produce structured, weighted job requirements.

The LLM never gets to freelance: the prompt demands JSON matching
JobAnalysisResult exactly, and the response is validated against that
Pydantic model before anything is persisted. If validation fails, the
caller sees a clear ValidationError rather than corrupt data in Postgres.
"""

from pydantic import ValidationError as PydanticValidationError

from app.llm.client import llm_client
from app.schemas.job import JobAnalysisResult
from app.core.exceptions import AppException


class JobAnalysisError(AppException):
    default_message = "Failed to analyze the job description."


SYSTEM_PROMPT = """You are a technical recruiting analyst. Given a job description, \
extract structured requirements. Respond with ONLY a JSON object with exactly these keys:

{
  "job_title": string,
  "required_skills": [string],
  "preferred_skills": [string],
  "minimum_experience_years": integer,
  "education_requirements": [string],
  "responsibilities": [string],
  "skill_weights": {skill_name: float between 0 and 1, weighted by how critical the skill is}
}

Rules:
- Only extract skills/requirements actually present or clearly implied in the text.
- Do not invent skills that are not mentioned.
- skill_weights should only contain keys that also appear in required_skills or preferred_skills.
- Respond with raw JSON only — no markdown, no commentary."""


async def analyze_job_description(job_title: str, description: str) -> JobAnalysisResult:
    user_prompt = f"Job Title: {job_title}\n\nJob Description:\n{description}"

    raw, llm_meta = await llm_client.generate_json(SYSTEM_PROMPT, user_prompt)

    try:
        return JobAnalysisResult.model_validate(raw)
    except PydanticValidationError as exc:
        raise JobAnalysisError(f"LLM returned data that doesn't match the expected schema: {exc}")
