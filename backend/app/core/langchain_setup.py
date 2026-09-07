"""
app/core/langchain_setup.py  ← NEW FILE
────────────────────────────────────────
Central initialisation of all LangChain components.
Import from here — never initialise LLM/embeddings inline in services.

Components:
  llm          → ChatGroq (LangChain wrapper around Groq API)
  embeddings   → HuggingFaceEmbeddings (local sentence-transformers)
  json_llm     → ChatGroq with JSON output parser
  summary_llm  → ChatGroq tuned for summarisation (higher temperature)

Why LangChain wrappers instead of raw clients?
  - LCEL (LangChain Expression Language): chain = prompt | llm | parser
  - Built-in retry, fallback, streaming support
  - LangGraph requires LangChain BaseChatModel interface
  - Callbacks: automatic token counting, tracing, debugging
  - Swap models (Groq → OpenAI → Anthropic) by changing one line
"""

from functools import lru_cache
from app.core.config import settings


@lru_cache
def get_llm():
    """
    Primary ChatGroq LLM.
    temperature=0.1 → near-deterministic for factual Q&A.
    """
    if not settings.GROQ_API_KEY:
        print("Warning: GROQ_API_KEY is not set in .env file")
        return None
    try:
        from langchain_groq import ChatGroq
        return ChatGroq(
            model       = settings.GROQ_MODEL,
            api_key     = settings.GROQ_API_KEY,
            temperature = 0.1,
            max_tokens  = 2048,
            timeout     = settings.GROQ_TIMEOUT,
        )
    except ImportError as e:
        print(f"Warning: Could not import ChatGroq: {e}")
        return None


@lru_cache
def get_summary_llm():
    """
    LLM tuned for summarisation — slightly more creative."""
    if not settings.GROQ_API_KEY:
        print("Warning: GROQ_API_KEY is not set in .env file")
        return None
    try:
        from langchain_groq import ChatGroq
        return ChatGroq(
            model       = settings.GROQ_MODEL,
            api_key     = settings.GROQ_API_KEY,
            temperature = 0.3,
            max_tokens  = 2048,
            timeout     = settings.GROQ_TIMEOUT,
        )
    except ImportError as e:
        print(f"Warning: Could not import ChatGroq: {e}")
        return None


@lru_cache
def get_json_llm():
    """
    LLM for structured JSON output.
    temperature=0 → maximum consistency for extraction tasks.
    """
    if not settings.GROQ_API_KEY:
        print("Warning: GROQ_API_KEY is not set in .env file")
        return None
    try:
        from langchain_groq import ChatGroq
        return ChatGroq(
            model       = settings.GROQ_MODEL,
            api_key     = settings.GROQ_API_KEY,
            temperature = 0.0,
            max_tokens  = 2048,
            timeout     = settings.GROQ_TIMEOUT,
        )
    except ImportError as e:
        print(f"Warning: Could not import ChatGroq: {e}")
        return None


@lru_cache
def get_embeddings():
    """
    Local HuggingFace embeddings via LangChain wrapper.
    No API key needed — runs locally.
    model_name must match EMBEDDING_DIMENSION in settings.
    """
    try:
        from langchain_huggingface import HuggingFaceEmbeddings
        return HuggingFaceEmbeddings(
            model_name   = settings.EMBEDDING_MODEL,
            model_kwargs = {'device': 'cpu'},
            encode_kwargs = {'normalize_embeddings': True},
        )
    except ImportError as e:
        print(f"Warning: Could not import HuggingFaceEmbeddings: {e}")
        return None


# ── Convenience singletons ─────────────────────────────────────────
# Import these in services instead of calling get_*() every time
llm          = get_llm()
summary_llm  = get_summary_llm()
json_llm     = get_json_llm()
embeddings   = get_embeddings()