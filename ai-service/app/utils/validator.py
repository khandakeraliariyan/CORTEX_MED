from typing import Any, Dict, List


class TriageValidationError(ValueError):
    """Raised when the parsed triage payload cannot be coerced into a valid response."""


def _coerce_priority(value: Any) -> int:
    try:
        priority = int(value)
    except (TypeError, ValueError) as exc:
        raise TriageValidationError(f"priority is not an integer: {value!r}") from exc

    if priority < 1 or priority > 5:
        raise TriageValidationError(f"priority out of range 1-5: {priority}")
    return priority


def _coerce_confidence(value: Any) -> float:
    try:
        confidence = float(value)
    except (TypeError, ValueError) as exc:
        raise TriageValidationError(f"confidence is not a number: {value!r}") from exc

    # Some models return a 0-100 scale despite instructions; normalize it.
    if confidence > 1:
        confidence = confidence / 100

    return max(0.0, min(1.0, confidence))


def _coerce_factors(value: Any) -> List[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()][:4]


def validate_triage_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    if "priority" not in payload:
        raise TriageValidationError("missing 'priority' field")

    return {
        "priority": _coerce_priority(payload.get("priority")),
        "reason": str(payload.get("reason") or "No reason provided.").strip(),
        "confidence": _coerce_confidence(payload.get("confidence", 0)),
        "factors": _coerce_factors(payload.get("factors", [])),
    }
