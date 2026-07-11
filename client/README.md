# CORTEX_MED — CORTEX_MED Client

Frontend for **CORTEX_MED**, a hospital/clinic patient-queue and triage management system. It is a role-based dashboard application (admin, doctor, receptionist, patient) plus a public appointment-tracking page, built on Next.js App Router and talking to the [CORTEX_MED server](../server/README.md) over REST and Socket.IO.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Architecture Overview](#architecture-overview)
- [Routing & Route Groups](#routing--route-groups)
- [Authentication Flow](#authentication-flow)
- [Data Fetching & Server State](#data-fetching--server-state)
- [Real-Time (Socket.IO)](#real-time-socketio)
- [State Management](#state-management)
- [UI Layer](#ui-layer)
- [Feature Modules](#feature-modules)
- [Known Limitations](#known-limitations)

## Tech Stack

| Concern              | Library                              |
|----------------------|----------------------------------------|
| Framework            | Next.js 15 (App Router, React 19)      |
| Language             | TypeScript (strict)                    |
| Styling              | Tailwind CSS v4                        |
| Server state / cache | TanStack React Query v5 (+ Devtools)   |
| Client state         | Zustand (with `persist` middleware)    |
| HTTP client          | Axios (with auth interceptors)         |
| Real-time            | socket.io-client                       |
| Theming              | next-themes                            |
| Linting              | ESLint 9 (`next/core-web-vitals`, `next/typescript`) |

## Project Structure

```
client/
├── src/
│   ├── app/                          # Next.js App Router — routes only, no logic
│   │   ├── layout.tsx                 # Root layout: fonts, <AppProviders>
│   │   ├── page.tsx                   # "/" — LandingPage
│   │   ├── not-found.tsx              # Global 404 — NotFoundPage
│   │   ├── globals.css                # Tailwind import + CSS variables
│   │   ├── track/[queueId]/page.tsx   # Public queue tracking by code
│   │   ├── (public)/                  # Route group: unauthenticated pages
│   │   │   ├── layout.tsx              # Redirects away if already logged in
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/        # Scaffolded, not yet implemented
│   │   └── (protected)/               # Route group: requires auth
│   │       ├── layout.tsx              # Redirects to /login if not authenticated
│   │       ├── admin/                  # layout.tsx guards role === "admin"
│   │       │   ├── dashboard/, analytics/, staff/, settings/
│   │       ├── doctor/                 # layout.tsx guards role === "doctor"
│   │       │   ├── dashboard/, queue/, intake/
│   │       ├── reception/              # layout.tsx guards role === "receptionist"
│   │       │   ├── dashboard/, queue/, appointments/, doctors/
│   │       └── patient/                # layout.tsx guards role === "patient" (page routes not yet built)
│   ├── components/
│   │   └── cortex/
│   │       ├── ui.tsx                  # Shared primitives: DashboardShell, Button, Panel, MetricCard, charts, etc.
│   │       └── pages.tsx               # All page-level components (one file per exported page component)
│   ├── constants/
│   │   ├── env.ts                      # Reads NEXT_PUBLIC_* env vars with fallbacks
│   │   ├── routes.ts                   # ROUTES map + ROLE_DASHBOARD_PATH
│   │   └── storage-keys.ts             # localStorage key names
│   ├── features/                       # Feature-sliced domain modules
│   │   ├── appointment/  (components/hooks/services/types)
│   │   ├── doctor/       (components/hooks/services/types)
│   │   ├── queue/        (components/hooks/services/types)
│   │   ├── hospital/     (hooks/services/types — hospital name & facility ID settings)
│   │   ├── triage/       (hooks/services/types — AI engine status; per-appointment triage fields still live on Appointment)
│   │   ├── analytics/    (hooks only — useHospitalAnalytics computes metrics client-side from appointments/doctors)
│   │   ├── authentication/ (hooks only — useChangePassword/useDeactivateAccount/useUpdateNotificationPreferences; core login/session logic lives in src/services + src/store instead)
│   │   └── patient/      (scaffolded, empty — no logged-in patient dashboard yet)
│   ├── hooks/
│   │   └── use-role-guard.ts           # Redirects to the user's own dashboard if role mismatches
│   ├── providers/
│   │   ├── app-providers.tsx           # Composes Theme → Query → Auth → Socket providers
│   │   ├── auth-provider.tsx           # Hydrates session from localStorage + GET /auth/me on mount
│   │   ├── query-provider.tsx          # React Query client + devtools
│   │   ├── socket-provider.tsx         # Opens/closes the Socket.IO connection based on auth state
│   │   └── theme-provider.tsx          # next-themes wrapper (class-based, system-aware)
│   ├── services/
│   │   ├── api-client.ts               # Axios instance: bearer header injection + 401 refresh-and-retry
│   │   ├── auth-service.ts             # login / register / getCurrentUser calls
│   │   └── socket-client.ts            # Creates a socket.io-client instance with the access token
│   ├── store/
│   │   └── auth-store.ts               # Zustand store: user, accessToken, isAuthenticated
│   └── types/
│       ├── api.types.ts                # ApiResponse<T> envelope shared by every endpoint
│       └── auth.types.ts               # UserRole, AuthUser, AuthTokens, payload types
├── public/                            # Static assets
├── next.config.ts                     # Default Next.js config (no overrides yet)
├── eslint.config.mjs
├── tsconfig.json                      # `@/*` path alias → `src/*`
└── package.json
```

Every `app/**/page.tsx` file is intentionally a thin wrapper — it imports one exported component from `components/cortex/pages.tsx` and renders it, sometimes passing a prop (e.g. `<DoctorDashboardPage active="My Queue" />` for the `/doctor/queue` route, `<StaffDirectoryPage role="receptionist" />` for `/reception/doctors`). This keeps routing declarative while all page markup and logic sits in one place.

## Getting Started

```bash
cd client
npm install

# create a .env.local file (see Environment Variables below) if you need
# non-default API/socket URLs

npm run dev     # Next.js dev server (default: http://localhost:3000)
npm run build   # production build
npm start       # serve the production build
npm run lint    # ESLint
```

This app expects the [server](../server/README.md) to be running (default `http://localhost:5000`) and, for triage-aware booking flows, the external AI triage microservice the server calls out to.

## Environment Variables

Read in `src/constants/env.ts`, both optional with hardcoded fallbacks:

| Variable                    | Default                          | Description |
|-----------------------------|-----------------------------------|--------------|
| `NEXT_PUBLIC_API_URL`       | `http://localhost:5000/api/v1`    | Base URL for the Axios REST client |
| `NEXT_PUBLIC_SOCKET_URL`    | `http://localhost:5000`           | Socket.IO server URL |

No `.env.example` currently exists in the repo.

## Architecture Overview

1. `src/app/layout.tsx` is the only server component in the tree that matters structurally — it loads fonts and wraps everything in `<AppProviders>`.
2. `AppProviders` nests, in order: `ThemeProvider` → `QueryProvider` → `AuthProvider` → `SocketProvider`. Order matters: `SocketProvider` reads the access token that `AuthProvider`/the Zustand store manage, and `AuthProvider` must resolve before protected routes decide whether to redirect.
3. Two **route groups** under `src/app` — `(public)` and `(protected)` — each with a client-side layout that inspects auth state and redirects accordingly (see [Routing & Route Groups](#routing--route-groups)).
4. Role-specific subtrees (`admin/`, `doctor/`, `reception/`, `patient/`) each have their own `layout.tsx` calling `useRoleGuard("<role>")`, which redirects a logged-in user of the wrong role to their own dashboard.
5. All actual page UI and data-fetching logic lives in `src/components/cortex/pages.tsx`, which imports feature hooks (`useDoctors`, `useAppointments`, `useQueue`, etc.) and shared UI primitives from `src/components/cortex/ui.tsx`.
6. Feature modules (`src/features/*`) each expose a small `services/*-service.ts` (Axios calls returning typed data) and `hooks/use-*.ts` (React Query wrappers around those calls) — the same domain split as the server's `auth`/`doctor`/`appointment`/`queue` modules.

## Routing & Route Groups

Route protection is entirely client-side (no middleware.ts) and layered:

| Layer | File | Behavior |
|-------|------|----------|
| Public group | `app/(public)/layout.tsx` | While auth is still initializing, renders nothing. Once resolved, if a `user` exists, redirects to `ROLE_DASHBOARD_PATH[user.role]`. Otherwise renders `children` (login/register/forgot-password). |
| Protected group | `app/(protected)/layout.tsx` | While initializing, renders nothing. Once resolved, if `isAuthenticated` is false, redirects to `/login`. Otherwise renders `children`. |
| Per-role layout | `app/(protected)/{admin,doctor,reception,patient}/layout.tsx` | Calls `useRoleGuard(role)`; if the logged-in user's role doesn't match, redirects to that user's own dashboard via `ROLE_DASHBOARD_PATH`. Renders nothing until authorized. |

`ROUTES` and `ROLE_DASHBOARD_PATH` (`src/constants/routes.ts`) are the single source of truth for path strings — always navigate/link through these instead of hardcoding paths.

The public queue-tracking page (`/track/[queueId]`) and its `PatientQueueTrackingPage` component are **not** currently reading the `queueId` route param — tracking is done by submitting an appointment code through a form on the page itself (see `useTrackAppointment` under [Feature Modules](#feature-modules)).

## Authentication Flow

1. `POST /auth/login` (or `/auth/register`) returns `{ user, accessToken, refreshToken }`.
2. `useAuthStore.setSession(user, tokens)` writes both tokens to `localStorage` (`STORAGE_KEYS.ACCESS_TOKEN` / `REFRESH_TOKEN`) and updates in-memory state (`user`, `accessToken`, `isAuthenticated: true`). The Zustand store itself is also `persist`-backed (localStorage key `cortexmed_auth_state`), but only `user` and `isAuthenticated` are persisted there — the token strings are read directly from their own dedicated `localStorage` keys, not from the persisted store slice.
3. On every full page load, `AuthProvider` reads the access token from `localStorage`; if present, it hydrates the store and calls `GET /auth/me` to refresh the `user` object (covers page refreshes and the store's `persist` rehydration). If there's no stored token, or `/auth/me` fails, the session is cleared.
4. `apiClient` (`src/services/api-client.ts`) attaches `Authorization: Bearer <token>` from `localStorage` on every request via a request interceptor (not from React state — this keeps it correct even before Zustand/React have rehydrated).
5. On a `401` from any non-`/auth/*` route, the response interceptor transparently calls `POST /auth/refresh` (deduping concurrent refreshes via a shared in-flight promise) and retries the original request once with the new access token. If refreshing fails, both tokens are cleared and the browser is hard-redirected to `/login`.
6. Logout (`DashboardShell`'s logout button) calls `clearSession()` and routes to `/login` — there is no server-side call to invalidate the refresh token.

Registration only allows self-service signup as `doctor` or `receptionist` (`SelfRegisterableRole`); `admin` and `patient` accounts must be created another way (the server also rejects `admin` self-registration).

## Data Fetching & Server State

All server communication goes through TanStack React Query, configured in `query-provider.tsx` with `staleTime: 60s`, `gcTime: 5m`, `refetchOnWindowFocus: false`, and a single retry for queries (no retry for mutations). Each feature follows the same pattern:

- **`*-service.ts`** — plain async functions wrapping `apiClient` calls, unwrapping the server's `ApiResponse<T>` envelope (`{ success, message, meta, data }`) to return `data` directly.
- **`use-*.ts`** — `useQuery`/`useMutation` hooks with query keys like `["appointments"]`, `["doctors"]`, `["queue", doctorId]`, `["appointment-track", code]`. Mutations invalidate the relevant query keys on success (e.g. creating an appointment invalidates both `["appointments"]` and `["queue"]`).
- **Polling**: `useQueue` refetches every 10s; `useTrackAppointment` every 15s. Neither currently subscribes to the Socket.IO events that would make polling redundant (see [Known Limitations](#known-limitations)).

## Real-Time (Socket.IO)

`SocketProvider` opens a connection whenever an access token is present in the auth store, passing it as `auth: { token }` on the handshake, and tears it down on token change/unmount. It exposes `{ socket, isConnected }` via `useSocket()`.

`SocketProvider` subscribes to all of the server's events (see the [server README](../server/README.md#real-time-events-socketio) for the full list) and reacts to each:

- `queue:updated` / `wait:updated` — invalidates the `["appointments"]` query and any `["queue", ...]` / `["appointment-track", ...]` queries, so affected screens refetch immediately instead of waiting for their next poll.
- `patient:booked` / `patient:called` / `patient:completed` — does the same cache invalidation **and** pushes a toast-style entry into `useNotificationsStore` (e.g. "New patient checked in: Jane Doe (Token #12)"), which backs the notification bell shown in `DashboardShell`.

React Query polling (`useQueue` every 10s, `useTrackAppointment` every 15s) still runs as a safety net, but in practice screens now update the moment a socket event arrives rather than waiting on the poll interval.

## State Management

- **`useAuthStore`** (Zustand + `persist`) — holds `user`, `accessToken`, `isAuthenticated`, and the actions `setSession`, `setUser`, `hydrateAccessToken`, `clearSession`. Persisted slice: `{ user, isAuthenticated }` only.
- **`useNotificationsStore`** (Zustand, not persisted) — an in-memory feed of the last 20 real-time events (`{ id, message, createdAt, read }`), populated by `SocketProvider` and cleared/marked-read from the UI. Backs the notification bell in `DashboardShell`.
- Everything else is local component state (`useState` for forms, filters, selected doctor, etc.) or server state via React Query. There is no separate UI/theme store — theme is handled by `next-themes`.

## UI Layer

- **`components/cortex/ui.tsx`** — shared, presentation-only building blocks used across every page: `AppLogo`, `Avatar`, `DashboardShell` (the sidebar + topbar chrome for all authenticated dashboards, role-aware nav via `sidebarNavFor(role)`), `Footer`, `PageTitle`, `Button`, `Panel`, `EmptyState`, `MetricCard`, `StatusPill`, `Progress`, `BarChart`, `HeatMap`, `Donut`, `HeroIllustration`. Charts (`BarChart`, `HeatMap`, `Donut`) are hand-rolled CSS/SVG-free visualizations, not backed by a charting library.
- **`components/cortex/pages.tsx`** — one exported component per route (`LandingPage`, `LoginPage`, `RegisterPage`, `AdminDashboardPage`, `AppointmentManagementPage`, `StaffDirectoryPage`, `AnalyticsPage`, `ReceptionDashboardPage`, `LiveQueuePage`, `DoctorDashboardPage`, `DoctorEmergencyIntakePage`, `PatientQueueTrackingPage`, `SettingsPage`, `NotFoundPage`), plus small private table/row helpers (`DoctorTable`, `AppointmentTable`, `LiveQueueCards`, `QueueRow`). Styling is Tailwind utility classes inline, no CSS modules or styled-components.
- The `src/components/{layout,shared,ui}` and `src/{hooks,lib,styles,utils}` directories (outside `cortex/`) are currently empty scaffolding (`.gitkeep` only) reserved for future decomposition of `pages.tsx`/`ui.tsx`.

## Feature Modules

| Feature | Status | Notes |
|---------|--------|-------|
| `appointment` | Implemented | `listAppointments`, `createAppointment`, `trackAppointment` + `useAppointments`, `useCreateAppointment`, `useTrackAppointment`. Booking auto-triggers server-side AI triage and queue recalculation. |
| `doctor` | Implemented | `listDoctors`, `createDoctor` + `useDoctors`, `useCreateDoctor`. `createDoctor` can create a brand-new doctor `User` inline (name/email/password) as part of the same call. |
| `queue` | Implemented | `getQueue`, `callNextPatient`, `completePatient` + `useQueue`, `useCallNextPatient`, `useCompletePatient`. Backs both the receptionist "Live Queue" and doctor "My Queue" screens. |
| `hospital` | Implemented | `getHospitalSettings`, `updateHospitalSettings` + `useHospitalSettings`. Backs the admin "Hospital Settings" panel (hospital name, facility ID). |
| `triage` | Implemented | `getAiEngineStatus` + `useAiEngineStatus` (polls every 30s). Surfaces whether the AI triage engine is online and which LLM backend/model it's using — shown on the admin dashboard/settings so staff know if triage is running live or falling back to the neutral default. Per-appointment triage fields (`priority`, `triageReason`, `triageConfidence`, `triageFactors`, `riskLevel`, `recommendedDepartment`, `aiSummary`) still ride along on the `Appointment` type from the `appointment` feature. |
| `authentication` | Implemented (hooks only) | `useChangePassword`, `useDeactivateAccount`, `useUpdateNotificationPreferences` live here; core login/register/session logic still lives in `src/services/auth-service.ts` + `src/store/auth-store.ts` + `src/providers/auth-provider.tsx` rather than under `features/authentication`. |
| `analytics` | Implemented (client-computed) | `useHospitalAnalytics(appointments, doctors)` derives average wait, doctor availability %, ER efficiency %, priority breakdown, hourly volume, a weekly heatmap, and per-doctor performance — all computed in the browser from `appointments`/`doctors` data rather than from a dedicated analytics endpoint (the server's `analytics` module is still an empty scaffold). |
| `patient` | Scaffolded only | The `(protected)/patient` route group has a role-guarding `layout.tsx` but no `page.tsx` routes yet; the "patient" experience that exists (`PatientQueueTrackingPage`) is reached via the public `/track/[queueId]` route, not `/patient/*`. |

## Known Limitations

- No test suite, Storybook, or `.env.example` in the repo.
- Route protection is entirely client-side — there's no `middleware.ts`, so a protected page's HTML/JS still ships to an unauthenticated request before the redirect fires client-side (a brief blank screen, not a security boundary).
- `components/cortex/pages.tsx` (1000+ lines) and `ui.tsx` (~440 lines) hold effectively the entire UI in two files; the `features/*/components` and `components/{layout,shared,ui}` directories exist to receive a future decomposition but are currently empty.
- Logout is local-only (clears `localStorage` + Zustand state); there's no server call to revoke the refresh token.
- `/forgot-password` and password-reset (`ROUTES.RESET_PASSWORD`) are referenced in `routes.ts` and linked from the login page, but the route folder is an empty scaffold — no page implementation exists yet.
- `/track/[queueId]`'s dynamic segment isn't read by `PatientQueueTrackingPage` — tracking works via a code entered in a form on that page, not the URL param.
- The `(protected)/patient` route group has no page routes yet — there is no logged-in "patient" dashboard experience, only the public tracking page.
