from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from app.graph.state import AgentState
from app.graph.nodes import character_node
from app.graph.tools.retrieval import retrieve_context
from app.logger import setup_logger

logger = setup_logger().bind(name="GRAPH")


def build_graph(persona: str):
    """
    Builds a persona-based Office agent graph.
    One graph, one user thread, persona-isolated memory.
    """
    logger.info(f"Building graph for persona: {persona}")

    graph = StateGraph(AgentState)

    graph.add_node("persona", lambda state: character_node(state, persona))

    tool_node = ToolNode(tools=[retrieve_context])
    graph.add_node("retrieval_tool", tool_node)

    graph.set_entry_point("persona")

    graph.add_conditional_edges(
        "persona",
        tool_node.condition,
        {
            "retrieval_tool": "retrieval_tool",
            END: END,
        },
    )

    graph.add_edge(
        "retrieval_tool",
        "persona",
    )

    compiled = graph.compile()

    logger.success("Graph compiled")

    return compiled
