from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "*"

    # LLM backend: "ollama" (dev) or "vllm" (AMD/ROCm hackathon demo).
    # Both expose an OpenAI/Ollama-compatible HTTP API, so only base_url + model change.
    llm_backend: str = "ollama"
    llm_base_url: str = "http://localhost:11434"
    llm_model: str = "llama3.1:8b-instruct-q4_0"

    # Inference behaviour. This runs synchronously in the booking flow, so
    # keep the worst case (timeout * attempts + backoff) well under the
    # Express-side axios timeout - a receptionist shouldn't wait a minute
    # for a triage result.
    llm_timeout_seconds: float = 8.0
    llm_temperature: float = 0.2
    max_retries: int = 1
    retry_backoff_seconds: float = 0.5

    # Triage fallback used when the LLM is unavailable or returns unusable output.
    fallback_priority: int = 3
    fallback_reason: str = "AI unavailable. Default priority assigned."
    fallback_confidence: float = 0.0


settings = Settings()
