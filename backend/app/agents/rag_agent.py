"""
app/agents/rag_agent.py  ← NEW FILE
─────────────────────────────────────
LangGraph Corrective RAG (CRAG) Agent.

What is CRAG?
  Standard RAG: query → retrieve → generate (always trusts retrieval)
  CRAG:         query → retrieve → GRADE → if poor → REWRITE → re-retrieve
                                         → if good → generate

Graph nodes:
  ┌─────────────┐
  │   retrieve  │  Vector search for top-K chunks
  └──────┬──────┘
         ↓
  ┌─────────────┐
  │  grade_docs │  LLM grades each chunk for relevance
  └──────┬──────┘
         ↓
  ┌────────────────────────────────┐
  │  router: all_good / some_poor  │
  └──────┬─────────────┬───────────┘
         │             │
    all_good       some_poor / none
         ↓             ↓
  ┌──────────┐   ┌──────────────┐
  │ generate │   │ rewrite_query│
  └──────────┘   └──────┬───────┘
                        ↓
                  ┌──────────┐
                  │ retrieve │ (second attempt with better query)
                  └──────────┘
                        ↓
                  ┌──────────┐
                  │ generate │
                  └──────────┘

Why LangGraph?
  - Stateful: graph carries state between nodes
  - Conditional edges: dynamic routing based on node output
  - Loop support: can retry retrieval with rewritten query
  - Persistent: state can be checkpointed for long-running tasks
  - Observable: every node transition is logged
"""

import logging
from typing import TypedDict, Annotated, Literal
from operator import add

from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langgraph.graph import StateGraph, END, START

from app.services.vector_search_service import vector_search_service, SearchResult
from app.services.llm_service import llm_service
from app.core.config import settings

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────
#  Agent State
#  TypedDict that flows through every graph node.
#  Annotated[list, add] means the list is appended (not replaced).
# ─────────────────────────────────────────────────────────────────

class RAGState(TypedDict):
    # Input
    question:    str
    document_id: str
    filename:    str
    top_k:       int

    # Internal state
    messages:       Annotated[list[BaseMessage], add]  # conversation history
    retrieved_docs: list[SearchResult]                 # raw retrieval results
    good_docs:      list[SearchResult]                 # docs that passed grading
    context:        str                                # built context string
    query_rewritten: bool                              # have we already rewritten?
    iterations:     int                                # loop counter

    # Output
    answer:    str
    citations: list[dict]


# ─────────────────────────────────────────────────────────────────
#  Node 1: Retrieve
# ─────────────────────────────────────────────────────────────────

async def retrieve_node(state: RAGState, db) -> dict:
    """
    Vector similarity search for the current question.
    Uses pgvector <=> cosine distance operator.
    """
    logger.info(f'[RAGAgent] retrieve_node | q="{state["question"][:60]}"')

    results = await vector_search_service.search(
        query       = state['question'],
        document_id = state['document_id'],
        db          = db,
        top_k       = state.get('top_k', settings.TOP_K),
        min_similarity = 0.15,   # lower threshold — grader will filter
    )

    return {
        'retrieved_docs': results,
        'messages': [HumanMessage(content=f'Retrieved {len(results)} chunks.')],
        'iterations': state.get('iterations', 0) + 1,
    }


# ─────────────────────────────────────────────────────────────────
#  Node 2: Grade Documents
# ─────────────────────────────────────────────────────────────────

async def grade_docs_node(state: RAGState) -> dict:
    """
    LLM grades each retrieved chunk for relevance to the question.
    Chunks below GRADING_THRESHOLD are discarded.

    Why grade?
      - Vector similarity finds similar text, not always relevant answers
      - A chunk about "revenue trends" might score high for "revenue?"
        but contain no actual numbers
      - Grading filters semantically close but informationally poor chunks
    """
    question = state['question']
    docs     = state['retrieved_docs']
    good     = []

    logger.info(f'[RAGAgent] grade_docs_node | grading {len(docs)} chunks')

    for doc in docs:
        grade = await llm_service.grade_document(question, doc.content)
        score = float(grade.get('score', 0.5))
        if grade.get('relevant') and score >= settings.GRADING_THRESHOLD:
            good.append(doc)
            logger.debug(f'  ✅ chunk {doc.chunk_index} p.{doc.page_number} score={score:.2f}')
        else:
            logger.debug(f'  ❌ chunk {doc.chunk_index} score={score:.2f} — {grade.get("reason", "")}')

    return {
        'good_docs': good,
        'messages': [AIMessage(content=f'{len(good)}/{len(docs)} chunks passed grading.')],
    }


# ─────────────────────────────────────────────────────────────────
#  Node 3: Rewrite Query
# ─────────────────────────────────────────────────────────────────

async def rewrite_query_node(state: RAGState) -> dict:
    """
    LLM rewrites the question to be more searchable.
    Called when graded docs are insufficient.

    Example:
      Original: "how much did they make?"
      Rewritten: "What was the total annual revenue and net profit?"
    """
    original   = state['question']
    rewritten  = await llm_service.rewrite_query(original)

    logger.info(f'[RAGAgent] rewrite_query_node | "{original}" → "{rewritten}"')

    return {
        'question':        rewritten,
        'query_rewritten': True,
        'messages': [AIMessage(content=f'Query rewritten: {rewritten}')],
    }


# ─────────────────────────────────────────────────────────────────
#  Node 4: Generate Answer
# ─────────────────────────────────────────────────────────────────

