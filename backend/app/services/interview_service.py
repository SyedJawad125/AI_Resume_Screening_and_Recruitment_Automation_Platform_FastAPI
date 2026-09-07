"""
app/services/interview_service.py
──────────────────────────────────────
Business logic for the interview pipeline:

    Candidate shortlisted → create Interview → Interview Agent generates
    questions → candidate answers → Evaluation Agent scores → EvaluationResult
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.agents.interview_agent import generate_interview_questions
from app.agents.interview_evaluation_agent import evaluate_interview
from app.core.exceptions import NotFoundError, ValidationError
from app.models.candidate import Candidate
from app.models.interview import (
    Interview, InterviewQuestion, InterviewAnswer, EvaluationResult, InterviewStatus,
)
from app.models.job import Job


async def create_interview(db: AsyncSession, job_id: str, candidate_id: str, num_questions: int) -> Interview:
    job = (
        await db.execute(select(Job).options(selectinload(Job.requirement)).where(Job.id == job_id))
    ).scalar_one_or_none()
    if not job or not job.requirement:
        raise NotFoundError("Job (or its analyzed requirements)")

    candidate = (await db.execute(select(Candidate).where(Candidate.id == candidate_id))).scalar_one_or_none()
    if not candidate:
        raise NotFoundError("Candidate")

    interview = Interview(job_id=job_id, candidate_id=candidate_id, status=InterviewStatus.CREATED)
    db.add(interview)
    await db.flush()

    generated = await generate_interview_questions(
        job_title=job.title,
        required_skills=job.requirement.required_skills,
        preferred_skills=job.requirement.preferred_skills,
        candidate_skills=candidate.skills,
        num_questions=num_questions,
    )

    for order, q in enumerate(generated.questions):
        db.add(InterviewQuestion(interview_id=interview.id, order=order, question_text=q.question, topic=q.topic))

    interview.status = InterviewStatus.QUESTIONS_GENERATED
    await db.commit()
    await db.refresh(interview)
    return interview


async def get_interview_with_questions(db: AsyncSession, interview_id: str) -> Interview:
    interview = (
        await db.execute(
            select(Interview).options(selectinload(Interview.questions)).where(Interview.id == interview_id)
        )
    ).scalar_one_or_none()
    if not interview:
        raise NotFoundError("Interview")
    return interview


async def submit_answers(db: AsyncSession, interview_id: str, answers: dict[str, str]) -> Interview:
    interview = await get_interview_with_questions(db, interview_id)

    question_ids = {str(q.id) for q in interview.questions}
    unknown_ids = set(answers.keys()) - question_ids
    if unknown_ids:
        raise ValidationError(f"Unknown question_id(s) for this interview: {unknown_ids}")

    for question in interview.questions:
        answer_text = answers.get(str(question.id))
        if answer_text is None:
            continue
        db.add(InterviewAnswer(question_id=question.id, answer_text=answer_text))

    interview.status = InterviewStatus.ANSWERS_SUBMITTED
    await db.commit()
    await db.refresh(interview)
    return interview


async def run_evaluation(db: AsyncSession, interview_id: str) -> EvaluationResult:
    interview = (
        await db.execute(
            select(Interview)
            .options(selectinload(Interview.questions).selectinload(InterviewQuestion.answer))
            .where(Interview.id == interview_id)
        )
    ).scalar_one_or_none()
    if not interview:
        raise NotFoundError("Interview")

    job = (
        await db.execute(select(Job).options(selectinload(Job.requirement)).where(Job.id == interview.job_id))
    ).scalar_one_or_none()

    qa_pairs = [
        {"question": q.question_text, "answer": q.answer.answer_text}
        for q in interview.questions
        if q.answer
    ]
    if not qa_pairs:
        raise ValidationError("No answers have been submitted for this interview yet.")

    result = await evaluate_interview(job.title, job.requirement.required_skills, qa_pairs)

    eval_row = interview.evaluation_result or EvaluationResult(interview_id=interview.id)
    eval_row.technical_knowledge = result.technical_knowledge
    eval_row.problem_solving = result.problem_solving
    eval_row.communication = result.communication
    eval_row.role_fit = result.role_fit
    eval_row.overall = result.overall
    eval_row.summary = result.summary
    eval_row.per_question_feedback = [f.model_dump() for f in result.per_question_feedback]

    if not interview.evaluation_result:
        db.add(eval_row)

    interview.status = InterviewStatus.EVALUATED
    await db.commit()
    await db.refresh(eval_row)
    return eval_row
