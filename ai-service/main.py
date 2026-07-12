from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.triage import router as triage_router
from app.core.config import settings
from app.core.logging import configure_logging

configure_logging()

app = FastAPI(
    title="Cortex AI Triage Engine (CATE)",
    description=(
        "Standalone AI microservice that estimates patient urgency from "
        "symptoms. It assists receptionists and doctors by prioritizing "
        "the consultation queue - it does not diagnose, prescribe, or "
        "replace a doctor."
    ),
    version="1.0.0",
)

origins = ["*"] if settings.cors_origins == "*" else settings.cors_origins.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(triage_router)


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "llm_backend": "groq",
        "llm_model": settings.groq_model,
    }
