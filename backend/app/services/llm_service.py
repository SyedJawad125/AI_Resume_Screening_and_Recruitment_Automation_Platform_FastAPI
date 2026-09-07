# """
# app/services/llm_service.py
# ────────────────────────────
# UPDATED: Rewritten using LangChain LCEL chains.

# Before: direct Groq SDK calls
# After:  LangChain ChatGroq + PromptTemplate + OutputParser chains

# Why LCEL (LangChain Expression Language)?
#   chain = prompt | llm | parser
#   - Composable: add steps by chaining with |
#   - Streamable: swap .invoke() for .stream() with zero changes
#   - Observable: LangSmith tracing works automatically
#   - Testable: mock any step independently
#   - Fallback: chain.with_fallbacks([backup_llm])
# """

# import logging
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
# from langchain_core.messages import SystemMessage, HumanMessage
# from tenacity import retry, stop_after_attempt, wait_exponential

# from app.core.langchain_setup import llm, summary_llm, json_llm
# from app.core.config import settings
# from app.core.exceptions import LLMError, LLMTimeoutError

# logger = logging.getLogger(__name__)


# # ─────────────────────────────────────────────────────────────────
# #  RAG Q&A Chain
# # ─────────────────────────────────────────────────────────────────

# RAG_SYSTEM = """You are a precise document analysis assistant.
# Answer ONLY from the provided document context.
# If the answer is not in the context, say exactly:
# "I could not find this information in the provided document."
# Include page citations like [Page 12] when page numbers are available.
# Never invent or assume information not present in the context."""

# rag_prompt = ChatPromptTemplate.from_messages([
#     ('system', RAG_SYSTEM),
#     ('human', 'Document: {filename}\n\nContext:\n{context}\n\nQuestion: {question}\n\nAnswer:'),
# ])

# # LCEL chain: prompt → LLM → string output
# rag_chain = rag_prompt | llm | StrOutputParser()


# # ─────────────────────────────────────────────────────────────────
# #  Document Grading Chain  (NEW — used by LangGraph agent)
# # ─────────────────────────────────────────────────────────────────

# GRADING_SYSTEM = """You are a relevance grader for a document retrieval system.
# Given a user question and a retrieved document chunk, determine if the chunk
# is relevant to answering the question.

# Return JSON only:
# {{"relevant": true/false, "reason": "brief explanation", "score": 0.0-1.0}}"""

# grading_prompt = ChatPromptTemplate.from_messages([
#     ('system', GRADING_SYSTEM),
#     ('human', 'Question: {question}\n\nChunk:\n{chunk}'),
# ])

# grading_chain = grading_prompt | json_llm | JsonOutputParser()


# # ─────────────────────────────────────────────────────────────────
# #  Query Rewriting Chain  (NEW — used by LangGraph agent)
# # ─────────────────────────────────────────────────────────────────

# REWRITE_SYSTEM = """You are a query optimisation expert for document search.
# Rewrite the user's question to be more specific and searchable.
# Make it better for vector similarity search.
# Return only the rewritten query — no explanation."""

# rewrite_prompt = ChatPromptTemplate.from_messages([
#     ('system', REWRITE_SYSTEM),
#     ('human', 'Original question: {question}\n\nRewritten query:'),
# ])

# rewrite_chain = rewrite_prompt | llm | StrOutputParser()


# # ─────────────────────────────────────────────────────────────────
# #  Summarisation Chain
# # ─────────────────────────────────────────────────────────────────

# CHUNK_SUMMARY_SYSTEM = """You are a document summarisation expert.
# Create a concise, accurate summary preserving all key facts, numbers, dates, and names."""

# chunk_summary_prompt = ChatPromptTemplate.from_messages([
#     ('system', CHUNK_SUMMARY_SYSTEM),
#     ('human', 'Summarise this section:\n\n{text}'),
# ])

# chunk_summary_chain = chunk_summary_prompt | summary_llm | StrOutputParser()


# FINAL_SUMMARY_SYSTEM = """You are a senior document analyst.
# Create a structured executive summary. Return valid JSON only."""

# FINAL_SUMMARY_TEMPLATE = """Document: {filename}

# Section summaries:
# {combined_summaries}

# Return JSON with exactly these keys:
# {{
#   "executive_summary": "2-3 paragraph overview",
#   "key_points": ["point 1", "point 2"],
#   "important_facts": ["fact 1", "fact 2"],
#   "important_numbers": ["$14.2M revenue", "350 employees"],
#   "risks": ["risk 1"],
#   "conclusion": "1 paragraph conclusion"
# }}"""

# final_summary_prompt = ChatPromptTemplate.from_messages([
#     ('system', FINAL_SUMMARY_SYSTEM),
#     ('human', FINAL_SUMMARY_TEMPLATE),
# ])

# final_summary_chain = final_summary_prompt | json_llm | JsonOutputParser()


# # ─────────────────────────────────────────────────────────────────
# #  Extraction Chain
# # ─────────────────────────────────────────────────────────────────

