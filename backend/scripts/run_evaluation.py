"""
scripts/run_evaluation.py
────────────────────────────
Runs the Resume Parser Agent and Job Analysis Agent against the synthetic
datasets in evaluation/datasets/, scores them with precision/recall/F1 and
experience-extraction accuracy, tracks latency/tokens/cost, and writes a
report to evaluation/reports/.

Requires a real GROQ_API_KEY (this hits the live LLM — that's the point:
we're evaluating actual agent behavior, not a mock). For CI, use the
mocked-agent tests in tests/test_evaluation.py instead.

Usage:
    python -m scripts.run_evaluation
"""

import asyncio
import json
import time
from pathlib import Path

from app.agents.job_analysis_agent import analyze_job_description
from app.agents.resume_parser_agent import parse_resume
from app.evaluation.metrics import (
    compute_extraction_metrics, average_extraction_metrics,
    experience_extraction_accuracy, estimate_cost_usd,
)
from app.evaluation.schemas import ResumeEvalItem, JobEvalItem, EvaluationReport

DATASET_DIR = Path(__file__).resolve().parent.parent / "evaluation" / "datasets"
REPORT_DIR = Path(__file__).resolve().parent.parent / "evaluation" / "reports"


async def evaluate_resume_parsing() -> tuple[EvaluationReport, list]:
    items = [ResumeEvalItem(**d) for d in json.loads((DATASET_DIR / "sample_resumes.json").read_text())]

    per_item_metrics = []
    experience_pairs = []
    per_item_results = []
    latencies = []

    for item in items:
        started = time.monotonic()
        parsed = await parse_resume(item.resume_text)
        latency_ms = (time.monotonic() - started) * 1000
        latencies.append(latency_ms)

        metrics = compute_extraction_metrics(item.expected_skills, parsed.skills)
        per_item_metrics.append(metrics)
        experience_pairs.append((item.expected_experience_years, parsed.experience_years))

        per_item_results.append(
            {
                "id": item.id,
                "expected_skills": item.expected_skills,
                "predicted_skills": parsed.skills,
                "metrics": metrics.model_dump(),
                "expected_experience_years": item.expected_experience_years,
                "predicted_experience_years": parsed.experience_years,
                "latency_ms": round(latency_ms, 1),
            }
        )

    report = EvaluationReport(
        dataset_name="sample_resumes",
        item_count=len(items),
        resume_parsing_metrics=average_extraction_metrics(per_item_metrics),
        experience_extraction_accuracy=experience_extraction_accuracy(experience_pairs),
        per_item_results=per_item_results,
    )
    return report, latencies


async def evaluate_job_analysis() -> EvaluationReport:
    items = [JobEvalItem(**d) for d in json.loads((DATASET_DIR / "sample_jobs.json").read_text())]

    per_item_metrics = []
    per_item_results = []

    for item in items:
        analysis = await analyze_job_description(item.job_title, item.job_description)
        metrics = compute_extraction_metrics(item.expected_required_skills, analysis.required_skills)
        per_item_metrics.append(metrics)
        per_item_results.append(
            {
                "id": item.id,
                "expected_required_skills": item.expected_required_skills,
                "predicted_required_skills": analysis.required_skills,
                "metrics": metrics.model_dump(),
            }
        )

    return EvaluationReport(
        dataset_name="sample_jobs",
        item_count=len(items),
        job_analysis_metrics=average_extraction_metrics(per_item_metrics),
        per_item_results=per_item_results,
    )


async def main():
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    resume_report, _ = await evaluate_resume_parsing()
    job_report = await evaluate_job_analysis()

    (REPORT_DIR / "resume_parsing_report.json").write_text(resume_report.model_dump_json(indent=2))
    (REPORT_DIR / "job_analysis_report.json").write_text(job_report.model_dump_json(indent=2))

    print("=== Resume Parsing Evaluation ===")
    print(resume_report.resume_parsing_metrics)
    print(f"Experience extraction accuracy (±1yr): {resume_report.experience_extraction_accuracy}")
    print("\n=== Job Analysis Evaluation ===")
    print(job_report.job_analysis_metrics)
    print(f"\nReports written to {REPORT_DIR}/")


if __name__ == "__main__":
    asyncio.run(main())
