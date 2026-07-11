from typing import List

from pydantic import BaseModel, Field, field_validator


class TriageResponse(BaseModel):
    priority: int = Field(..., ge=1, le=5)
    reason: str
    confidence: float = Field(..., ge=0, le=1)
    factors: List[str] = Field(default_factory=list)

    @field_validator("factors")
    @classmethod
    def limit_factors(cls, value: List[str]) -> List[str]:
        return [item.strip() for item in value if item and item.strip()][:4]
