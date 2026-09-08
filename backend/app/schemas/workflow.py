"""
app/schemas/workflow.py
────────────────────────────
Structured output contract for the LangGraph evaluation node
(app/workflows/nodes.py). Kept separate from schemas/job.py and
schemas/candidate.py since this is workflow-internal, not part of the
public API surface.
"""

from pydantic import BaseModel, Field


class WorkflowEvaluationOutput(BaseModel):
    """The evaluation node is deliberately narrow: it narrates the
    already-computed matched/missing skills and evidence, and is NEVER
    asked for (or trusted with) a numeric score — that stays owned by
    the deterministic matching_engine."""

    summary: str = Field(description="2-3 sentence qualitative summary of the candidate's fit.")
    strengths: list[str] = Field(default_factory=list, description="Concrete strengths grounded in the matched skills/evidence given.")
