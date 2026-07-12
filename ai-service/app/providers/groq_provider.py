from groq import AsyncGroq

from app.core.config import settings
from app.core.logging import get_logger
from app.providers.base import LLMProvider

logger = get_logger(__name__)


class LLMUnavailableError(Exception):
    """Raised when the underlying LLM backend cannot be reached or errors out."""


class GroqProvider(LLMProvider):
    def __init__(self) -> None:
        self._client = AsyncGroq(api_key=settings.groq_api_key)

    async def generate_triage(self, prompt: str) -> str:
        try:
            response = await self._client.chat.completions.create(
                model=settings.groq_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=settings.llm_temperature,
                timeout=settings.llm_timeout_seconds,
            )
            return response.choices[0].message.content or ""
        except Exception as exc:  # noqa: BLE001 - normalize any SDK failure to one exception type
            logger.warning("Groq call failed: %s", exc)
            raise LLMUnavailableError(str(exc)) from exc


provider = GroqProvider()
