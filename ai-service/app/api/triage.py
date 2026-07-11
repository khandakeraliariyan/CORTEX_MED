from fastapi import APIRouter

from app.schemas.request import TriageRequest
from app.schemas.response import TriageResponse
from app.services.triage_service import run_triage

router = APIRouter()


@router.post("/triage", response_model=TriageResponse)
async def triage(request: TriageRequest) -> TriageResponse:
    return await run_triage(request.symptoms)
