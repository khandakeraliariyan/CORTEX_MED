# Cortex AI Triage Engine (CATE)

Standalone AI microservice that estimates patient urgency from symptoms. It
assists receptionists and doctors by prioritizing the consultation queue - it
does **not** diagnose diseases, prescribe medicine, recommend treatment, or
replace a doctor.

## Folder structure

```
ai-service/
├── app/
│   ├── api/
│   │   └── triage.py          POST /triage route
│   ├── core/
│   │   ├── config.py          env-driven settings
│   │   ├── prompts.py         system prompt + prompt builder
│   │   └── logging.py
│   ├── services/
│   │   └── triage_service.py  pre-processing -> prompt -> LLM -> parse -> validate -> fallback
│   ├── providers/
│   │   ├── base.py            LLMProvider interface (generate_triage)
│   │   └── groq_provider.py   Groq SDK implementation of LLMProvider
│   ├── schemas/
│   │   ├── request.py
│   │   └── response.py
│   └── utils/
│       ├── parser.py          extracts a JSON object out of raw LLM text
│       ├── validator.py       coerces/clamps the parsed payload into valid ranges
│       └── retry.py           generic async retry with backoff
├── main.py                    FastAPI app + CORS + /health
├── Dockerfile
├── requirements.txt
└── .env.example
```

## API

### `POST /triage`

Request:

```json
{ "symptoms": "Severe chest pain, difficulty breathing, heavy sweating, pain spreading to left arm" }
```

Response:

```json
{
  "priority": 1,
  "reason": "Symptoms suggest a possible cardiac emergency requiring immediate attention.",
  "confidence": 0.97,
  "factors": ["Severe chest pain", "Difficulty breathing", "Pain radiating to left arm"],
  "risk": "Critical",
  "department": "Cardiology",
  "summary": "Possible cardiac emergency. Immediate cardiology assessment recommended."
}
```

- `factors` is the AI Explainability payload: short phrases naming the specific
  symptoms that drove the priority, rendered by the frontend as bullet points
  under "AI Reasoning" instead of a single opaque sentence.
- `risk` is one of `Low` / `Medium` / `High` / `Critical`. If the model omits
  it or returns something unrecognized, it's derived from `priority` instead
  of failing the request.
- `department` is the single best-fit specialist department, chosen from a
  fixed list in `app/core/prompts.py` (`DEPARTMENTS`). An unrecognized value
  falls back to `"General Medicine"` rather than propagating a hallucinated
  department name.
- `summary` condenses a long/rambling symptom description into one or two
  sentences a doctor can read in seconds, without introducing a diagnosis.

Priority scale: `1` critical, `2` urgent, `3` moderate, `4` mild, `5` non-urgent.

### `GET /health`

Returns the configured backend/model so you can confirm what's wired up
without triggering an inference call. The Express backend proxies this at
`GET /api/v1/triage/engine-status` (admin-only) so the admin dashboard can
show live AI availability — see [server/README.md](../server/README.md#triage-apiv1triage).

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8000` | Port the FastAPI service listens on |
| `CORS_ORIGINS` | `*` | Allowed CORS origins for the API |
| `GROQ_API_KEY` | *(required)* | API key from [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | `llama-3.1-8b-instant` | Model name to request from Groq |
| `LLM_TIMEOUT_SECONDS` | `8` | Timeout for a single LLM call |
| `LLM_TEMPERATURE` | `0.2` | Sampling temperature — kept low for consistent, parseable JSON output |
| `MAX_RETRIES` | `2` | Retries on LLM failure/unparseable output before falling back to the neutral response |
| `RETRY_BACKOFF_SECONDS` | `0.5` | Linear backoff between retries |

## Running locally

1. Get a free API key at [console.groq.com](https://console.groq.com).
2. Install Python deps:
   ```
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and set `GROQ_API_KEY`.
4. Run the service:
   ```
   uvicorn main:app --reload --port 8000
   ```

The Express backend already expects this service at `http://localhost:8000/triage`
(configurable via `AI_SERVICE_URL` in `server/.env`).

## Swapping the LLM provider

The model is accessed only through `app/providers/groq_provider.py`, which
implements the `LLMProvider` interface in `app/providers/base.py`
(`generate_triage(prompt) -> str`). To use a different provider (Ollama,
vLLM, OpenAI, ...) later, add a new class implementing that interface and
point `app/services/triage_service.py`'s import at it - nothing in
`services/`, `schemas/`, or `utils/` needs to change.

## Failure handling

If the LLM is unreachable or returns output that can't be parsed into valid
JSON, the service retries (`MAX_RETRIES`, default 1) with a linear backoff,
then falls back to a neutral response rather than raising an error:

```json
{
  "priority": 3,
  "reason": "AI unavailable. Default priority assigned.",
  "confidence": 0,
  "factors": [],
  "risk": "Medium",
  "department": "General Medicine",
  "summary": "AI unavailable. Default priority assigned."
}
```

This guarantees appointment booking in the main app never blocks on the AI
service being down.

## Running with Docker

```
docker build -t cortex-ai-triage .
docker run -p 8000:8000 --env-file .env cortex-ai-triage
```

## Safety

The AI must never diagnose diseases, prescribe medicine, recommend treatment,
or replace a doctor's judgment - it only estimates urgency, with an explicit
confidence score so low-confidence triage decisions are visibly flagged for
human review rather than acted on blindly.
