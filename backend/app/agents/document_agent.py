"""
app/agents/document_agent.py  ← NEW FILE
──────────────────────────────────────────
LangGraph multi-tool document agent.

This agent decides WHICH tool to use based on the request:
  - search_document  → vector similarity search
  - answer_question  → RAG Q&A
  - summarize        → hierarchical summarisation
  - extract_fields   → structured data extraction

Graph:
  START → classify_intent → [route] → tool_node → format_output → END

Why a tool-using agent vs direct service calls?
  - Single endpoint: user asks anything about a document
  - Agent decides what to do (no need for user to pick the right endpoint)
  - Composable: agent can call multiple tools in sequence
  - Extensible: add new tools without changing the API
"""

import logging
from typing import TypedDict, Annotated, Literal
from operator import add

from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langgraph.graph import StateGraph, END, START

from app.core.langchain_setup import json_llm
from app.core.config import settings

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────
#  Agent State
# ─────────────────────────────────────────────────────────────────

class DocumentAgentState(TypedDict):
    # Input
    user_input:  str
    document_id: str
    filename:    str

    # Internal
    messages:  Annotated[list[BaseMessage], add]
    intent:    str           # classified intent
    tool_args: dict          # args to pass to the tool

    # Output
    result: dict


# ─────────────────────────────────────────────────────────────────
#  Intent Classification Chain
# ─────────────────────────────────────────────────────────────────

CLASSIFY_SYSTEM = """You are a document assistant that classifies user requests.
Classify the intent and return JSON only.

Intents:
  answer_question  → user asks a specific question about the document
  summarize        → user wants a summary or overview
  extract_fields   → user wants specific data fields extracted
  search           → user wants to search for passages or text

Return:
{{"intent": "answer_question|summarize|extract_fields|search",
  "fields": ["field1", "field2"],   // only for extract_fields
  "query": "refined query"          // for answer_question and search
}}"""

classify_prompt = ChatPromptTemplate.from_messages([
    ('system', CLASSIFY_SYSTEM),
    ('human', 'User request: {user_input}'),
])

classify_chain = classify_prompt | json_llm | JsonOutputParser()


# ─────────────────────────────────────────────────────────────────
#  Node 1: Classify Intent
# ─────────────────────────────────────────────────────────────────

async def classify_intent_node(state: DocumentAgentState) -> dict:
    """Use LLM to classify what the user wants to do with the document."""
    logger.info(f'[DocAgent] classify_intent | "{state["user_input"][:60]}"')

    try:
        classification = await classify_chain.ainvoke({'user_input': state['user_input']})
    except Exception as e:
        logger.warning(f'[DocAgent] classification failed: {e} — defaulting to answer_question')
        classification = {'intent': 'answer_question', 'query': state['user_input']}

    intent = classification.get('intent', 'answer_question')
    logger.info(f'[DocAgent] intent → {intent}')

    return {
        'intent':    intent,
        'tool_args': classification,
        'messages':  [AIMessage(content=f'Intent classified: {intent}')],
    }


# ─────────────────────────────────────────────────────────────────
#  Node 2: Tool Nodes
# ─────────────────────────────────────────────────────────────────

async def answer_question_node(state: DocumentAgentState, db) -> dict:
    """Run the CRAG agent to answer a specific question."""
    from app.agents.rag_agent import rag_agent

    question = state['tool_args'].get('query', state['user_input'])
    result   = await rag_agent.run(
        question    = question,
        document_id = state['document_id'],
        filename    = state['filename'],
        db          = db,
    )
    return {
        'result':   result,
        'messages': [AIMessage(content=f'Answer generated. Citations: {len(result["citations"])}')],
    }


async def summarize_node(state: DocumentAgentState, db) -> dict:
    """Run hierarchical summarisation."""
    from app.services.summary_service import summary_service

    summary = await summary_service.summarize(state['document_id'], db)
    return {
        'result': {
            'type':              'summary',
            'executive_summary': summary.executive_summary,
            'key_points':        summary.key_points,
            'important_facts':   summary.important_facts,
            'important_numbers': summary.important_numbers,
            'risks':             summary.risks,
            'conclusion':        summary.conclusion,
        },
        'messages': [AIMessage(content='Summary generated.')],
    }


