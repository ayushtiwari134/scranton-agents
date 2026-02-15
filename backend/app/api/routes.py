from typing import Dict, Any, Optional
from pathlib import Path
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Header, HTTPException
from langchain_core.messages import AIMessageChunk
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from app.logger import setup_logger
from app.api.schemas import ChatRequest, ChatResponse
from app.graph.graph import build_graph
import os

logger = setup_logger().bind(name="ROUTES")

router = APIRouter(prefix="/chat", tags=["chat"])

BASE_DIR = Path(__file__).resolve().parents[2]
DB_PATH = (BASE_DIR / "memory.sqlite").resolve()


@router.post("/", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
) -> ChatResponse:
    if x_user_id is None:
        raise HTTPException(status_code=400, detail="X-User-Id header is required")

    graph = build_graph()

    thread_id = f"{x_user_id}:{payload.persona}:{payload.session_id}"

    config = {"configurable": {"thread_id": thread_id}}

    result = await graph.ainvoke(
        {
            "user_input": payload.message,
            "persona": payload.persona,
        },
        config=config,
    )

    return ChatResponse(
        response=result.get("final_response", ""),
        session_id=payload.session_id,
        persona=payload.persona,
        metadata={},
    )


@router.websocket("/ws")
async def chat_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    logger.info(f"CWD: {os.getcwd()}")
    try:
        logger.info(f"connstring:sqlite+aiosqlite:///{DB_PATH.as_posix()}")
        async with AsyncSqliteSaver.from_conn_string(str(DB_PATH)) as checkpointer:
            graph = build_graph().compile(checkpointer=checkpointer)

            while True:
                payload = await websocket.receive_json()

                user_id = payload.get("user_id")
                persona = payload.get("persona")
                message = payload.get("message")
                session_id = payload.get("session_id")

                if user_id is None or persona is None or message is None:
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": "user_id, persona, message required",
                        }
                    )
                    continue

                thread_id = f"{user_id}:{persona}:{session_id}"

                config = {"configurable": {"thread_id": thread_id}}

                async for chunk, meta in graph.astream(
                    input={
                        "user_input": message,
                        "persona": persona,
                    },
                    config=config,
                    stream_mode="messages",
                ):
                    if meta.get("langgraph_node") == "conversation_node" and isinstance(
                        chunk, AIMessageChunk
                    ):
                        if chunk.content:
                            await websocket.send_json(
                                {"type": "token", "content": chunk.content}
                            )

                await websocket.send_json(
                    {
                        "type": "done",
                        "persona": persona,
                        "session_id": session_id,
                    }
                )

    except WebSocketDisconnect:
        return
