import json
import os
from typing import Optional
from app.memory.serializer import to_json_safe


class JsonCheckpointer:
    """
    Hierarchical JSON-based memory store.

    Structure:
    {
        user_id: {
            persona: {
                session_id: state
            }
        }
    }
    """

    def __init__(self, path: str = "memory.json"):
        self.path = path

        if not os.path.exists(self.path):
            self._write({})

    def _read(self) -> dict:
        """
        Safely read JSON memory file.
        """
        try:
            with open(self.path, "r") as f:
                content = f.read().strip()
                if not content:
                    return {}
                return json.loads(content)
        except (json.JSONDecodeError, FileNotFoundError):
            return {}

    def _write(self, data: dict):
        """
        Safely write JSON memory file.
        """
        with open(self.path, "w") as f:
            json.dump(data, f, indent=2)

    def load(self, user_id: str, persona: str, session_id: str) -> Optional[dict]:
        data = self._read()
        return data.get(user_id, {}).get(persona, {}).get(session_id)

    def save(self, user_id: str, persona: str, session_id: str, state: dict):
        data = self._read()

        data.setdefault(user_id, {})
        data[user_id].setdefault(persona, {})
        data[user_id][persona][session_id] = to_json_safe(state)

        self._write(data)
