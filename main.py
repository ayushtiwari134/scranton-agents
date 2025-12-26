from dotenv import load_dotenv

load_dotenv()

from app.graph.graph import build_graph
from app.graph.state import AgentState
from app.logger import setup_logger

logger = setup_logger().bind(name="MAIN")


def main():
    logger.info("Starting Office Agents app")

    graph = build_graph(character="michael")

    state = AgentState(user_input="Why do you think you are a great manager?")

    final_state = graph.invoke(state, config={"thread_id": "user_1"})

    logger.success(f"Michael says: {final_state['response']}")


if __name__ == "__main__":
    main()
