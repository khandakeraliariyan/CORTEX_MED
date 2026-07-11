import json
import re
from typing import Any, Dict

_JSON_OBJECT_PATTERN = re.compile(r"\{.*\}", re.DOTALL)


class JSONParseError(ValueError):
    """Raised when no valid JSON object can be extracted from the LLM output."""


def extract_json(raw_text: str) -> Dict[str, Any]:
    """Pull a single JSON object out of raw LLM text.

    Models occasionally wrap the JSON in markdown fences or add stray
    commentary despite instructions, so this looks for the first balanced
    `{...}` block rather than assuming the whole string is clean JSON.
    """
    text = raw_text.strip()
    text = re.sub(r"^```(json)?|```$", "", text, flags=re.MULTILINE).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    match = _JSON_OBJECT_PATTERN.search(text)
    if not match:
        raise JSONParseError(f"No JSON object found in LLM output: {raw_text[:200]!r}")

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError as exc:
        raise JSONParseError(f"Malformed JSON in LLM output: {exc}") from exc
