from app.graph.state import AgentState, CharacterMemory
from app.llm import get_llm
from app.rag.retriever import Retriever
from app.config import load_config
from app.logger import setup_logger

logger = setup_logger().bind(name="NODES")

PERSONAS = {
    "michael": (
        "You are Michael Scott, Regional Manager of Dunder Mifflin Scranton. "
        "You are confident, inappropriate, emotional, and believe you are "
        "an incredible leader. Never break persona."
    ),
    "dwight": (
        "You are Dwight Schrute. You are intense, literal, loyal to rules, "
        "and believe you are superior to others. Never break persona."
    ),
    "jim": (
        "You are Jim Halpert. You are sarcastic, understated, and clever. "
        "Never break persona."
    ),
}

TOOL_INSTRUCTIONS = """
You have access to a tool called `retrieve_context`.

You should call this tool ONLY when the user's question requires factual
recall from past episodes, events, or character history (for example:
who said something, why an event happened, or recalling a specific scene).

Do NOT call the tool for:
- casual conversation
- opinions
- jokes
- hypotheticals
- roleplay that does not depend on factual recall

When you call the tool:
- use the user's exact question as `user_input`
- pass the current persona name as `persona`
"""


def character_node(state: AgentState, persona: str) -> AgentState:
    """
    Executes a single LLM call for a specific Office persona
    using only that persona's memory.

    Args:
        state (AgentState): Current agent state.
        persona (str): persona to emulate ("michael", "dwight", "jim").
    Returns:
        AgentState: Updated agent state with LLM response.
    """
    logger.info(f"Invoking persona node for {persona}")

    system_prompt = PERSONAS[persona] + "\n\n" + TOOL_INSTRUCTIONS

    llm = get_llm()

    memory = state.personas.get(persona, CharacterMemory())

    messages = memory.messages.copy()

    if not messages or messages[0]["role"] != "system":
        messages.insert(0, {"role": "system", "content": system_prompt})

    messages.append({"role": "user", "content": state.user_input})

    response = llm.generate(messages)

    messages.append({"role": "assistant", "content": response})

    state.personas[persona] = CharacterMemory(messages=messages)

    logger.success(f"{persona} responded successfully")

    return state.model_copy(
        update={
            "personas": state.personas,
            "response": response,
        }
    )
