"""
app/api/v1/interviews.py
────────────────────────────
POST /api/v1/interviews                    → create interview + generate questions
GET  /api/v1/interviews/{id}                → interview detail with questions
POST /api/v1/interviews/{id}/answers        → submit candidate answers
POST /api/v1/interviews/{id}/evaluate       → run the Evaluation Agent
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.dependencies.auth import get_current_user, require_permission
from app.models.user import User
from app.schemas.interview import CreateInterviewRequest, SubmitAnswersRequest
from app.services.interview_service import (
    create_interview, get_interview_with_questions, submit_answers, run_evaluation,
)
from app.utils.response import success_response

router = APIRouter()


@router.post("/", status_code=201)
async def create_interview_endpoint(
    payload: CreateInterviewRequest, current_user: User = Depends(require_permission("can_create_interview")), db: AsyncSession = Depends(get_db)
):
    interview = await create_interview(db, payload.job_id, payload.candidate_id, payload.num_questions)
    interview = await get_interview_with_questions(db, str(interview.id))
    return success_response(_interview_to_dict(interview), status_code=201)


@router.get("/{interview_id}")
async def get_interview_endpoint(
    interview_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    interview = await get_interview_with_questions(db, interview_id)
    return success_response(_interview_to_dict(interview))


@router.post("/{interview_id}/answers")
async def submit_answers_endpoint(
    interview_id: str,
    payload: SubmitAnswersRequest,
    current_user: User = Depends(require_permission("can_submit_interview_answers")),
    db: AsyncSession = Depends(get_db),
):
    interview = await submit_answers(db, interview_id, payload.answers)
    return success_response({"status": interview.status, "message": "Answers submitted."})


@router.post("/{interview_id}/evaluate")
async def evaluate_interview_endpoint(
    interview_id: str, current_user: User = Depends(require_permission("can_evaluate_interview")), db: AsyncSession = Depends(get_db)
):
    result = await run_evaluation(db, interview_id)
    return success_response(_evaluation_to_dict(result))


def _interview_to_dict(interview) -> dict:
    return {
        "id": str(interview.id),
        "job_id": str(interview.job_id),
        "candidate_id": str(interview.candidate_id),
        "status": interview.status,
        "questions": [
            {"id": str(q.id), "order": q.order, "question": q.question_text, "topic": q.topic}
            for q in interview.questions
        ],
    }


def _evaluation_to_dict(result) -> dict:
    return {
        "technical_knowledge": result.technical_knowledge,
        "problem_solving": result.problem_solving,
        "communication": result.communication,
        "role_fit": result.role_fit,
        "overall": result.overall,
        "summary": result.summary,
        "per_question_feedback": result.per_question_feedback,
    }
