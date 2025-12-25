import google.generativeai as genai
from app.llm.client import LLMClient
from app.logger import setup_logger

logger = setup_logger().bind(name="LLM")


class GeminiClient(LLMClient):
    """
    Gemini LLM client implementation.
    """

    def __init__(self, api_key: str, model: str, temperature: float):
        """
        Initializes the Gemini client.

        Args:
            api_key (str): Gemini API key.
            model (str): Model identifier.
            temperature (float): Sampling temperature.
        """
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model)
        self.temperature = temperature

        logger.success(f"Gemini initialized | model={model} | temp={temperature}")

    def generate(self, prompt: str) -> str:
        """
        Sends a prompt to Gemini and returns the generated text.
        """
        logger.info("Sending prompt to Gemini")

        response = self.model.generate_content(
            prompt,
            generation_config={"temperature": self.temperature},
        )

        text = response.text.strip()

        logger.success("Gemini response received")

        return text