# EXTRACTION_SYSTEM = """You are a precise data extraction specialist.
# Extract ONLY information explicitly stated in the context.
# For each field return: {{"value": <value or null>, "status": "found|not_found|uncertain"}}
# NEVER invent or guess values."""

# EXTRACTION_TEMPLATE = """Document: {filename}

# Context:
# {context}

# Extract these fields:
# {fields}

# Return JSON where each field maps to {{"value": ..., "status": "found|not_found|uncertain"}}."""

# extraction_prompt = ChatPromptTemplate.from_messages([
#     ('system', EXTRACTION_SYSTEM),
#     ('human', EXTRACTION_TEMPLATE),
# ])

# extraction_chain = extraction_prompt | json_llm | JsonOutputParser()


# # ─────────────────────────────────────────────────────────────────
# #  LLMService — thin wrapper calling LCEL chains
# # ─────────────────────────────────────────────────────────────────

# class LLMService:
#     """
#     Thin service layer over LCEL chains.
#     All methods are async and use .ainvoke() for non-blocking calls.
#     """

#     @property
#     def model(self) -> str:
#         return settings.GROQ_MODEL

#     @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
#     async def answer_from_context(self, question: str, context: str, filename: str) -> str:
#         """RAG Q&A — answer grounded in retrieved context."""
#         try:
#             result = await rag_chain.ainvoke({
#                 'question': question,
#                 'context':  context,
#                 'filename': filename,
#             })
#             logger.info(f'[LLM] RAG answer generated — {len(result)} chars')
#             return result
#         except Exception as e:
#             logger.error(f'[LLM] answer_from_context failed: {e}')
#             raise LLMError(str(e))

#     @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
#     async def grade_document(self, question: str, chunk: str) -> dict:
#         """Grade whether a chunk is relevant to the question (used by agent)."""
#         try:
#             return await grading_chain.ainvoke({'question': question, 'chunk': chunk})
#         except Exception as e:
#             logger.warning(f'[LLM] grading failed: {e}')
#             return {'relevant': True, 'score': 0.5, 'reason': 'grading unavailable'}

#     @retry(stop=stop_after_attempt(2), wait=wait_exponential(min=1, max=5))
#     async def rewrite_query(self, question: str) -> str:
#         """Rewrite query to improve retrieval (used by agent)."""
#         try:
#             return await rewrite_chain.ainvoke({'question': question})
#         except Exception as e:
#             logger.warning(f'[LLM] query rewrite failed: {e}')
#             return question   # fallback to original

#     @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
#     async def summarize_chunks(self, chunks_text: str) -> str:
#         try:
#             if summary_llm is None:
#                 logger.error('[LLM] summary_llm is None - check GROQ_API_KEY')
#                 raise LLMError('LLM not initialized. Check GROQ_API_KEY in .env')
#             return await chunk_summary_chain.ainvoke({'text': chunks_text})
#         except Exception as e:
#             logger.error(f'[LLM] summarize_chunks error: {e}')
#             raise LLMError(str(e))

#     @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
#     async def final_summary(self, combined_summaries: str, filename: str) -> dict:
#         try:
#             if json_llm is None:
#                 logger.error('[LLM] json_llm is None - check GROQ_API_KEY')
#                 raise LLMError('LLM not initialized. Check GROQ_API_KEY in .env')
#             return await final_summary_chain.ainvoke({
#                 'combined_summaries': combined_summaries,
#                 'filename':           filename,
#             })
#         except Exception as e:
#             logger.error(f'[LLM] final_summary error: {e}')
#             raise LLMError(str(e))

#     @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
#     async def extract_fields(self, fields: list[str], context: str, filename: str) -> dict:
#         try:
#             return await extraction_chain.ainvoke({
#                 'fields':   '\n'.join(f'- {f}' for f in fields),
#                 'context':  context,
#                 'filename': filename,
#             })
#         except Exception as e:
#             raise LLMError(str(e))


# llm_service = LLMService()





"""
app/services/llm_service.py
────────────────────────────
Fixed: sync Groq call now runs in thread pool via asyncio.to_thread()
so it never blocks the FastAPI event loop.
"""
import json
import asyncio
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.exceptions import LLMError, LLMTimeoutError

logger = logging.getLogger(__name__)


