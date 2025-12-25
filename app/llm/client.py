from abc import ABC, abstractmethod


class LLMClient(ABC):
    """
    Abstract interface for all LLM clients.
    """

    @abstractmethod
    def generate(self, prompt: str) -> str:
        """
        Generates a response from the LLM.

        Args:
            prompt (str): Input prompt.

        Returns:
            str: Generated text.
        """
        pass
