"""
app/evaluation/metrics.py
─────────────────────────────
Pure metric functions — no LLM, no DB. Same discipline as the matching
engine: metrics must be independently verifiable, not another LLM's
opinion of how well the first LLM did.
"""

from app.evaluation.schemas import ExtractionMetrics


def _normalize_set(items: list[str]) -> set[str]:
    return {i.strip().lower() for i in items if i.strip()}


def compute_extraction_metrics(expected: list[str], predicted: list[str]) -> ExtractionMetrics:
    """Precision/recall/F1 for a set-valued extraction task (e.g. skills).
    This is exactly the same measure used for multi-label classification —
    appropriate here since skill extraction is a multi-label problem."""
    expected_set = _normalize_set(expected)
    predicted_set = _normalize_set(predicted)

    true_positives = len(expected_set & predicted_set)
    precision = true_positives / len(predicted_set) if predicted_set else (1.0 if not expected_set else 0.0)
    recall = true_positives / len(expected_set) if expected_set else 1.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

    return ExtractionMetrics(
        precision=round(precision, 4),
        recall=round(recall, 4),
        f1=round(f1, 4),
        exact_matches=true_positives,
        total_expected=len(expected_set),
        total_predicted=len(predicted_set),
    )


def average_extraction_metrics(metrics_list: list[ExtractionMetrics]) -> ExtractionMetrics:
    """Macro-average across all dataset items — each item weighted equally
    regardless of how many skills it has, which is the fairer choice when
    resumes vary widely in skill-list length."""
    if not metrics_list:
        return ExtractionMetrics(precision=0, recall=0, f1=0, exact_matches=0, total_expected=0, total_predicted=0)

    n = len(metrics_list)
    return ExtractionMetrics(
        precision=round(sum(m.precision for m in metrics_list) / n, 4),
        recall=round(sum(m.recall for m in metrics_list) / n, 4),
        f1=round(sum(m.f1 for m in metrics_list) / n, 4),
        exact_matches=sum(m.exact_matches for m in metrics_list),
        total_expected=sum(m.total_expected for m in metrics_list),
        total_predicted=sum(m.total_predicted for m in metrics_list),
    )


def experience_extraction_accuracy(pairs: list[tuple[int | None, int | None]], tolerance_years: int = 1) -> float:
    """Fraction of items where extracted experience_years is within
    `tolerance_years` of the ground truth. Exact-match accuracy for a
    numeric field like this is too strict (a 4 vs. 5 year miss isn't a
    real extraction failure), so a small tolerance band is more honest."""
    if not pairs:
        return 0.0
    correct = sum(
        1 for expected, predicted in pairs
        if expected is not None and predicted is not None and abs(expected - predicted) <= tolerance_years
    )
    return round(correct / len(pairs), 4)


# Groq pricing varies by model; this is a placeholder rate for the
# report's cost estimate — update to match the actual model in use.
ESTIMATED_COST_PER_1K_INPUT_TOKENS = 0.00059
ESTIMATED_COST_PER_1K_OUTPUT_TOKENS = 0.00079


def estimate_cost_usd(input_tokens: int, output_tokens: int) -> float:
    return round(
        (input_tokens / 1000) * ESTIMATED_COST_PER_1K_INPUT_TOKENS
        + (output_tokens / 1000) * ESTIMATED_COST_PER_1K_OUTPUT_TOKENS,
        6,
    )
