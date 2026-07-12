# CORTEX_MED — API Documentation

Full endpoint-by-endpoint reference for the CORTEX_MED backend, with example requests and responses. For a higher-level architecture overview see [README.md](README.md).

- **Base URL:** `http://localhost:5000/api/v1` (port from `PORT` env var; see [README.md#environment-variables](README.md#environment-variables))
- **Content type:** `application/json` for all request/response bodies unless noted
- **Response envelope:** every endpoint (success and error) returns

```json
{
  "success": true,
  "message": "Human readable message",
  "meta": null,
  "data": { }
}
```

On error, `success` is `false`, `data` is typically `null`, and the HTTP status code reflects the error (`400`, `401`, `403`, `404`, `409`, `500`, …).

## Table of Contents

- [Authentication](#authentication)
- [Auth](#auth)
  - [POST /auth/register](#post-authregister)
  - [POST /auth/login](#post-authlogin)
  - [POST /auth/refresh](#post-authrefresh)
  - [PATCH /auth/change-password](#patch-authchange-password)
  - [PATCH /auth/notification-preferences](#patch-authnotification-preferences)
  - [POST /auth/deactivate](#post-authdeactivate)
  - [GET /auth/me](#get-authme)
- [Doctors](#doctors)
  - [GET /doctors](#get-doctors)
  - [POST /doctors](#post-doctors)
  - [PATCH /doctors/:id](#patch-doctorsid)
  - [DELETE /doctors/:id](#delete-doctorsid)
- [Appointments](#appointments)
  - [GET /appointments](#get-appointments)
  - [GET /appointments/track/:code](#get-appointmentstrackcode)
  - [POST /appointments](#post-appointments)
- [Triage](#triage)
  - [POST /triage](#post-triage)
  - [GET /triage/engine-status](#get-triageengine-status)
- [Queue](#queue)
  - [GET /queue/:doctorId](#get-queuedoctorid)
  - [PATCH /queue/call-next/:doctorId](#patch-queuecall-nextdoctorid)
  - [PATCH /queue/complete/:appointmentId](#patch-queuecompleteappointmentid)
- [Hospital Settings](#hospital-settings)
  - [GET /hospital-settings](#get-hospital-settings)
  - [PATCH /hospital-settings](#patch-hospital-settings)
- [Health Check](#health-check)
- [Data Models](#data-models)
- [Real-Time Events (Socket.IO)](#real-time-events-socketio)
- [Error Responses](#error-responses)

## Authentication

Protected endpoints require a JWT **access token** in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

(A raw token without the `Bearer` prefix is also accepted.)

- Missing/invalid/expired token → `401 Unauthorized`
- Valid token but role not permitted for the route → `403 Forbidden`
- Three roles exist: **`admin`**, **`doctor`**, **`receptionist`**
- Access tokens are short-lived; use `POST /auth/refresh` with a valid refresh token to get a new one.

Each endpoint below states which roles may call it, or **Public** if no token is required.

---

## Auth

Base path: `/api/v1/auth`

### POST /auth/register

Create a new user account. **Public.**

If `role` is `doctor`, a matching `Doctor` profile is auto-created. `role: "admin"` is rejected — admins cannot self-register.

**Request body**

| Field      | Type   | Required | Notes                                   |
|------------|--------|----------|------------------------------------------|
| `name`     | string | yes      | min length 3                             |
| `email`    | string | yes      | valid email, unique                      |
| `password` | string | yes      | min length 6                             |
| `role`     | string | yes      | `"doctor"` \| `"receptionist"` (`"admin"` is rejected with `403`) |
| `department` | string | if `role` is `doctor` | e.g. `"General Medicine"` |

```json
// Request
POST /api/v1/auth/register
{
  "name": "Dr. Alice Kaur",
  "email": "alice@cortexmed.com",
  "password": "secret123",
  "role": "doctor",
  "department": "Cardiology"
}
```

```json
// 201 Response
{
  "success": true,
  "message": "User registered successfully",
  "meta": null,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Dr. Alice Kaur",
    "email": "alice@cortexmed.com",
    "role": "doctor",
    "isActive": true,
    "createdAt": "2026-07-12T09:00:00.000Z",
    "updatedAt": "2026-07-12T09:00:00.000Z"
  }
}
```

Errors: `403` if `role` is `"admin"`; `409` if email already registered.

### POST /auth/login

Verify credentials and issue tokens. **Public.**

**Request body**

| Field      | Type   | Required |
|------------|--------|----------|
| `email`    | string | yes      |
| `password` | string | yes      |

```json
// Request
POST /api/v1/auth/login
{ "email": "alice@cortexmed.com", "password": "secret123" }
```

```json
// 200 Response
{
  "success": true,
  "message": "Login successful",
  "meta": null,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "name": "Dr. Alice Kaur",
      "email": "alice@cortexmed.com",
      "role": "doctor",
      "doctorId": "665f1b0c3c4d5e6f7a8b9c1a"
    }
  }
}
```

`user.doctorId` is only present when `role` is `doctor`. Errors: `401` on wrong email/password, `403` if `isActive` is `false`.

### POST /auth/refresh

Exchange a refresh token for a new access token. **Public.**

```json
// Request
POST /api/v1/auth/refresh
{ "refreshToken": "eyJhbGciOi..." }
```

```json
// 200 Response
{
  "success": true,
  "message": "Access token refreshed",
  "meta": null,
  "data": { "accessToken": "eyJhbGciOi..." }
}
```

Errors: `401` if the refresh token is invalid/expired.

### PATCH /auth/change-password

Update the caller's own password. **Auth:** any authenticated user.

**Request body**

| Field             | Type   | Required | Notes        |
|--------------------|--------|----------|--------------|
| `currentPassword`  | string | yes      | must match   |
| `newPassword`      | string | yes      | min length 6 |

```json
// Request
PATCH /api/v1/auth/change-password
Authorization: Bearer <accessToken>
{ "currentPassword": "secret123", "newPassword": "newSecret456" }
```

```json
// 200 Response
{ "success": true, "message": "Password changed successfully", "meta": null, "data": null }
```

Errors: `401` if `currentPassword` doesn't match.

### PATCH /auth/notification-preferences

Update the caller's notification preference flags. **Auth:** any authenticated user.

**Request body** (all optional booleans)

| Field            | Type    |
|-------------------|---------|
| `criticalAlerts`  | boolean |
| `dailySummary`    | boolean |
| `aiSuggestions`   | boolean |

```json
// Request
PATCH /api/v1/auth/notification-preferences
Authorization: Bearer <accessToken>
{ "criticalAlerts": true, "dailySummary": false, "aiSuggestions": true }
```

```json
// 200 Response
{
  "success": true,
  "message": "Notification preferences updated",
  "meta": null,
  "data": { "criticalAlerts": true, "dailySummary": false, "aiSuggestions": true }
}
```

### POST /auth/deactivate

Deactivate the caller's own account (`isActive: false`). **Auth:** any authenticated user.

**Request body**

| Field             | Type   | Required |
|--------------------|--------|----------|
| `currentPassword`  | string | yes      |

```json
// Request
POST /api/v1/auth/deactivate
Authorization: Bearer <accessToken>
{ "currentPassword": "secret123" }
```

```json
// 200 Response
{ "success": true, "message": "Account deactivated", "meta": null, "data": null }
```

### GET /auth/me

Return the current user's profile. **Auth:** any authenticated user.

```json
// 200 Response
{
  "success": true,
  "message": "Current user fetched successfully",
  "meta": null,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Dr. Alice Kaur",
    "email": "alice@cortexmed.com",
    "role": "doctor",
    "isActive": true,
    "doctorId": "665f1b0c3c4d5e6f7a8b9c1a",
    "notificationPreferences": { "criticalAlerts": true, "dailySummary": true, "aiSuggestions": true }
  }
}
```

---

## Doctors

Base path: `/api/v1/doctors`

### GET /doctors

List all doctor profiles, populated with `user.name/email/role/isActive`. **Auth:** `admin`, `receptionist`, `doctor`.

Auto-backfills a `Doctor` profile for any active user with role `doctor` that doesn't already have one.

```json
// 200 Response
{
  "success": true,
  "message": "Doctors fetched successfully",
  "meta": null,
  "data": [
    {
      "_id": "665f1b0c3c4d5e6f7a8b9c1a",
      "user": { "_id": "665f1a2b3c4d5e6f7a8b9c0d", "name": "Dr. Alice Kaur", "email": "alice@cortexmed.com", "role": "doctor", "isActive": true },
      "department": "Cardiology",
      "specialty": "General Practitioner",
      "room": "Unassigned",
      "consultationFee": 0,
      "avgConsultationTime": 15,
      "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri"],
      "startTime": "09:00",
      "endTime": "17:00",
      "status": "available"
    }
  ]
}
```

### POST /doctors

Create a doctor profile. **Auth:** `admin`.

**Request body**

| Field                 | Type              | Required | Notes |
|------------------------|-------------------|----------|-------|
| `user`                 | string \| object  | yes      | existing `User` `_id`, **or** inline `{ name, email, password }` to create a new doctor user |
| `department`           | string            | no       | |
| `specialty`            | string            | no       | |
| `room`                 | string            | no       | |
| `consultationFee`      | number            | no       | |
| `avgConsultationTime`  | number            | no       | minutes, default `15` |
| `workingDays`          | string[]          | no       | e.g. `["Mon","Tue"]` |
| `startTime`/`endTime`  | string            | no       | `"HH:mm"` |

```json
// Request (inline new user)
POST /api/v1/doctors
Authorization: Bearer <adminAccessToken>
{
  "user": { "name": "Dr. Bob Rahman", "email": "bob@cortexmed.com", "password": "secret123" },
  "department": "Orthopedics",
  "specialty": "Orthopedic Surgeon",
  "room": "204B",
  "consultationFee": 500,
  "avgConsultationTime": 20,
  "workingDays": ["Mon", "Wed", "Fri"],
  "startTime": "10:00",
  "endTime": "16:00"
}
```

```json
// 201 Response
{
  "success": true,
  "message": "Doctor created successfully",
  "meta": null,
  "data": {
    "_id": "665f1c1d3c4d5e6f7a8b9c2b",
    "user": "665f1c1c3c4d5e6f7a8b9c2a",
    "department": "Orthopedics",
    "specialty": "Orthopedic Surgeon",
    "room": "204B",
    "consultationFee": 500,
    "avgConsultationTime": 20,
    "workingDays": ["Mon", "Wed", "Fri"],
    "startTime": "10:00",
    "endTime": "16:00",
    "status": "available"
  }
}
```

Errors: `409` if the doctor profile or email already exists; `400` if an existing referenced `user` isn't role `doctor`.

### PATCH /doctors/:id

Update a doctor profile. **Auth:** `admin`.

**Path params:** `id` — Doctor `_id`.
**Request body:** any subset of the fields from `POST /doctors`, plus:

| Field    | Type   | Notes |
|----------|--------|-------|
| `status` | string | `"available"` \| `"unavailable"` \| `"on_leave"` |

```json
// Request
PATCH /api/v1/doctors/665f1c1d3c4d5e6f7a8b9c2b
Authorization: Bearer <adminAccessToken>
{ "status": "on_leave", "room": "204C" }
```

```json
// 200 Response
{
  "success": true,
  "message": "Doctor updated successfully",
  "meta": null,
  "data": { "_id": "665f1c1d3c4d5e6f7a8b9c2b", "status": "on_leave", "room": "204C", "...": "..." }
}
```

### DELETE /doctors/:id

Delete a doctor profile. **Auth:** `admin`.

**Path params:** `id` — Doctor `_id`.

```json
// 200 Response
{ "success": true, "message": "Doctor deleted successfully", "meta": null, "data": null }
```

Errors: `409` if the doctor has active (`waiting` or `serving`) appointments.

---

## Appointments

Base path: `/api/v1/appointments`

### GET /appointments

List all appointments, newest first, with `doctor` and `doctor.user` populated. **Auth:** `admin`, `receptionist`, `doctor`.

**Query params**

| Param    | Type   | Notes |
|----------|--------|-------|
| `doctor` | string | filter by Doctor `_id`. If the caller's role is `doctor`, this is forced to their own doctor profile regardless of what's passed. |

```json
// 200 Response
{
  "success": true,
  "message": "Appointments fetched successfully",
  "meta": null,
  "data": [
    {
      "_id": "665f1d2e3c4d5e6f7a8b9c3c",
      "patientName": "John Doe",
      "age": 34,
      "gender": "male",
      "phone": "+8801234567890",
      "doctor": { "_id": "665f1b0c3c4d5e6f7a8b9c1a", "department": "Cardiology", "user": { "name": "Dr. Alice Kaur" } },
      "symptoms": "chest pain, shortness of breath",
      "appointmentCode": "QURA-0007",
      "tokenNumber": 7,
      "priority": 2,
      "riskLevel": "High",
      "status": "waiting",
      "estimatedWait": 25,
      "createdAt": "2026-07-12T08:45:00.000Z"
    }
  ]
}
```

### GET /appointments/track/:code

Look up an appointment by its public tracking code. **Public** — no auth required (used for patient-facing status pages).

**Path params:** `code` — appointment code, e.g. `QURA-0007`.

```json
// 200 Response
{
  "success": true,
  "message": "Appointment fetched successfully",
  "meta": null,
  "data": {
    "appointment": {
      "_id": "665f1d2e3c4d5e6f7a8b9c3c",
      "appointmentCode": "QURA-0007",
      "patientName": "John Doe",
      "status": "waiting",
      "tokenNumber": 7,
      "priority": 2,
      "estimatedWait": 25
    },
    "peopleAhead": 3
  }
}
```

`peopleAhead` counts waiting patients ahead of this one in priority/token order. Errors: `404` if the code doesn't exist.

### POST /appointments

Book a new appointment. **Auth:** `admin`, `receptionist`, `doctor`.

If the caller's role is `doctor`, the `doctor` field in the body is ignored and forced to their own doctor profile. Auto-generates `appointmentCode` (`QURA-####`) and a sequential `tokenNumber` per doctor, runs AI triage synchronously (see [Triage](#triage)), recalculates the doctor's queue wait times, and emits `patient:booked` + `queue:updated` + `wait:updated` Socket.IO events.

**Request body**

| Field         | Type   | Required | Notes |
|----------------|--------|----------|-------|
| `patientName` | string | yes      | |
| `age`         | number | yes      | |
| `gender`      | string | yes      | `"male"` \| `"female"` \| `"other"` |
| `phone`       | string | yes      | |
| `doctor`      | string | yes      | Doctor `_id` (ignored/overridden if caller role is `doctor`) |
| `symptoms`    | string | yes      | free text, sent to the AI triage service |

```json
// Request
POST /api/v1/appointments
Authorization: Bearer <accessToken>
{
  "patientName": "John Doe",
  "age": 34,
  "gender": "male",
  "phone": "+8801234567890",
  "doctor": "665f1b0c3c4d5e6f7a8b9c1a",
  "symptoms": "chest pain, shortness of breath"
}
```

```json
// 201 Response
{
  "success": true,
  "message": "Appointment booked successfully",
  "meta": null,
  "data": {
    "_id": "665f1d2e3c4d5e6f7a8b9c3c",
    "patientName": "John Doe",
    "appointmentCode": "QURA-0007",
    "tokenNumber": 7,
    "priority": 2,
    "riskLevel": "High",
    "triageReason": "Chest pain with shortness of breath suggests possible cardiac event",
    "triageConfidence": 0.82,
    "triageFactors": ["chest pain", "shortness of breath"],
    "recommendedDepartment": "Cardiology",
    "status": "waiting",
    "estimatedWait": 25
  }
}
```

If the AI triage service is unreachable, triage falls back to `priority: 3`, `riskLevel: "Medium"` (see [Triage](#triage)) — booking never fails because of the AI service being down.

---

## Triage

Base path: `/api/v1/triage`

### POST /triage

Re-run AI triage for an existing appointment. **Auth:** `admin`, `receptionist`.

Sends the appointment's `symptoms` to the external AI service (`AI_SERVICE_URL`) and updates `priority`, `triageReason`, `triageConfidence`, `triageFactors`, `riskLevel`, `recommendedDepartment`, `aiSummary` on the appointment. 20-second timeout; on failure, falls back to `priority: 3`, `riskLevel: "Medium"`, `confidence: 0`, `department: "General Medicine"`.

**Request body**

| Field           | Type   | Required |
|------------------|--------|----------|
| `appointmentId` | string | yes      |

```json
// Request
POST /api/v1/triage
Authorization: Bearer <accessToken>
{ "appointmentId": "665f1d2e3c4d5e6f7a8b9c3c" }
```

```json
// 200 Response
{
  "success": true,
  "message": "Triage completed",
  "meta": null,
  "data": {
    "_id": "665f1d2e3c4d5e6f7a8b9c3c",
    "priority": 2,
    "triageReason": "Chest pain with shortness of breath suggests possible cardiac event",
    "triageConfidence": 0.82,
    "triageFactors": ["chest pain", "shortness of breath"],
    "riskLevel": "High",
    "recommendedDepartment": "Cardiology",
    "aiSummary": "Patient presents with acute chest pain and dyspnea; recommend urgent cardiac evaluation.",
    "triagedAt": "2026-07-12T08:46:00.000Z"
  }
}
```

### GET /triage/engine-status

Proxy the AI service's `/health` endpoint (does not trigger an inference call). **Auth:** `admin`.

```json
// 200 Response — AI service reachable
{
  "success": true,
  "message": "Triage engine status fetched",
  "meta": null,
  "data": { "online": true, "status": "ok", "llm_backend": "groq", "llm_model": "llama-3.3-70b" }
}
```

```json
// 200 Response — AI service unreachable
{
  "success": true,
  "message": "Triage engine status fetched",
  "meta": null,
  "data": { "online": false, "status": "unreachable", "llm_backend": null, "llm_model": null }
}
```

---

## Queue

Base path: `/api/v1/queue`

### GET /queue/:doctorId

Get the live queue state for a doctor. **Auth:** `admin`, `doctor`, `receptionist`.

**Path params:** `doctorId` — Doctor `_id`.

```json
// 200 Response
{
  "success": true,
  "message": "Queue fetched successfully",
  "meta": null,
  "data": {
    "current": {
      "_id": "665f1d2e3c4d5e6f7a8b9c3c",
      "patientName": "John Doe",
      "tokenNumber": 7,
      "status": "serving",
      "calledAt": "2026-07-12T09:05:00.000Z"
    },
    "waiting": [
      { "_id": "665f1e3f3c4d5e6f7a8b9c4d", "patientName": "Jane Smith", "tokenNumber": 8, "priority": 1, "estimatedWait": 10 }
    ],
    "stats": {
      "avgConsultationTime": 15,
      "patientsSeen": 6,
      "todayAdmissions": 9,
      "todayDischarges": 6,
      "efficiencyGoal": 20
    }
  }
}
```

`waiting[]` is sorted by `priority` (ascending, lower number = more urgent) then `tokenNumber`.

### PATCH /queue/call-next/:doctorId

Move the next highest-priority waiting patient to `serving`. **Auth:** `doctor`, `receptionist`.

Sets `calledAt`, recalculates the doctor's queue wait times, and emits `patient:called` + `queue:updated` + `wait:updated`.

**Path params:** `doctorId` — Doctor `_id`.

```json
// 200 Response
{
  "success": true,
  "message": "Next patient called",
  "meta": null,
  "data": {
    "_id": "665f1e3f3c4d5e6f7a8b9c4d",
    "patientName": "Jane Smith",
    "tokenNumber": 8,
    "status": "serving",
    "calledAt": "2026-07-12T09:20:00.000Z"
  }
}
```

Errors: `404` if there is no waiting patient in the queue.

### PATCH /queue/complete/:appointmentId

Mark an appointment as `completed`. **Auth:** `doctor`, `receptionist`.

Sets `completedAt`, recalculates the doctor's queue, and emits `patient:completed` + `queue:updated` + `wait:updated`.

**Path params:** `appointmentId` — Appointment `_id`.

```json
// 200 Response
{
  "success": true,
  "message": "Appointment marked as completed",
  "meta": null,
  "data": {
    "_id": "665f1e3f3c4d5e6f7a8b9c4d",
    "status": "completed",
    "completedAt": "2026-07-12T09:35:00.000Z"
  }
}
```

---

## Hospital Settings

Base path: `/api/v1/hospital-settings`

Singleton document — auto-created with defaults on first access.

### GET /hospital-settings

Fetch the hospital settings document. **Auth:** `admin`, `receptionist`, `doctor`.

```json
// 200 Response
{
  "success": true,
  "message": "Hospital settings fetched successfully",
  "meta": null,
  "data": { "_id": "665f0000...", "hospitalName": "CortexMed Hospital", "facilityId": "" }
}
```

### PATCH /hospital-settings

Update the hospital's display name and/or facility ID. **Auth:** `admin`.

**Request body**

| Field          | Type   | Required |
|-----------------|--------|----------|
| `hospitalName` | string | no       |
| `facilityId`   | string | no       |

```json
// Request
PATCH /api/v1/hospital-settings
Authorization: Bearer <adminAccessToken>
{ "hospitalName": "Green Valley Hospital", "facilityId": "GVH-001" }
```

```json
// 200 Response
{
  "success": true,
  "message": "Hospital settings updated successfully",
  "meta": null,
  "data": { "hospitalName": "Green Valley Hospital", "facilityId": "GVH-001" }
}
```

---

## Health Check

### GET /

Base API health check. **Public.**

```json
// 200 Response
{ "success": true, "message": "Qura API v1", "meta": null, "data": null }
```

---

## Data Models

### User (`auth.model.js`)

| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `email` | String | required, unique, lowercase |
| `password` | String | required, hashed with bcrypt, never returned by default (`select: 0`) |
| `role` | String | `"admin"` \| `"doctor"` \| `"receptionist"` |
| `isActive` | Boolean | default `true` |
| `notificationPreferences` | Object | `{ criticalAlerts, dailySummary, aiSuggestions }`, each Boolean, default `true` |
| `lastLogin` | Date | |

### Doctor (`doctor.model.js`)

| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId (ref `User`) | required, unique |
| `department` | String | default `"General Medicine"` |
| `specialty` | String | default `"General Practitioner"` |
| `room` | String | default `"Unassigned"` |
| `consultationFee` | Number | default `0` |
| `avgConsultationTime` | Number | minutes, default `15` |
| `workingDays` | String[] | e.g. `["Mon","Tue",...]` |
| `startTime` / `endTime` | String | `"HH:mm"`, default `"09:00"` / `"17:00"` |
| `status` | String | `"available"` \| `"unavailable"` \| `"on_leave"`, default `"available"` |

### Appointment (`appointment.model.js`)

| Field | Type | Notes |
|---|---|---|
| `patientName` | String | required |
| `age` | Number | required |
| `gender` | String | `"male"` \| `"female"` \| `"other"`, required |
| `phone` | String | required |
| `doctor` | ObjectId (ref `Doctor`) | required |
| `symptoms` | String | required, sent to AI triage |
| `appointmentCode` | String | unique, auto-generated `QURA-####` |
| `tokenNumber` | Number | sequential per doctor |
| `priority` | Number | 1 (most urgent) – 5, default `5` |
| `triageReason` | String | AI-generated explanation |
| `triageConfidence` | Number | 0–1 |
| `triageFactors` | String[] | AI explainability bullets |
| `riskLevel` | String | `"Low"` \| `"Medium"` \| `"High"` \| `"Critical"` |
| `recommendedDepartment` | String | |
| `aiSummary` | String | |
| `aiModel` | String | |
| `triagedAt` | Date | |
| `estimatedWait` | Number | minutes, default `0` |
| `status` | String | `"waiting"` \| `"serving"` \| `"completed"` \| `"cancelled"`, default `"waiting"` |
| `calledAt` / `completedAt` | Date | |
| `notes` | String | default `""` |

### HospitalSettings (`hospital.model.js`)

Singleton document.

| Field | Type | Notes |
|---|---|---|
| `hospitalName` | String | default `"CortexMed Hospital"` |
| `facilityId` | String | default `""` |

---

## Real-Time Events (Socket.IO)

Socket.IO runs on the same HTTP server, CORS restricted to `CLIENT_URL`. Events are broadcast globally (`io.emit`, not room-scoped) — no auth handshake or room-joining is implemented, connect to the same host/port as the REST API.

| Event | Payload | Emitted when |
|---|---|---|
| `queue:updated` | `{ doctorId }` | An appointment is created, called, or completed |
| `wait:updated` | `{ doctorId }` | Same as above — signals clients to refetch wait-time estimates |
| `patient:booked` | full appointment object | `POST /appointments` |
| `patient:called` | full appointment object | `PATCH /queue/call-next/:doctorId` |
| `patient:completed` | full appointment object | `PATCH /queue/complete/:appointmentId` |

---

## Error Responses

All errors use the standard envelope with `success: false`:

```json
{
  "success": false,
  "message": "Doctor not found",
  "meta": null,
  "data": null
}
```

| Status | Meaning | Common causes |
|---|---|---|
| `400` | Bad request | Invalid body shape (Zod validation), referencing a user that isn't role `doctor` |
| `401` | Unauthorized | Missing/invalid/expired token, wrong login credentials |
| `403` | Forbidden | Role not permitted for this route, admin self-registration, deactivated account |
| `404` | Not found | Unknown appointment code / doctor id / appointment id |
| `409` | Conflict | Duplicate email, duplicate doctor profile, deleting a doctor with active appointments |
| `500` | Server error | Unexpected/unhandled errors, including malformed Zod validation errors (not yet specially formatted — see [README.md#known-limitations](README.md#known-limitations)) |
