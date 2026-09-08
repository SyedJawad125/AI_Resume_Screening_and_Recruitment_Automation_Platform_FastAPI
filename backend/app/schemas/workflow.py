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


class RelevanceGrade(BaseModel):
    """Output of the agentic RAG graph's grading node: does the retrieved
    candidate set actually answer the recruiter's question, or should the
    query be rewritten and retrieval retried?"""

    relevant: bool = Field(description="True if the retrieved candidates meaningfully address the question.")
    score: float = Field(ge=0.0, le=1.0, description="Confidence that the retrieved set is relevant, 0-1.")
    reasoning: str = Field(description="One sentence explaining the grade.")


class RewrittenQuery(BaseModel):
    """Output of the agentic RAG graph's query-rewrite node: a reformulated
    search query intended to retrieve more relevant candidates than the
    previous attempt."""

    rewritten_query: str = Field(description="A reformulated version of the recruiter's query, better suited to embedding-based retrieval.")
    reasoning: str = Field(default="", description="Why this rewrite should retrieve better results.")
