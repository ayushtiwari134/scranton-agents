import os
from app.config import load_config
from app.llm.client import LLMClient
from app.llm.providers import GeminiClient

def get_llm() -> LLMClient:
    """
    Factory method for initializing the configured LLM client.

    Returns:
        LLMClient: Instantiated LLM client.
    """
    config = load_config()
    llm_cfg = config.llm

    if llm_cfg.provider == "gemini":
        return GeminiClient(
            api_key=os.environ["GEMINI_API_KEY"],
            model=llm_cfg.model,
            temperature=llm_cfg.temperature,
        )

    raise ValueError(f"Unsupported LLM provider: {llm_cfg.provider}")
