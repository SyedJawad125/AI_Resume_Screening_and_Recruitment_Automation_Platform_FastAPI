"""
app/embeddings/service.py
─────────────────────────────
Generates embeddings with Sentence Transformers (local, free, no API cost —
appropriate for a portfolio project doing 50-100 resumes; swap to an API
embedding model later purely via EMBEDDING_MODEL/EMBEDDING_DIM in .env).

The model is loaded once per process (module-level singleton) since loading
it is the expensive part — never re-instantiate it per request.
"""

from functools import lru_cache

from app.core.config import settings


@lru_cache(maxsize=1)
def _get_model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(settings.EMBEDDING_MODEL)


def embed_text(text: str) -> list[float]:
    model = _get_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


def embed_texts(texts: list[str]) -> list[list[float]]:
    model = _get_model()
    vectors = model.encode(texts, normalize_embeddings=True)
    return [v.tolist() for v in vectors]


def candidate_profile_text(candidate) -> str:
    """Builds the canonical text used for the candidate's 'profile' embedding.
    Keeping this in one function means matching + search always embed the
    same representation of a candidate."""
    parts = [
        candidate.summary or "",
        "Skills: " + ", ".join(candidate.skills or []),
        "Experience: " + " ".join(
            f"{w.get('title', '')} at {w.get('company', '')}: {w.get('description', '')}"
            for w in (candidate.work_experience or [])
        ),
        "Projects: " + " ".join(
            f"{p.get('name', '')}: {p.get('description', '')}" for p in (candidate.projects or [])
        ),
    ]
    return "\n".join(p for p in parts if p.strip())
