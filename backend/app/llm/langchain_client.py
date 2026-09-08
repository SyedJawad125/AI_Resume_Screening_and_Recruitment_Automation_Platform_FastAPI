"""
app/llm/langchain_client.py
────────────────────────────
LangChain-based LLM client. Every agent builds a ChatPromptTemplate →
chat model → `.with_structured_output(PydanticModel)` chain and invokes
it through `generate_structured()` here. This is the idiomatic LangChain
pattern for forced structured extraction (it uses the model's native
tool-calling under the hood) — it replaces hand-rolled
`json.loads()` + manual Pydantic validation with the library's own
schema-enforcement and retry-on-malformed-output behavior.

Swapping providers is still a one-line config change: `get_chat_model()`
is the only function that knows about a concrete provider SDK
(`langchain_groq.ChatGroq` today). Add a branch here for a new provider
— e.g. `ChatOpenAI`, `ChatAnthropic` — and nothing in app/agents/ changes.
"""

from functools import lru_cache
from typing import TypeVar

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.exceptions import AppException

T = TypeVar("T", bound=BaseModel)


class LLMError(AppException):
    default_message = "The AI model failed to respond. Please try again."


@lru_cache(maxsize=1)
def get_chat_model():
    """The one place in the app that knows which concrete LangChain chat
    model class to instantiate. Cached (lru_cache) so the underlying
    client/connection pool is built once per process, not per request."""
    provider = settings.LLM_PROVIDER.upper()

    if provider == "GROQ":
        from langchain_groq import ChatGroq

        return ChatGroq(
            model=settings.GROQ_MODEL,
            api_key=settings.GROQ_API_KEY,
            temperature=0.1,  # extraction/evaluation tasks need determinism, not creativity
            timeout=settings.LLM_TIMEOUT_SECONDS,
        )

    raise LLMError(f"Unsupported LLM_PROVIDER: {provider}")


def build_structured_chain(system_prompt: str, output_model: type[T]):
    """Returns a LangChain Runnable: ChatPromptTemplate | structured LLM.
    Reusable across agents — each agent supplies its own system prompt and
    Pydantic output model, gets back a chain it can `.ainvoke({"input": ...})`."""
    llm = get_chat_model()
    structured_llm = llm.with_structured_output(output_model)

    prompt = ChatPromptTemplate.from_messages(
        [("system", system_prompt), ("human", "{input}")]
    )
    return prompt | structured_llm


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10), reraise=True)
async def _invoke_with_retry(chain, inputs: dict):
    """Exponential backoff on transient failures (rate limits, timeouts,
    momentary malformed tool-call output) — 3 attempts, 1s/2s/4s+jitter."""
    return await chain.ainvoke(inputs)


async def generate_structured(system_prompt: str, user_prompt: str, output_model: type[T]) -> T:
    """Build the chain, invoke it with retries, return a validated instance
    of `output_model`. This is the single call site every agent uses."""
    chain = build_structured_chain(system_prompt, output_model)
    try:
        return await _invoke_with_retry(chain, {"input": user_prompt})
    except Exception as exc:
        raise LLMError(f"LLM structured-output call failed after retries: {exc}")
