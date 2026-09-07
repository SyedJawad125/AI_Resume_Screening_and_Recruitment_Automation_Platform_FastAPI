"""
app/schemas/interview.py
────────────────────────────
Strict schemas for the Interview Agent (question generation) and the
Evaluation Agent (answer scoring) LLM outputs, plus request schemas
for the interview API.
"""

from pydantic import BaseModel, Field


class GeneratedQuestion(BaseModel):
    question: str
    topic: str = ""


class QuestionGenerationResult(BaseModel):
    questions: list[GeneratedQuestion] = Field(default_factory=list)


class SubmitAnswersRequest(BaseModel):
    # {question_id: answer_text}
    answers: dict[str, str]


class PerQuestionEvaluation(BaseModel):
    question: str
    evaluation: str
    score: int = Field(ge=0, le=10)


class InterviewEvaluationResult(BaseModel):
    """Exact shape the Evaluation Agent must return for a full interview."""

    technical_knowledge: float = Field(ge=0, le=10)
    problem_solving: float = Field(ge=0, le=10)
    communication: float = Field(ge=0, le=10)
    role_fit: float = Field(ge=0, le=10)
    overall: float = Field(ge=0, le=10)
    summary: str
    per_question_feedback: list[PerQuestionEvaluation] = Field(default_factory=list)


class CreateInterviewRequest(BaseModel):
    job_id: str
    candidate_id: str
    num_questions: int = Field(default=5, ge=1, le=10)