class LLMService:

    def __init__(self):
        from groq import Groq
        self._client = Groq(api_key=settings.GROQ_API_KEY)
        self.model   = settings.GROQ_MODEL

    def _call_sync(
        self,
        system:      str,
        user:        str,
        temperature: float = 0.1,
        max_tokens:  int   = 2000,
        json_mode:   bool  = False,
    ) -> str:
        """Pure synchronous Groq call — runs in thread pool."""
        try:
            kwargs = dict(
                model    = self.model,
                messages = [
                    {'role': 'system', 'content': system},
                    {'role': 'user',   'content': user},
                ],
                temperature = temperature,
                max_tokens  = max_tokens,
            )
            if json_mode:
                kwargs['response_format'] = {'type': 'json_object'}

            response = self._client.chat.completions.create(**kwargs)
            text     = response.choices[0].message.content
            tokens   = response.usage.total_tokens
            logger.info(f'[LLM] {self.model} — {tokens} tokens')
            return text

        except Exception as e:
            logger.error(f'[LLM] Error: {e}')
            raise LLMError(str(e))

    async def _call(
        self,
        system:      str,
        user:        str,
        temperature: float = 0.1,
        max_tokens:  int   = 2000,
        json_mode:   bool  = False,
    ) -> str:
        """
        Async wrapper — runs sync Groq call in thread pool.
        This prevents blocking the FastAPI event loop.
        """
        return await asyncio.to_thread(
            self._call_sync,
            system, user, temperature, max_tokens, json_mode
        )

    async def _call_json(
        self,
        system:      str,
        user:        str,
        temperature: float = 0.0,
        max_tokens:  int   = 2000,
    ) -> dict:
        """Call LLM and parse JSON response."""
        text = await self._call(system, user, temperature, max_tokens, json_mode=True)
        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            logger.error(f'[LLM] JSON parse error: {e} | text={text[:200]}')
            raise LLMError(f'LLM returned invalid JSON: {str(e)}')

    # ── RAG Q&A ────────────────────────────────────────────────────

    async def answer_from_context(self, question: str, context: str, filename: str) -> str:
        system = (
            'You are a precise document analysis assistant. '
            'Answer ONLY from the provided document context. '
            'If the answer is not in the context, say exactly: '
            '"I could not find this information in the provided document." '
            'Include page citations like [Page 12] when available. '
            'Never invent information.'
        )
        user = f'Document: {filename}\n\nContext:\n{context}\n\nQuestion: {question}\n\nAnswer:'
        return await self._call(system, user, temperature=0.1, max_tokens=1500)

    # ── Grading ────────────────────────────────────────────────────

    async def grade_document(self, question: str, chunk: str) -> dict:
        system = (
            'You are a relevance grader. '
            'Return JSON only: {"relevant": true/false, "score": 0.0-1.0, "reason": "brief"}'
        )
        user = f'Question: {question}\n\nChunk:\n{chunk}'
        try:
            return await self._call_json(system, user, temperature=0.0, max_tokens=200)
        except Exception:
            return {'relevant': True, 'score': 0.5, 'reason': 'grading unavailable'}

    # ── Query Rewrite ──────────────────────────────────────────────

    async def rewrite_query(self, question: str) -> str:
        system = (
            'Rewrite the user question to be more specific and searchable for vector search. '
            'Return only the rewritten query, nothing else.'
        )
        try:
            return await self._call(system, f'Question: {question}', temperature=0.1, max_tokens=200)
        except Exception:
            return question

    # ── Summarization ──────────────────────────────────────────────

    async def summarize_chunks(self, chunks_text: str) -> str:
        system = (
            'You are a document summarisation expert. '
            'Create a concise, accurate summary preserving all key facts, numbers, dates, and names.'
        )
        return await self._call(
            system,
            f'Summarise this section:\n\n{chunks_text}',
            temperature=0.2,
            max_tokens=800,
        )

    async def final_summary(self, combined_summaries: str, filename: str) -> dict:
        system = 'You are a senior document analyst. Return valid JSON only — no markdown, no extra text.'
        user   = (
            f'Document: {filename}\n\n'
            f'Section summaries:\n{combined_summaries}\n\n'
            'Return JSON with exactly these keys:\n'
            '{\n'
            '  "executive_summary": "2-3 paragraph overview",\n'
            '  "key_points": ["point 1", "point 2"],\n'
            '  "important_facts": ["fact 1", "fact 2"],\n'
            '  "important_numbers": ["$14.2M revenue", "350 employees"],\n'
            '  "risks": ["risk 1", "risk 2"],\n'
            '  "conclusion": "1 paragraph conclusion"\n'
            '}'
        )
        return await self._call_json(system, user, temperature=0.2, max_tokens=2000)

    # ── Extraction ─────────────────────────────────────────────────

    async def extract_fields(self, fields: list[str], context: str, filename: str) -> dict:
        system = (
            'You are a precise data extraction specialist. '
            'Extract ONLY information explicitly stated in the context. '
            'Return valid JSON only. '
            'For each field return: {"value": <value or null>, "status": "found|not_found|uncertain"}. '
            'NEVER invent values.'
        )
        fields_str = '\n'.join(f'- {f}' for f in fields)
        user = (
            f'Document: {filename}\n\n'
            f'Context:\n{context}\n\n'
            f'Extract these fields:\n{fields_str}\n\n'
            'Return JSON where each field maps to {"value": ..., "status": "found|not_found|uncertain"}.'
        )
        return await self._call_json(system, user, temperature=0.0, max_tokens=1500)


llm_service = LLMService()