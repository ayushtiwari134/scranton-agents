from langgraph.graph import StateGraph, END
from app.state import AgentState
from app.graph.nodes import llm_node
from app.logger import setup_logger

logger = setup_logger().bind(name='GRAPH')

def build_graph() -> StateGraph:
    logger.info("Building the graph...")

    graph = StateGraph(AgentState)
    graph.add_node("llm", llm_node)
    graph.set_entry_point("llm")
    graph.add_edge("llm", END)

    logger.success("Graph built successfully")

    return graph.compile()
