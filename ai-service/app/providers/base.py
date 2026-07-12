from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Interface every inference backend must implement.

    Swapping providers (Groq, Ollama, vLLM, ...) means writing one new
    class here - nothing in services/, schemas/, or utils/ needs to change.
    """

    @abstractmethod
    async def generate_triage(self, prompt: str) -> str:
        """Send the triage prompt to the backend and return its raw text output."""
