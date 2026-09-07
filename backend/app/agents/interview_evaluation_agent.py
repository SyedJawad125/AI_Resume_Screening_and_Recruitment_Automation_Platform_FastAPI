"""
app/agents/interview_evaluation_agent.py
─────────────────────────────────────────────
Responsibilities:
  - Evaluate submitted interview answers against the job's requirements.
  - Score across the fixed rubric: technical_knowledge, problem_solving,
    communication, role_fit, overall.
  - Explain and provide evidence (per-question feedback) — never a bare
    number with no justification.
"""

from pydantic import ValidationError as PydanticValidationError

from app.llm.client import llm_client
from app.schemas.interview import InterviewEvaluationResult
from app.core.exceptions import AppException

SYSTEM_PROMPT = """You are a technical interview evaluator. Given a job's required skills \
and a list of (question, answer) pairs, evaluate the candidate's performance. Score each \
dimension from 0-10. Respond with ONLY this JSON object:

{
  "technical_knowledge": float,
  "problem_solving": float,
  "communication": float,
  "role_fit": float,
  "overall": float,
  "summary": string (2-3 sentences),
  "per_question_feedback": [{"question": string, "evaluation": string, "score": integer 0-10}]
}

Rules:
- Base scores only on what the answer actually demonstrates — do not assume knowledge not shown.
- A vague or evasive answer should score low on that dimension, even if technically not wrong.
- 'overall' should reflect a holistic judgment, not just the average of the other four.
- Respond with raw JSON only — no markdown, no commentary."""


async def evaluate_interview(job_title: str, required_skills: list[str], qa_pairs: list[dict]) -> InterviewEvaluationResult:
    """qa_pairs: [{"question": str, "answer": str}, ...]"""
    user_prompt = (
        f"Job Title: {job_title}\n"
        f"Required Skills: {required_skills}\n\n"
        f"Interview Q&A:\n"
        + "\n".join(f"Q: {qa['question']}\nA: {qa['answer']}" for qa in qa_pairs)
    )

    raw, _ = await llm_client.generate_json(SYSTEM_PROMPT, user_prompt)

    try:
        return InterviewEvaluationResult.model_validate(raw)
    except PydanticValidationError as exc:
        raise AppException(f"LLM returned an evaluation that doesn't match the expected schema: {exc}")