async def extract_fields_node(state: DocumentAgentState, db) -> dict:
    """Run structured field extraction."""
    from app.services.extraction_service import extraction_service

    fields = state['tool_args'].get('fields', [])
    if not fields:
        # Extract common fields if none specified
        fields = ['company_name', 'date', 'total_amount', 'author', 'title']

    result = await extraction_service.extract(state['document_id'], fields, db)
    return {
        'result': {
            'type':   'extraction',
            'fields': {
                k: {'value': v.value, 'status': v.status}
                for k, v in result.fields.items()
            },
        },
        'messages': [AIMessage(content=f'Extracted {len(fields)} fields.')],
    }


async def search_node(state: DocumentAgentState, db) -> dict:
    """Run vector similarity search."""
    from app.services.vector_search_service import vector_search_service

    query   = state['tool_args'].get('query', state['user_input'])
    results = await vector_search_service.search(
        query       = query,
        document_id = state['document_id'],
        db          = db,
        top_k       = settings.TOP_K,
    )
    return {
        'result': {
            'type':    'search',
            'query':   query,
            'results': [
                {
                    'content':     r.content,
                    'page_number': r.page_number,
                    'similarity':  r.similarity,
                }
                for r in results
            ],
        },
        'messages': [AIMessage(content=f'Found {len(results)} results.')],
    }


# ─────────────────────────────────────────────────────────────────
#  Routing
# ─────────────────────────────────────────────────────────────────

def route_by_intent(state: DocumentAgentState) -> Literal[
    'answer_question', 'summarize', 'extract_fields', 'search'
]:
    intent = state.get('intent', 'answer_question')
    routes = {
        'answer_question': 'answer_question',
        'summarize':       'summarize',
        'extract_fields':  'extract_fields',
        'search':          'search',
    }
    return routes.get(intent, 'answer_question')


# ─────────────────────────────────────────────────────────────────
#  Build Graph
# ─────────────────────────────────────────────────────────────────

def build_document_agent_graph(db):
    """Build and compile the multi-tool document agent graph."""

    # Wrap nodes with db dependency
    async def _classify(state):  return await classify_intent_node(state)
    async def _answer(state):    return await answer_question_node(state, db)
    async def _summarize(state): return await summarize_node(state, db)
    async def _extract(state):   return await extract_fields_node(state, db)
    async def _search(state):    return await search_node(state, db)

    graph = StateGraph(DocumentAgentState)

    graph.add_node('classify_intent',  _classify)
    graph.add_node('answer_question',  _answer)
    graph.add_node('summarize',        _summarize)
    graph.add_node('extract_fields',   _extract)
    graph.add_node('search',           _search)

    graph.add_edge(START, 'classify_intent')

    graph.add_conditional_edges(
        'classify_intent',
        route_by_intent,
        {
            'answer_question': 'answer_question',
            'summarize':       'summarize',
            'extract_fields':  'extract_fields',
            'search':          'search',
        },
    )

    for node in ['answer_question', 'summarize', 'extract_fields', 'search']:
        graph.add_edge(node, END)

    return graph.compile()


# ─────────────────────────────────────────────────────────────────
#  DocumentAgent — public interface
# ─────────────────────────────────────────────────────────────────

class DocumentAgent:

    async def run(
        self,
        user_input:  str,
        document_id: str,
        filename:    str,
        db,
    ) -> dict:
        graph = build_document_agent_graph(db)

        initial_state: DocumentAgentState = {
            'user_input':  user_input,
            'document_id': document_id,
            'filename':    filename,
            'messages':    [],
            'intent':      '',
            'tool_args':   {},
            'result':      {},
        }

        logger.info(f'[DocAgent] Starting | doc={document_id}')
        final_state = await graph.ainvoke(initial_state)
        logger.info(f'[DocAgent] Complete | intent={final_state["intent"]}')

        return {
            'intent': final_state['intent'],
            'result': final_state['result'],
        }


document_agent = DocumentAgent()