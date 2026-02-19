from app.graph.graph import build_graph
import asyncio


async def main():
    graph = build_graph().compile()

    png_bytes = graph.get_graph().draw_mermaid_png()

    with open("langgraph.png", "wb") as f:
        f.write(png_bytes)

    print("Saved graph as langgraph.png")

    thread_id = "ayush134:jim:1"
    config = {"configurable": {"thread_id": thread_id}}

    result = await graph.ainvoke(
        {
            "user_input": "hey wassup?",
            "persona": "jim",
        },
        config=config,
    )

    print(result)


asyncio.run(main())