async def generate_node(state: RAGState) -> dict:
    """
    Generate final answer from the graded docs using Groq LLM.
    Builds page-annotated context, calls LLM, extracts citations.
    """
    docs     = state['good_docs'] or state['retrieved_docs']
    question = state['question']
    filename = state['filename']

    logger.info(f'[RAGAgent] generate_node | {len(docs)} docs')

    if not docs:
        return {
            'answer':    'I could not find this information in the provided document.',
            'citations': [],
            'messages':  [AIMessage(content='No relevant chunks — returning fallback answer.')],
        }

    # Build context with page annotations
    context_parts = []
    for doc in docs:
        pg = f'[Page {doc.page_number}]' if doc.page_number else ''
        context_parts.append(f'{pg}\n{doc.content}')
    context = '\n\n---\n\n'.join(context_parts)[:6000]

    answer = await llm_service.answer_from_context(
        question = question,
        context  = context,
        filename = filename,
    )

    citations = [
        {
            'chunk_id':    doc.chunk_id,
            'document_id': doc.document_id,
            'page_number': doc.page_number,
            'similarity':  doc.similarity,
        }
        for doc in docs
    ]

    return {
        'answer':    answer,
        'citations': citations,
        'context':   context,
        'messages':  [AIMessage(content=f'Answer generated ({len(answer)} chars).')],
    }


# ─────────────────────────────────────────────────────────────────
#  Routing Logic (Conditional Edges)
# ─────────────────────────────────────────────────────────────────

def route_after_grading(state: RAGState) -> Literal['generate', 'rewrite_query', 'generate_fallback']:
    """
    Decide next node after document grading.

    Rules:
      - Enough good docs → generate
      - Poor docs + not yet rewritten + rewriting enabled → rewrite_query
      - Poor docs + already rewritten (or rewriting disabled) → generate with what we have
      - Too many iterations → generate (prevent infinite loop)
    """
    good_docs    = state.get('good_docs', [])
    rewritten    = state.get('query_rewritten', False)
    iterations   = state.get('iterations', 1)

    if iterations >= settings.MAX_AGENT_ITERATIONS:
        logger.warning(f'[RAGAgent] Max iterations reached ({iterations}) — forcing generate')
        return 'generate'

    if len(good_docs) >= 2:
        logger.info(f'[RAGAgent] Route → generate ({len(good_docs)} good docs)')
        return 'generate'

    if not rewritten and settings.ENABLE_QUERY_REWRITE:
        logger.info('[RAGAgent] Route → rewrite_query (poor docs, not yet rewritten)')
        return 'rewrite_query'

    logger.info('[RAGAgent] Route → generate (no good docs, generating fallback)')
    return 'generate'


# ─────────────────────────────────────────────────────────────────
#  Build the LangGraph
# ─────────────────────────────────────────────────────────────────

def build_rag_graph(db):
    """
    Build and compile the CRAG LangGraph.
    db is injected so nodes can query pgvector.

    Graph structure:
      START → retrieve → grade_docs → [route] → generate → END
                                          ↓
                                    rewrite_query → retrieve → ...
    """
    # Wrap async nodes with db dependency
    async def _retrieve(state):  return await retrieve_node(state, db)
    async def _grade(state):     return await grade_docs_node(state)
    async def _rewrite(state):   return await rewrite_query_node(state)
    async def _generate(state):  return await generate_node(state)

    graph = StateGraph(RAGState)

    # Add nodes
    graph.add_node('retrieve',      _retrieve)
    graph.add_node('grade_docs',    _grade)
    graph.add_node('rewrite_query', _rewrite)
    graph.add_node('generate',      _generate)

    # Entry point
    graph.add_edge(START, 'retrieve')

    # retrieve → grade_docs (always)
    graph.add_edge('retrieve', 'grade_docs')

    # grade_docs → [conditional route]
    graph.add_conditional_edges(
        'grade_docs',
        route_after_grading,
        {
            'generate':      'generate',
            'rewrite_query': 'rewrite_query',
        },
    )

    # rewrite_query → retrieve (loop back)
    graph.add_edge('rewrite_query', 'retrieve')

    # generate → END
    graph.add_edge('generate', END)

    return graph.compile()


# ─────────────────────────────────────────────────────────────────
#  RAGAgent  — public interface
# ─────────────────────────────────────────────────────────────────

class RAGAgent:
    """
    Public interface for the LangGraph CRAG agent.
    Called from rag_service.py.
    """

    async def run(
        self,
        question:    str,
        document_id: str,
        filename:    str,
        db,
        top_k:       int = 5,
    ) -> dict:
        """
        Run the CRAG agent and return answer + citations.
        """
        graph = build_rag_graph(db)

        initial_state: RAGState = {
            'question':       question,
            'document_id':    document_id,
            'filename':       filename,
            'top_k':          top_k,
            'messages':       [],
            'retrieved_docs': [],
            'good_docs':      [],
            'context':        '',
            'query_rewritten': False,
            'iterations':     0,
            'answer':         '',
            'citations':      [],
        }

        logger.info(f'[RAGAgent] Starting CRAG | doc={document_id} | q="{question[:60]}"')

        final_state = await graph.ainvoke(initial_state)

        logger.info(
            f'[RAGAgent] Complete | iterations={final_state["iterations"]} | '
            f'citations={len(final_state["citations"])} | rewritten={final_state["query_rewritten"]}'
        )

        return {
            'answer':         final_state['answer'],
            'citations':      final_state['citations'],
            'iterations':     final_state['iterations'],
            'query_rewritten': final_state['query_rewritten'],
            'chunks_used':    len(final_state.get('good_docs') or final_state.get('retrieved_docs', [])),
        }


rag_agent = RAGAgent()