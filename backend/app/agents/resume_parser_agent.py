"""
app/agents/resume_parser_agent.py
─────────────────────────────────────
Responsibilities:
  - Parse cleaned resume text into a structured candidate profile.
  - Never invent employers, dates, or skills not present in the source text.

Same LangChain pattern as the Job Analysis Agent: the model is forced
into `ResumeParseResult`'s schema via tool-calling, not free text.
"""

from app.llm.langchain_client import generate_structured
from app.schemas.candidate import ResumeParseResult

# Resumes can be long; truncate to keep prompts within reasonable token/cost
# bounds. 12k characters covers the vast majority of real resumes.
MAX_RESUME_CHARS = 12_000

SYSTEM_PROMPT = """You are a resume parsing engine. Given raw resume text, extract a \
structured candidate profile into the provided schema.

Rules:
- Only extract information explicitly present in the text. Never invent employers, dates, or skills.
- If a field cannot be determined, leave it null (or an empty list for list fields)."""


async def parse_resume(resume_text: str) -> ResumeParseResult:
    truncated = resume_text[:MAX_RESUME_CHARS]
    return await generate_structured(SYSTEM_PROMPT, truncated, ResumeParseResult)
