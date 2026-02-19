from typing_extensions import Literal
from langgraph.graph import END

from app.graph.state import AgentState
from langchain_core.messages import AIMessage

def should_summarize_conversation(
    state: AgentState,
) -> Literal["summarize_conversation_node", "__end__", "final_response_node"]:
    messages = state.get("messages", [])

    if len(messages) > 20:
        return "summarize_conversation_node"

    return "final_response_node"


def retrieval_guard_condition(
    state: AgentState,
) -> Literal["retrieve_context", "__end__"]:

    messages = state.get("messages", [])
    attempts = state.get("retrieval_attempts", 0)
    max_attempts = state.get("max_retrieval_attempts", 3)

    if not messages:
        return "__end__"

    last_message = messages[-1]

    # If model is requesting tool AND under retry limit
    if (
        isinstance(last_message, AIMessage)
        and last_message.tool_calls
        and attempts < max_attempts
    ):
        return "retrieve_context"

    # Otherwise stop
    return "__end__"
