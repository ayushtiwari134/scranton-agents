from langgraph.graph import START, END, StateGraph
from langgraph.prebuilt import tools_condition
from app.graph.conditions import retrieval_guard_condition

from app.graph.state import AgentState
from app.graph.nodes import (
    conversation_node,
    retrieved_context_summary_node,
    retriever_node,
)


def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("conversation_node", conversation_node)
    graph.add_node("retrieve_context", retriever_node)
    graph.add_node("summarize_context_node", retrieved_context_summary_node)

    graph.add_edge(START, "conversation_node")

    graph.add_conditional_edges(
        "conversation_node",
        retrieval_guard_condition,
        {
            "retrieve_context": "retrieve_context",
            "__end__": END,
        },
    )

    graph.add_edge("retrieve_context", "summarize_context_node")
    graph.add_edge("summarize_context_node", "conversation_node")

    return graph
