from google import genai
from app.llm.client import LLMClient
from app.logger import setup_logger

logger = setup_logger().bind(name="LLM")


class GeminiClient(LLMClient):
    """
    Gemini LLM client using the new google.genai SDK.
    """

    def __init__(self, api_key: str, model: str, temperature: float):
        """
        Initializes the Gemini client.

        Args:
            api_key (str): Gemini API key.
            model (str): Gemini model identifier.
            temperature (float): Sampling temperature.
        """
        self.client = genai.Client(api_key=api_key)
        self.model = model
        self.temperature = temperature

        logger.success(f"Gemini initialized | model={model} | temp={temperature}")

    def generate(self, prompt: str) -> str:
        """
        Generates text using Gemini.

        Args:
            prompt (str): Input prompt.

        Returns:
            str: Generated response text.
        """
        logger.info("Sending prompt to Gemini")

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config={"temperature": self.temperature},
        )

        text = response.text.strip()

        logger.success("Gemini response received")

        return text
