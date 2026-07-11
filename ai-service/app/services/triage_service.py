from app.core.config import settings
from app.core.logging import get_logger
from app.core.prompts import build_triage_prompt
from app.models.llama import generate
from app.schemas.response import TriageResponse
from app.utils.parser import extract_json
from app.utils.retry import retry_async
from app.utils.validator import validate_triage_payload

logger = get_logger(__name__)


def _preprocess(symptoms: str) -> str:
    return " ".join(symptoms.split())


def _fallback_response() -> TriageResponse:
    return TriageResponse(
        priority=settings.fallback_priority,
        reason=settings.fallback_reason,
        confidence=settings.fallback_confidence,
        factors=[],
        risk="Medium",
        department="General Medicine",
        summary=settings.fallback_reason,
    )


async def _infer_once(prompt: str) -> TriageResponse:
    raw_text = await generate(prompt)
    payload = extract_json(raw_text)
    validated = validate_triage_payload(payload)
    return TriageResponse(**validated)


async def run_triage(symptoms: str) -> TriageResponse:
    """Estimate patient urgency from symptoms.

    Never raises: the booking flow upstream must never block on the AI
    service being offline or returning garbage, so any failure after
    retries collapses into the documented neutral-priority fallback.
    """
    clean_symptoms = _preprocess(symptoms)
    prompt = build_triage_prompt(clean_symptoms)

    try:
        return await retry_async(
            lambda: _infer_once(prompt),
            attempts=settings.max_retries + 1,
            backoff_seconds=settings.retry_backoff_seconds,
        )
    except Exception as exc:  # noqa: BLE001 - final safety net for the triage endpoint
        logger.error("Triage inference failed after retries, using fallback: %s", exc)
        return _fallback_response()
