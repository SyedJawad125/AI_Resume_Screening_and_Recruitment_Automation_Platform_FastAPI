"""
app/agents/interview_evaluation_agent.py
─────────────────────────────────────────────
Responsibilities:
  - Evaluate submitted interview answers against the job's requirements.
  - Score across the fixed rubric: technical_knowledge, problem_solving,
    communication, role_fit, overall — with per-question feedback.

LangChain structured-output pattern, same as the other agents.
"""

from app.llm.langchain_client import generate_structured
from app.schemas.interview import InterviewEvaluationResult

SYSTEM_PROMPT = """You are a technical interview evaluator. Given a job's required skills \
and a list of (question, answer) pairs, evaluate the candidate's performance into the \
provided schema. Score each dimension from 0-10.

Rules:
- Base scores only on what the answer actually demonstrates — do not assume knowledge not shown.
- A vague or evasive answer should score low on that dimension, even if technically not wrong.
- 'overall' should reflect a holistic judgment, not just the average of the other four."""


async def evaluate_interview(job_title: str, required_skills: list[str], qa_pairs: list[dict]) -> InterviewEvaluationResult:
    """qa_pairs: [{"question": str, "answer": str}, ...]"""
    user_prompt = (
        f"Job Title: {job_title}\n"
        f"Required Skills: {required_skills}\n\n"
        f"Interview Q&A:\n"
        + "\n".join(f"Q: {qa['question']}\nA: {qa['answer']}" for qa in qa_pairs)
    )
    return await generate_structured(SYSTEM_PROMPT, user_prompt, InterviewEvaluationResult)
