import httpx

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class LLMUnavailableError(Exception):
    """Raised when the underlying LLM backend cannot be reached or errors out."""


async def _generate_ollama(client: httpx.AsyncClient, prompt: str) -> str:
    response = await client.post(
        f"{settings.llm_base_url}/api/generate",
        json={
            "model": settings.llm_model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": settings.llm_temperature},
        },
    )
    response.raise_for_status()
    data = response.json()
    return data.get("response", "")


async def _generate_vllm(client: httpx.AsyncClient, prompt: str) -> str:
    # vLLM (and most ROCm-served endpoints) expose an OpenAI-compatible API.
    response = await client.post(
        f"{settings.llm_base_url}/v1/chat/completions",
        json={
            "model": settings.llm_model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": settings.llm_temperature,
        },
    )
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]


async def generate(prompt: str) -> str:
    """Call the configured LLM backend and return its raw text output.

    Raises LLMUnavailableError on any network/HTTP failure so callers can
    retry or fall back without needing to know backend-specific exceptions.
    """
    try:
        async with httpx.AsyncClient(timeout=settings.llm_timeout_seconds) as client:
            if settings.llm_backend == "vllm":
                return await _generate_vllm(client, prompt)
            return await _generate_ollama(client, prompt)
    except (httpx.HTTPError, KeyError, ValueError) as exc:
        logger.warning("LLM backend (%s) call failed: %s", settings.llm_backend, exc)
        raise LLMUnavailableError(str(exc)) from exc
