from typing import Any, Dict, List

from app.core.prompts import DEPARTMENTS, RISK_LEVELS

# Safety net used when the model omits/invents a risk level - derived from priority.
_PRIORITY_TO_RISK = {1: "Critical", 2: "High", 3: "Medium", 4: "Low", 5: "Low"}

_DEPARTMENT_LOOKUP = {name.lower(): name for name in DEPARTMENTS}
_RISK_LOOKUP = {name.lower(): name for name in RISK_LEVELS}


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


def _coerce_risk(value: Any, priority: int) -> str:
    candidate = str(value or "").strip().lower()
    return _RISK_LOOKUP.get(candidate, _PRIORITY_TO_RISK[priority])


def _coerce_department(value: Any) -> str:
    candidate = str(value or "").strip().lower()
    return _DEPARTMENT_LOOKUP.get(candidate, "General Medicine")


def _coerce_summary(value: Any, reason: str) -> str:
    summary = str(value or "").strip()
    return summary if summary else reason


def validate_triage_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    if "priority" not in payload:
        raise TriageValidationError("missing 'priority' field")

    priority = _coerce_priority(payload.get("priority"))
    reason = str(payload.get("reason") or "No reason provided.").strip()

    return {
        "priority": priority,
        "reason": reason,
        "confidence": _coerce_confidence(payload.get("confidence", 0)),
        "factors": _coerce_factors(payload.get("factors", [])),
        "risk": _coerce_risk(payload.get("risk"), priority),
        "department": _coerce_department(payload.get("department")),
        "summary": _coerce_summary(payload.get("summary"), reason),
    }
