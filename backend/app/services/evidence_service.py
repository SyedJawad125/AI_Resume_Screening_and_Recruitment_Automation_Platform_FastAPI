"""
app/services/evidence_service.py
────────────────────────────────────
Evidence Retrieval — grounds every claim in the actual resume text instead
of letting the LLM "explain" a score from nothing.

Approach: keyword/phrase search over the resume's page-attributed text.
This is deliberately NOT an LLM call — evidence must be a verbatim excerpt
the recruiter can verify against the source document, not a paraphrase an
LLM could hallucinate. If a skill genuinely isn't mentioned, we say so
explicitly rather than inventing a plausible-sounding sentence.
"""

import re
from dataclasses import dataclass


@dataclass
class Evidence:
    requirement: str
    found: bool
    excerpt: str | None
    resume_page: int | None


def _find_mention(skill: str, pages: list[dict]) -> tuple[str | None, int | None]:
    pattern = re.compile(re.escape(skill), re.IGNORECASE)

    for page in pages:
        text = page.get("text", "")
        match = pattern.search(text)
        if match:
            start = max(0, match.start() - 80)
            end = min(len(text), match.end() + 80)
            excerpt = text[start:end].strip()
            return excerpt, page.get("page")

    return None, None


def build_evidence(requirements: list[str], resume_pages: list[dict]) -> list[Evidence]:
    """For each requirement, find a real snippet from the resume or explicitly
    mark it as not found. Never returns a fabricated excerpt."""
    results = []
    for requirement in requirements:
        excerpt, page = _find_mention(requirement, resume_pages or [])
        results.append(
            Evidence(
                requirement=requirement,
                found=excerpt is not None,
                excerpt=excerpt,
                resume_page=page,
            )
        )
    return results


def evidence_to_dict(evidence_list: list[Evidence]) -> list[dict]:
    return [
        {
            "requirement": e.requirement,
            "evidence": e.excerpt if e.found else "Evidence not found in resume.",
            "resume_page": e.resume_page,
        }
        for e in evidence_list
    ]
