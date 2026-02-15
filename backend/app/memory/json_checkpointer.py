import json
import os
from typing import Any, Dict, List, Optional

from app.memory.serializer import to_json_safe


class JsonCheckpointer:
    """
    LangGraph-compatible synchronous and asynchronous JSON checkpointer.
    """

    def __init__(self, path: str = "memory.json"):
        self.path = path

        if not os.path.exists(self.path):
            with open(self.path, "w") as f:
                json.dump({}, f)

    def _read(self) -> Dict[str, Dict[str, Any]]:
        with open(self.path, "r") as f:
            return json.load(f)

    def _write(self, data: Dict[str, Dict[str, Any]]) -> None:
        with open(self.path, "w") as f:
            json.dump(data, f, indent=2)

    def get(self, thread_id: str) -> Optional[Dict[str, Any]]:
        data = self._read()
        entry = data.get(thread_id)
        if entry is None:
            return None
        return entry.get("state")

    async def aget(self, thread_id: str) -> Optional[Dict[str, Any]]:
        return self.get(thread_id)

    def put(self, thread_id: str, state: Dict[str, Any], version: int) -> None:
        data = self._read()
        entry = data.get(thread_id, {})
        data[thread_id] = {
            "version": version,
            "state": to_json_safe(state),
            "writes": entry.get("writes", []),
        }
        self._write(data)

    async def aput(self, thread_id: str, state: Dict[str, Any], version: int) -> None:
        self.put(thread_id, state, version)

    def put_writes(self, thread_id: str, writes: List[Any], version: int) -> None:
        data = self._read()
        entry = data.get(thread_id, {})
        data[thread_id] = {
            "version": version,
            "state": entry.get("state"),
            "writes": to_json_safe(writes),
        }
        self._write(data)

    async def aput_writes(
        self, thread_id: str, writes: List[Any], version: int
    ) -> None:
        self.put_writes(thread_id, writes, version)

    def get_next_version(self, thread_id: str) -> int:
        data = self._read()
        entry = data.get(thread_id)
        if entry is None:
            return 1
        return entry.get("version", 0) + 1

    def list(self, thread_id: str) -> List[int]:
        data = self._read()
        entry = data.get(thread_id)
        if entry is None:
            return []
        return [entry.get("version", 0)]

    async def alist(self, thread_id: str) -> List[int]:
        return self.list(thread_id)

    def delete(self, thread_id: str) -> None:
        data = self._read()
        if thread_id in data:
            del data[thread_id]
            self._write(data)

    async def adelete(self, thread_id: str) -> None:
        self.delete(thread_id)
