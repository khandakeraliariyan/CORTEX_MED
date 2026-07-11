# Running CortexMed with Docker

Brings up all four pieces with one command: MongoDB, the Cortex AI Triage
Engine (FastAPI), the Express backend, and the Next.js frontend.

## Prerequisites

- Docker Desktop (or Docker Engine + Compose v2 on Linux)
- `server/.env` already exists in this repo with JWT secrets etc. - the
  compose file reuses it and only overrides the infra URLs (`DATABASE_URL`,
  `CLIENT_URL`, `AI_SERVICE_URL`) so they point at the containers instead of
  `localhost`.
- For real AI triage instead of the neutral fallback: either
  - **Dev**: install [Ollama](https://ollama.com) on the host and run
    `ollama pull llama3.1:8b-instruct-q4_0` - the `ai-service` container talks
    to it over `host.docker.internal:11434` by default, or
  - **Hackathon demo (AMD ROCm)**: point at a vLLM server instead (see below).

## Run it

```
docker compose -f docker/docker-compose.yml up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1
- AI service: http://localhost:8000 (health check at `/health`)
- MongoDB: localhost:27017

Stop everything with `docker compose -f docker/docker-compose.yml down`
(add `-v` to also drop the Mongo data volume).

## Switching the AI backend to vLLM / ROCm for the demo

Create a `docker/.env` file (compose auto-loads it for `${VAR}` substitution)
so you don't have to edit `docker-compose.yml` itself:

```
LLM_BACKEND=vllm
LLM_BASE_URL=http://<vllm-host>:8000
LLM_MODEL=llama3.1:8b-instruct
```

Then re-run `docker compose -f docker/docker-compose.yml up --build`. No
Express or frontend changes are needed - the `/triage` contract is identical
either way.

## Notes

- `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SOCKET_URL` are baked into the
  frontend at *build* time (Next.js inlines `NEXT_PUBLIC_*` vars into the
  browser bundle), so they default to `http://localhost:5000/...` - correct
  since the browser runs on your host machine, not inside the Docker
  network. Override them via `docker/.env` only if you're exposing the
  backend on a different host/port.
- If the AI service can't reach an LLM at all, triage still works via the
  documented neutral-priority fallback - booking is never blocked.
