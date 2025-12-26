from app.state import AgentState
from app.llm import get_llm
from app.config import load_config
from app.logger import setup_logger

logger = setup_logger().bind(name="NODES")
llm = get_llm()


def llm_node(state: AgentState) -> AgentState:
    """
    Node that uses the LLM to process the current state.

    Args:
        state (AgentState): Current agent state.

    Returns:
        AgentState: Updated agent state with LLM response.
    """
    logger.info("LLM node execution started")

    prompt = (
        "You are a helpful assistant.\n\n"
        f"User input:\n{state.user_input}\n\n"
        "Respond clearly and concisely."
    )

    response = llm.generate(prompt)

    logger.success("LLM node execution completed")

    return state.model_copy(update={"response": response})
