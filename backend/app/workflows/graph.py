"""
app/workflows/graph.py
──────────────────────────
Builds the LangGraph state machine described in the architecture doc:

    START → load_data → matching → evidence → evaluation → decision
                                                                │
                                                    ┌───────────┴───────────┐
                                                    ▼                       ▼
                                              shortlist               review_reject
                                                    │                       │
                                                    └───────────┬───────────┘
                                                                ▼
                                                               END

`db` is bound into each node via a closure so LangGraph's node signature
stays `(state) -> dict` while our nodes still get DB access — LangGraph
itself never needs to know about SQLAlchemy.
"""

from langgraph.graph import StateGraph, END

from app.workflows import nodes
from app.workflows.state import RecruitmentState


def build_recruitment_graph(db):
    graph = StateGraph(RecruitmentState)

    # Use async-compatible node setup by creating wrapper functions
    async def load_data_wrapper(state):
        return await nodes.load_data_node(state, db)

    async def matching_wrapper(state):
        return await nodes.matching_node(state, db)

    async def evidence_wrapper(state):
        return await nodes.evidence_node(state, db)

    async def evaluation_wrapper(state):
        return await nodes.evaluation_node(state, db)

    async def decision_wrapper(state):
        return await nodes.decision_node(state, db)

    async def shortlist_wrapper(state):
        return await nodes.shortlist_node(state, db)

    async def review_reject_wrapper(state):
        return await nodes.review_reject_node(state, db)

    graph.add_node("load_data", load_data_wrapper)
    graph.add_node("matching", matching_wrapper)
    graph.add_node("evidence", evidence_wrapper)
    graph.add_node("evaluation", evaluation_wrapper)
    graph.add_node("decision", decision_wrapper)
    graph.add_node("shortlist", shortlist_wrapper)
    graph.add_node("review_reject", review_reject_wrapper)

    graph.set_entry_point("load_data")
    graph.add_edge("load_data", "matching")
    graph.add_edge("matching", "evidence")
    graph.add_edge("evidence", "evaluation")
    graph.add_edge("evaluation", "decision")

    graph.add_conditional_edges(
        "decision",
        nodes.route_after_decision,
        {"shortlist": "shortlist", "review_reject": "review_reject"},
    )
    graph.add_edge("shortlist", END)
    graph.add_edge("review_reject", END)

    return graph.compile()


async def run_recruitment_workflow(db, candidate_id: str, job_id: str) -> RecruitmentState:
    compiled_graph = build_recruitment_graph(db)
    initial_state: RecruitmentState = {"candidate_id": candidate_id, "job_id": job_id}
    final_state = await compiled_graph.ainvoke(initial_state)
    return final_state
