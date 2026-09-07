"""
app/llm/client.py
─────────────────────
Thin abstraction over the LLM provider so agents never import a provider
SDK directly. Swapping providers is a config change (LLM_PROVIDER=...),
never a code change in app/agents/.

Handles:
- structured JSON output (with retry-on-malformed-JSON)
- timeouts
- exponential backoff on transient errors
- basic observability (tokens, latency) returned alongside the result
"""

import asyncio
import json
import time
from dataclasses import dataclass
from typing import Any

from app.core.config import settings
from app.core.exceptions import AppException


class LLMError(AppException):
    default_message = "The AI model failed to respond. Please try again."


@dataclass
class LLMResult:
    content: str
    input_tokens: int
    output_tokens: int
    latency_ms: float
    model: str


class LLMClient:
    """Provider-agnostic chat-completion client. Add a new provider by adding
    one branch to `_call_provider` — nothing else in the app changes."""

    def __init__(self):
        self.provider = settings.LLM_PROVIDER.upper()

    async def _call_provider(self, system_prompt: str, user_prompt: str) -> tuple[str, int, int]:
        if self.provider == "GROQ":
            from groq import AsyncGroq

            client = AsyncGroq(api_key=settings.GROQ_API_KEY, timeout=settings.LLM_TIMEOUT_SECONDS)
            response = await client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.1,  # low temperature: extraction tasks need determinism, not creativity
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content
            usage = response.usage
            return content, usage.prompt_tokens, usage.completion_tokens

        raise LLMError(f"Unsupported LLM_PROVIDER: {self.provider}")

    async def generate_json(self, system_prompt: str, user_prompt: str) -> tuple[dict[str, Any], LLMResult]:
        """Call the LLM expecting a JSON object back. Retries on malformed JSON
        or transient failures with exponential backoff — never crashes the
        caller on a single hiccup, and never silently returns garbage."""
        last_error: Exception | None = None

        for attempt in range(settings.LLM_MAX_RETRIES):
            started = time.monotonic()
            try:
                content, in_tokens, out_tokens = await self._call_provider(system_prompt, user_prompt)
                latency_ms = (time.monotonic() - started) * 1000

                parsed = json.loads(content)
                return parsed, LLMResult(
                    content=content,
                    input_tokens=in_tokens,
                    output_tokens=out_tokens,
                    latency_ms=latency_ms,
                    model=settings.GROQ_MODEL,
                )
            except json.JSONDecodeError as exc:
                last_error = exc
            except Exception as exc:  # network/timeout/rate-limit — retry with backoff
                last_error = exc

            await asyncio.sleep(2 ** attempt)  # 1s, 2s, 4s...

        raise LLMError(f"LLM call failed after {settings.LLM_MAX_RETRIES} attempts: {last_error}")


llm_client = LLMClient()
