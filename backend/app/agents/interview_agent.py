"""
app/agents/interview_agent.py
─────────────────────────────────
Responsibilities:
  - Generate interview questions tailored to the job's required/preferred
    skills and the specific candidate's background (so questions probe
    gaps and claims, not generic trivia).
"""

from pydantic import ValidationError as PydanticValidationError

from app.llm.client import llm_client
from app.schemas.interview import QuestionGenerationResult
from app.core.exceptions import AppException

SYSTEM_PROMPT = """You are a senior technical interviewer. Given a job's required skills \
and a candidate's profile, generate interview questions that probe real understanding — \
not textbook trivia. Mix conceptual, practical, and system-design questions relevant to \
the job's actual tech stack. Respond with ONLY this JSON object:

{"questions": [{"question": string, "topic": string}]}

Rules:
- Generate exactly the requested number of questions.
- Base questions on the job's required_skills/preferred_skills and the candidate's stated skills.
- Prefer questions that let a strong candidate demonstrate depth (e.g. "how would you design/debug/optimize X"
  rather than "define X").
- Respond with raw JSON only — no markdown, no commentary."""


async def generate_interview_questions(
    job_title: str,
    required_skills: list[str],
    preferred_skills: list[str],
    candidate_skills: list[str],
    num_questions: int = 5,
) -> QuestionGenerationResult:
    user_prompt = (
        f"Job Title: {job_title}\n"
        f"Required Skills: {required_skills}\n"
        f"Preferred Skills: {preferred_skills}\n"
        f"Candidate's Stated Skills: {candidate_skills}\n"
        f"Number of questions to generate: {num_questions}"
    )

    raw, _ = await llm_client.generate_json(SYSTEM_PROMPT, user_prompt)

    try:
        result = QuestionGenerationResult.model_validate(raw)
    except PydanticValidationError as exc:
        raise AppException(f"LLM returned questions that don't match the expected schema: {exc}")

    result.questions = result.questions[:num_questions]
    return result
