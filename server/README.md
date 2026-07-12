# CORTEX_MED — CORTEX_MED Server

Backend API for **CORTEX_MED**, a hospital/clinic patient-queue and triage management system. It handles authentication, doctor management, appointment booking, AI-assisted patient triage, hospital-wide settings, and a live consultation queue that is broadcast to connected clients in real time over Socket.IO.

> For a full endpoint-by-endpoint reference with example requests/responses, see **[API_DOCS.md](API_DOCS.md)**.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Architecture Overview](#architecture-overview)
- [Authentication & Authorization](#authentication--authorization)
- [Response Format](#response-format)
- [API Reference](#api-reference)
  - [Auth](#auth-apiv1auth)
  - [Doctors](#doctors-apiv1doctors)
  - [Appointments](#appointments-apiv1appointments)
  - [Triage](#triage-apiv1triage)
  - [Queue](#queue-apiv1queue)
  - [Hospital Settings](#hospital-settings-apiv1hospital-settings)
- [Data Models](#data-models)
- [Real-Time Events (Socket.IO)](#real-time-events-socketio)
- [External AI Triage Service](#external-ai-triage-service)
- [Known Limitations](#known-limitations)

## Tech Stack

| Concern            | Library                     |
|---------------------|------------------------------|
| Runtime / Framework | Node.js, Express 5           |
| Database            | MongoDB via Mongoose 9       |
| Authentication      | jsonwebtoken (access + refresh tokens), bcrypt |
| Validation          | Zod                          |
| Real-time           | Socket.IO                    |
| HTTP client         | Axios (calls the external AI triage service) |
| Misc                | cors, cookie-parser, morgan, dotenv |
| Dev tooling         | nodemon                      |

## Project Structure

```
server/
├── src/
│   ├── index.js                 # Entry point — loads .env, boots server.js
│   ├── server.js                 # Connects Mongo, starts HTTP + Socket.IO server
│   ├── app.js                    # Express app: middleware, route mounting
│   └── app/
│       ├── config/index.js       # Centralized env var access
│       ├── errors/AppError.js    # Custom operational error class
│       ├── middlewares/
│       │   ├── auth.js               # JWT verification + role-based access control
│       │   ├── validateRequest.js    # Zod schema validation middleware
│       │   ├── globalErrorHandler.js # Central error handler
│       │   └── notFound.js           # 404 handler
│       ├── routes/index.js       # Mounts all module routers under /api/v1
│       ├── modules/
│       │   ├── auth/             # Register, login, refresh, current user, password, notification prefs
│       │   ├── doctor/           # Doctor profile management (CRUD)
│       │   ├── appointment/      # Appointment booking & tracking
│       │   ├── triage/           # AI-assisted priority triage + AI engine status check
│       │   ├── queue/            # Live per-doctor consultation queue
│       │   ├── wait-time/        # Queue wait-time recalculation
│       │   ├── hospital/         # Hospital-wide settings (name, facility ID)
│       │   ├── notification/     # Socket.IO event emit helpers (no REST route — internal use only)
│       │   ├── dashboard/        # Reserved for future dashboard-specific endpoints (currently empty)
│       │   └── analytics/        # Reserved for future analytics endpoints (currently empty — analytics are computed client-side today)
│       ├── socket/                # Socket.IO server init, events, emit helpers
│       └── utils/                 # JWT, password hashing, response helpers, code/token generators
```

Each implemented domain module (`auth`, `doctor`, `appointment`, `triage`, `queue`, `hospital`) follows the same internal layout:

- `*.route.js` — Express router, wires middleware (`auth`, `validateRequest`) to controllers
- `*.controller.js` — thin HTTP layer, calls the service and sends the response
- `*.service.js` — business logic / DB access
- `*.validation.js` — Zod request schemas
- `*.model.js` — Mongoose schema (where applicable)
- `*.constant.js` — enums (roles, statuses, priorities)

`notification/` only contains a `*.service.js` — it's a set of internal Socket.IO emit helpers called by other modules (queue, appointment), not a routed API. `dashboard/` and `analytics/` are empty scaffolding folders reserved for future work; the analytics currently shown in the client are computed on the frontend from appointment/doctor data rather than from a dedicated backend endpoint.

## Getting Started

```bash
cd server
npm install

# create a .env file (see Environment Variables below)

npm run dev     # nodemon, auto-restarts on file changes
npm start        # plain node
```

The server connects to MongoDB and starts listening only after the connection succeeds (see `src/server.js`).

## Environment Variables

Create a `.env` file in `server/` with the following keys (read in `src/app/config/index.js`):

| Variable                  | Description                                      |
|---------------------------|---------------------------------------------------|
| `PORT`                    | Port the HTTP server listens on                   |
| `DATABASE_URL`            | MongoDB connection string                         |
| `NODE_ENV`                | `development` / `production`                      |
| `CLIENT_URL`              | Allowed CORS origin for the frontend (also used for the Socket.IO CORS config) |
| `JWT_ACCESS_SECRET`       | Secret used to sign/verify access tokens          |
| `JWT_ACCESS_EXPIRES_IN`   | Access token expiry (e.g. `15m`)                  |
| `JWT_REFRESH_SECRET`      | Secret used to sign/verify refresh tokens         |
| `JWT_REFRESH_EXPIRES_IN`  | Refresh token expiry (e.g. `7d`)                  |
| `AI_SERVICE_URL`          | Full URL of the external AI triage endpoint (e.g. `http://localhost:8000/triage`). Optional — defaults to `http://localhost:8000/triage` if unset. |

No `server/.env.example` currently exists in the repo — use the table above as the template.

## Architecture Overview

1. `src/index.js` loads `.env` and requires `src/server.js`.
2. `src/server.js` connects to MongoDB (mongoose), initializes Socket.IO on top of the raw `http.Server`, then starts listening.
3. `src/app.js` builds the Express app:
   - `cors({ origin: CLIENT_URL, credentials: true })`
   - `express.json()` body parsing
   - `cookie-parser`
   - `morgan("dev")` request logging
   - All API routes mounted at **`/api/v1`**
   - `notFound` middleware for unmatched routes
   - `globalErrorHandler` as the final error-handling middleware
4. Every route handler is wrapped in `catchAsync`, so thrown/rejected errors are forwarded to `globalErrorHandler` automatically.
5. Errors are raised as `AppError(statusCode, message)` from anywhere in the service layer and converted into a uniform JSON error response.

## Authentication & Authorization

- Tokens are signed JWTs containing `{ id, email, role }`.
- Clients send the access token as `Authorization: Bearer <token>` (a raw token without the `Bearer` prefix is also accepted).
- The `auth(...roles)` middleware (`src/app/middlewares/auth.js`):
  - Throws `401 Unauthorized` if no `Authorization` header is present or the token is invalid/expired.
  - Throws `403 Forbidden` if the decoded `role` isn't in the allowed `roles` list (when roles are specified).
  - Calling `auth()` with no arguments only requires a valid token, regardless of role.
  - Sets `req.user = { id, email, role }` for downstream handlers.
- Three roles exist: **`admin`**, **`doctor`**, **`receptionist`**.
- Access tokens are short-lived; `POST /api/v1/auth/refresh` exchanges a valid refresh token for a new access token.

## Response Format

All responses (success and error) go through `sendResponse`:

```json
{
  "success": true,
  "message": "Human readable message",
  "meta": null,
  "data": { }
}
```

Errors thrown as `AppError(statusCode, message)` are caught by `globalErrorHandler` and returned in the same shape with `success: false` and the appropriate HTTP status code (defaults to `500` for unexpected errors).

## API Reference

Base URL: **`/api/v1`**

`GET /api/v1/` → health check, returns `{ success: true, message: "Qura API v1" }`.

### Auth (`/api/v1/auth`)

| Method | Path                      | Auth        | Body                                                                 | Description |
|--------|---------------------------|-------------|-----------------------------------------------------------------------|-------------|
| POST   | `/register`               | Public      | `name` (string, min 3), `email` (email), `password` (string, min 6), `role` (`admin`\|`doctor`\|`receptionist`) | Creates a user. **`admin` role is rejected at the service layer** (`403`) even though the schema allows it — admins cannot self-register. If `role` is `doctor`, a matching `Doctor` profile is auto-created. Returns the created user (password omitted). |
| POST   | `/login`                  | Public      | `email`, `password`                                                    | Verifies credentials, updates `lastLogin`, returns `{ accessToken, refreshToken, user }`. If the user is a doctor, `user.doctorId` is included. |
| POST   | `/refresh`                | Public      | `refreshToken` (string)                                                | Verifies the refresh token and issues a new `accessToken`. |
| PATCH  | `/change-password`        | Any authenticated user | current password, new password | Updates the caller's own password. |
| PATCH  | `/notification-preferences` | Any authenticated user | `{ criticalAlerts, dailySummary, aiSuggestions }` (booleans) | Updates the caller's notification preference flags on their `User` document; returns the updated preferences. |
| POST   | `/deactivate`             | Any authenticated user | —                                                                    | Deactivates the caller's own account (`isActive: false`). |
| GET    | `/me`                     | Any authenticated user | —                                                          | Returns the current user profile (includes `doctorId` for doctors). |

### Doctors (`/api/v1/doctors`)

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| GET    | `/` | `admin`, `receptionist`, `doctor` | — | Lists all doctor profiles (populated with `user.name/email/role/isActive`). Auto-backfills a `Doctor` profile for any active user with role `doctor` that doesn't have one yet. |
| POST   | `/` | `admin` | `user` (either an existing User `_id` string, **or** an inline object `{ name, email, password }` to create a new doctor user), `department`, `specialty`, `room`, `consultationFee` (number), `avgConsultationTime` (number), `workingDays` (string[]), `startTime`, `endTime` | Creates a doctor profile. If `user` is an object, a new `User` with role `doctor` is created first. Fails with `409` if the doctor profile or email already exists, `400` if an existing user isn't role `doctor`. |
| PATCH  | `/:id` | `admin` | Any subset of the doctor profile fields above | Updates a doctor profile. |
| DELETE | `/:id` | `admin` | — | Deletes a doctor profile. |

### Appointments (`/api/v1/appointments`)

| Method | Path | Auth | Body / Params | Description |
|--------|------|------|----------------|-------------|
| GET  | `/` | `admin`, `receptionist`, `doctor` | — | Lists all appointments, newest first, with doctor + user populated. |
| GET  | `/track/:code` | Public | `code` (appointment code, e.g. `CORTEX_MED-1234`) | Looks up an appointment by its public tracking code. Returns `{ appointment, peopleAhead }`, where `peopleAhead` counts waiting patients ahead in priority/token order. |
| POST | `/` | `admin`, `receptionist`, `doctor` | `patientName`, `age` (number), `gender` (`male`\|`female`\|`other`), `phone`, `doctor` (Doctor `_id`), `symptoms` | Books an appointment. If the caller's role is `doctor`, the `doctor` field is forced to their own doctor profile (ignoring the submitted value). Auto-generates `appointmentCode` (`CORTEX_MED-####`) and a sequential `tokenNumber` per doctor, then immediately runs AI triage (see below), recalculates the doctor's queue wait times, and emits `patient:booked` + `queue:updated` + `wait:updated` socket events. |

### Triage (`/api/v1/triage`)

| Method | Path             | Auth                   | Body                     | Description |
|--------|------------------|------------------------|--------------------------|-------------|
| POST   | `/`              | `admin`, `receptionist` | `appointmentId` (string) | Re-runs AI triage for an existing appointment: sends its `symptoms` to the external triage service and updates `priority`, `triageReason`, `triageConfidence`, `triageFactors`, `riskLevel`, `recommendedDepartment`, `aiSummary` on the appointment. |
| GET    | `/engine-status` | `admin`                 | —                        | Proxies the AI service's `/health` endpoint so the admin dashboard can show whether the AI triage engine is online and which LLM backend/model it's using, without triggering an inference call. Returns `{ online: false, status: "unreachable", llm_backend: null, llm_model: null }` if the AI service can't be reached. |

### Queue (`/api/v1/queue`)

| Method | Path | Auth | Params | Description |
|--------|------|------|--------|-------------|
| GET   | `/:doctorId` | `admin`, `doctor`, `receptionist` | `doctorId` | Returns the live queue state for a doctor: `current` (patient being served), `waiting[]` (sorted by `priority` then `tokenNumber`), and `stats` (`avgConsultationTime`, `patientsSeen`, `todayAdmissions`, `todayDischarges`, `efficiencyGoal`). |
| PATCH | `/call-next/:doctorId` | `doctor`, `receptionist` | `doctorId` | Moves the next highest-priority waiting patient to `serving`, sets `calledAt`, recalculates queue wait times, and emits `patient:called` + `queue:updated` + `wait:updated`. |
| PATCH | `/complete/:appointmentId` | `doctor`, `receptionist` | `appointmentId` | Marks an appointment `completed`, sets `completedAt`, recalculates the doctor's queue, and emits `patient:completed` + `queue:updated` + `wait:updated`. |

### Hospital Settings (`/api/v1/hospital-settings`)

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| GET   | `/` | `admin`, `receptionist`, `doctor` | — | Fetches the (singleton) hospital settings document. |
| PATCH | `/` | `admin` | `{ hospitalName?, facilityId? }` | Updates the hospital's display name and/or facility ID. |

## Data Models

**User** (`auth.model.js`)
`name`, `email` (unique), `password` (hashed, never selected by default), `role` (`admin`\|`doctor`\|`receptionist`), `isActive` (default `true`), `notificationPreferences` (`{ criticalAlerts, dailySummary, aiSuggestions }`, each boolean, default `true`), `lastLogin`, timestamps.

**Doctor** (`doctor.model.js`)
`user` (ref `User`, unique), `department`, `specialty`, `room`, `consultationFee`, `avgConsultationTime` (default `15`), `workingDays[]`, `startTime`/`endTime`, `status` (`available`\|`unavailable`\|`on_leave`, default `available`), timestamps.

**Appointment** (`appointment.model.js`)
`patientName`, `age`, `gender`, `phone`, `doctor` (ref `Doctor`), `symptoms`, `appointmentCode` (unique), `tokenNumber`, `priority` (1–5, default `5`), `triageReason`, `triageConfidence` (0–1), `triageFactors` (string[], the AI explainability bullets), `riskLevel` (`Low`\|`Medium`\|`High`\|`Critical`), `recommendedDepartment`, `aiSummary`, `aiModel`, `triagedAt`, `estimatedWait` (default `0`), `status` (`waiting`\|`serving`\|`completed`\|`cancelled`, default `waiting`), `calledAt`, `completedAt`, `notes`, timestamps.

**HospitalSettings** (`hospital.model.js`)
Singleton document: `hospitalName` (default `"CortexMed Hospital"`), `facilityId` (default `""`), timestamps.

## Real-Time Events (Socket.IO)

Socket.IO is initialized in `src/app/socket/socket.js` on top of the same HTTP server, with CORS restricted to `CLIENT_URL`. Events are broadcast globally (`io.emit`, not room-scoped) whenever the queue changes:

| Event               | Payload                | Emitted when |
|---------------------|--------------------------|--------------|
| `queue:updated`     | `{ doctorId }`           | An appointment is created, called, or completed |
| `wait:updated`      | `{ doctorId }`           | Same as above — signals clients to refetch wait-time estimates |
| `patient:booked`    | full appointment object  | `POST /appointments` |
| `patient:called`    | full appointment object  | `PATCH /queue/call-next/:doctorId` |
| `patient:completed` | full appointment object  | `PATCH /queue/complete/:appointmentId` |

Clients only need to connect to the Socket.IO server at the same host — no auth handshake or room-joining is currently implemented.

## External AI Triage Service

`triage.service.js` calls out to a separate microservice, configured via the `AI_SERVICE_URL` env var (defaults to `http://localhost:8000/triage` if unset):

```
POST <AI_SERVICE_URL>
Body: { "symptoms": "<patient symptoms text>" }
```

Expected response: `{ priority: 1-5, reason, confidence, factors, risk, department, summary }` (see [ai-service/README.md](../ai-service/README.md) for the full contract). If the service is unreachable or errors (20s timeout), triage falls back to a neutral default: `priority: 3`, `reason: "AI unavailable. Default priority assigned."`, `confidence: 0`, `risk: "Medium"`, `department: "General Medicine"` — so appointment booking never blocks on the AI service being down.

`GET /api/v1/triage/engine-status` derives the AI service's health-check URL from `AI_SERVICE_URL` (swapping `/triage` for `/health`) so the admin dashboard can surface AI availability without running an actual triage.

## Known Limitations

- No test suite, seed script, `server/.env.example`, Postman collection, or OpenAPI/Swagger spec currently exists in the repo.
- No `helmet`, rate-limiting, or compression middleware on the Express app.
- `globalErrorHandler` treats all errors uniformly via `err.statusCode`/`err.message`; it doesn't specially format Zod validation errors, so a validation failure surfaces as a generic (likely `500`) response rather than a structured `400` with field-level messages.
- `QueueService.estimateWait` exists but isn't wired to any route.
- `mongoose.connect` has no retry/reconnect handling — a dropped DB connection requires a process restart.
- The `dashboard` and `analytics` modules are empty scaffolding; there is no dedicated analytics endpoint yet — the client computes analytics itself from appointment/doctor data.
