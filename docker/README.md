# Running CortexMed with Docker

Brings up all four pieces with one command: MongoDB, the Cortex AI Triage
Engine (FastAPI), the Express backend, and the Next.js frontend.

## Prerequisites

- Docker Desktop (or Docker Engine + Compose v2 on Linux)
- `server/.env` already exists in this repo with JWT secrets etc. - the
  compose file reuses it and only overrides the infra URLs (`DATABASE_URL`,
  `CLIENT_URL`, `AI_SERVICE_URL`) so they point at the containers instead of
  `localhost`.
- For real AI triage instead of the neutral fallback: create a
  `docker/.env` file (compose auto-loads it) with a
  [Groq](https://console.groq.com) API key:
  ```
  GROQ_API_KEY=your_key
  ```

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

## Notes

- `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SOCKET_URL` are baked into the
  frontend at *build* time (Next.js inlines `NEXT_PUBLIC_*` vars into the
  browser bundle), so they default to `http://localhost:5000/...` - correct
  since the browser runs on your host machine, not inside the Docker
  network. Override them via `docker/.env` only if you're exposing the
  backend on a different host/port.
- If the AI service can't reach an LLM at all, triage still works via the
  documented neutral-priority fallback - booking is never blocked.
