"""
app/evaluation/schemas.py
─────────────────────────────
Schemas for the offline evaluation dataset (section 20 of the architecture
doc). Each dataset item pairs a synthetic resume/job with the "ground
truth" a human labeler would agree with, so we can score the agents'
actual extractions against it.
"""

from pydantic import BaseModel


class ResumeEvalItem(BaseModel):
    id: str
    resume_text: str
    expected_skills: list[str]
    expected_experience_years: int | None = None


class JobEvalItem(BaseModel):
    id: str
    job_title: str
    job_description: str
    expected_required_skills: list[str]
    expected_preferred_skills: list[str] = []
    expected_minimum_experience_years: int = 0


class ExtractionMetrics(BaseModel):
    """Standard IR metrics applied to a set-valued extraction (skills)."""

    precision: float
    recall: float
    f1: float
    exact_matches: int
    total_expected: int
    total_predicted: int


class LatencyCostMetrics(BaseModel):
    avg_latency_ms: float
    total_input_tokens: int
    total_output_tokens: int
    estimated_cost_usd: float


class EvaluationReport(BaseModel):
    dataset_name: str
    item_count: int
    resume_parsing_metrics: ExtractionMetrics | None = None
    job_analysis_metrics: ExtractionMetrics | None = None
    experience_extraction_accuracy: float | None = None
    latency_cost: LatencyCostMetrics | None = None
    per_item_results: list[dict] = []
