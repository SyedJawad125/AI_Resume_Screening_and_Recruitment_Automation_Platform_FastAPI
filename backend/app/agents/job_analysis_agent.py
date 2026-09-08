"""
app/agents/job_analysis_agent.py
────────────────────────────────────
Responsibilities (per the architecture doc):
  - Analyze job description text.
  - Extract required skills, preferred skills, experience requirements.
  - Produce structured, weighted job requirements.

Built on LangChain: `generate_structured()` forces the model's output into
`JobAnalysisResult` via native tool-calling (langchain_groq's
`with_structured_output`), so there's no hand-rolled JSON parsing here —
if the model can't satisfy the schema, LangChain/Pydantic raise, and
`generate_structured` turns that into a clean `LLMError` after retries.
"""

from app.llm.langchain_client import generate_structured
from app.schemas.job import JobAnalysisResult

SYSTEM_PROMPT = """You are a technical recruiting analyst. Given a job description, \
extract structured requirements into the provided schema.

Rules:
- Only extract skills/requirements actually present or clearly implied in the text.
- Do not invent skills that are not mentioned.
- skill_weights should only contain keys that also appear in required_skills or preferred_skills,
  weighted 0.0-1.0 by how critical the skill is to the role."""


async def analyze_job_description(job_title: str, description: str) -> JobAnalysisResult:
    user_prompt = f"Job Title: {job_title}\n\nJob Description:\n{description}"
    return await generate_structured(SYSTEM_PROMPT, user_prompt, JobAnalysisResult)
