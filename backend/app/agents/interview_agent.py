"""
app/agents/interview_agent.py
─────────────────────────────────
Responsibilities:
  - Generate interview questions tailored to the job's required/preferred
    skills and the specific candidate's background.

LangChain structured-output pattern, same as the other agents.
"""

from app.llm.langchain_client import generate_structured
from app.schemas.interview import QuestionGenerationResult

SYSTEM_PROMPT = """You are a senior technical interviewer. Given a job's required skills \
and a candidate's profile, generate interview questions that probe real understanding — \
not textbook trivia. Mix conceptual, practical, and system-design questions relevant to \
the job's actual tech stack.

Rules:
- Generate exactly the requested number of questions.
- Base questions on the job's required_skills/preferred_skills and the candidate's stated skills.
- Prefer questions that let a strong candidate demonstrate depth (e.g. "how would you design/debug/optimize X"
  rather than "define X")."""


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

    result = await generate_structured(SYSTEM_PROMPT, user_prompt, QuestionGenerationResult)
    result.questions = result.questions[:num_questions]
    return result
