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
│   ├── models/
│   │   └── llama.py           HTTP client for the LLM backend (Ollama or vLLM)
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
without triggering an inference call.

## Running locally (Ollama)

1. Install [Ollama](https://ollama.com) and pull a model:
   ```
   ollama pull llama3.1:8b-instruct-q4_0
   ```
2. Install Python deps:
   ```
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and adjust if needed.
4. Run the service:
   ```
   uvicorn main:app --reload --port 8000
   ```

The Express backend already expects this service at `http://localhost:8000/triage`
(configurable via `AI_SERVICE_URL` in `server/.env`).

## Switching to vLLM / ROCm for the hackathon demo

If AMD hardware is available, point the same service at a vLLM server instead
of Ollama - the `/triage` contract does not change, so the Express backend
needs no changes either:

```
LLM_BACKEND=vllm
LLM_BASE_URL=http://<vllm-host>:8000
LLM_MODEL=llama3.1:8b-instruct
```

`app/models/llama.py` already implements both the Ollama (`/api/generate`) and
the OpenAI-compatible (`/v1/chat/completions`) request shapes vLLM exposes.

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

Note: when Ollama runs on the host and this service runs in Docker, set
`LLM_BASE_URL=http://host.docker.internal:11434`.

## Safety

The AI must never diagnose diseases, prescribe medicine, recommend treatment,
or replace a doctor's judgment - it only estimates urgency, with an explicit
confidence score so low-confidence triage decisions are visibly flagged for
human review rather than acted on blindly.
