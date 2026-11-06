# TypeRush — Client

Competitive typing platform front end: free typing tests, a practice arena with your own text, timed contests with per-contest leaderboards, and personal progress tracking.

Built with Next.js 16 (App Router) and deployed on Vercel. The API lives in the sibling [`typerush-server`](../typerush-server) repository.

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [How the app works](#how-the-app-works)
  - [API layer](#api-layer)
  - [Sessions and auth](#sessions-and-auth)
  - [Errors and toasts](#errors-and-toasts)
  - [Ranked vs practice-only runs](#ranked-vs-practice-only-runs)
  - [Leaderboards](#leaderboards)
  - [Avatars](#avatars)
- [Deployment](#deployment)
- [Quality checks](#quality-checks)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

---

## Features

**Public**

- Landing page with a working typing test (no account needed)
- SEO pages: `/type-practice`, `/typing-speed-test`, `/wpm-test`
- Dark/light themes, keyboard-sound feedback, reduced-motion support

**Accounts**

- Email + one-time-code verification, login, password reset
- Google sign-in (authorization-code exchange)
- Profile editing, avatar upload, account deletion

**Practice**

- Passage bank with search and difficulty filters
- Four arena modes: Paragraphs, Words, Quotes, and Custom text
- Three languages: English, Bangla, Hindi
- Duration presets (15 / 30 / 60 s) plus a custom 5 s – 5 min length
- Custom text saved in `localStorage` (up to 20 texts, 2,000 characters each) for practice only
- Fullscreen mode, live WPM / accuracy / error counters

**Competition**

- Contests: browse upcoming/running/finished, join and leave, run the contest text in place
- Global leaderboard with boards split by run length, offset pagination
- Per-contest leaderboards with duplicate typists collapsed
- Shareable results (WPM, accuracy, errors, duration)

**Dashboard**

- Current WPM, accuracy, streak, total tests
- Adaptive dual-axis progress chart (WPM + accuracy) over 7 / 30 / 90 days, with hover/tap tooltips
- Recent runs, upcoming and joined contests

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16.3.5 — App Router, Server Components, Turbopack |
| UI | React 19, Tailwind CSS v4, `lucide-react`, `motion` |
| State / data | Redux Toolkit + RTK Query |
| Forms | `react-hook-form` + `zod` (`@hookform/resolvers`) |
| Feedback | `sonner` toasts |
| Analytics | Vercel Analytics + Speed Insights |
| Language | TypeScript (strict) |
| Lint | ESLint 9 + `eslint-config-next` |

---

## Architecture

```
Browser
  │
  ├─ /backend/* ──────▶ Vercel rewrite ──────▶ Express API (Render)
  │                        (next.config.ts)         │
  │                                                 ├─▶ PostgreSQL (Prisma)
  ├─ middleware.ts  (refreshes access token        ├─▶ Redis (rate limits)
  │                  before protected routes)      └─▶ Cloudinary (avatars)
  │
  └─ App Router pages (server shell) + client components (RTK Query cache)
```

Two rules keep the setup simple:

1. **The browser never talks to the API origin directly.** RTK Query's `baseUrl` is `/backend`, and `next.config.ts` rewrites that prefix to `BACKEND_BASE_URL`. Cookies stay first-party and there are no CORS preflights.
2. **`lib/backend-url.ts` is the only place the backend URL is resolved.** The rewrite, middleware, and server components all import it, so they cannot drift apart.

---

## Project structure

```
app/
  (marketing)/            landing + SEO pages
  (auth)/                 login, signup, OTP, password reset
  (app)/                  authenticated shell (home, practice, contests, …)
  auth/                   OAuth callback
  test/                   standalone typing test
components/
  app/                    AppShell, Topbar, Sidebar, dashboard widgets
  landing/                hero, TypingCard (typing engine UI)
  test/                   TestExperience (arena modes)
  ui/                     primitives, Avatar, Reveal
  auth/                   shared auth form fields
hooks/                    useTypingTest and friends
lib/
  features/               RTK Query slices: auth, user, practice, contest, upload
  auth.tsx                session provider
  backend-url.ts          backend origin resolution
  practice.ts             offline words / quotes / paragraphs
  custom-texts.ts         localStorage library for your own texts
  theme.tsx, keySound.ts  theme + audio preferences
helper/                   error-helper (human-readable API errors)
config/                   (legacy) Cloudinary config, unused by the app
middleware.ts             protected-route gate + token refresh
next.config.ts            image allowlist + /backend rewrite
```

---

## Getting started

### Prerequisites

- Node.js 20+ (developed on Node 22)
- npm 10+
- A running TypeRush API — local (`typerush-server`) or the deployed one

### Install and run

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>.

Point the app at your API before starting — create `.env.local` (there is no committed example file) with:

```bash
# .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

The API repo must be running on that origin, with its database migrated and seeded with at least one passage if you want the practice bank to be non-empty.

---

## Environment variables

| Variable | Required | Scope | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | Production | Client + server | Full origin of the Express API, no trailing slash (e.g. `https://typerush-server.onrender.com`). |
| `API_URL` | No | Server only | Optional fallback used by server-side helpers when the public variable is absent. |

`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` appear in older local `.env` files but are **not used by this app** — uploads are handled by the API. Do not add them to Vercel.

Override the backend without touching `.env`:

```powershell
$env:NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:5055"; npm run dev
```

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server (Turbopack) on port 3000. |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | ESLint over the whole project. |
| `npx tsc --noEmit` | Type check without emitting files. |

---

## How the app works

### API layer

`lib/features/api/base-api.ts` creates the RTK Query API:

- `baseUrl: "/backend"` — rewritten by Next to the real API
- `credentials: "include"` — cookies are sent on every request
- `baseQueryWithReauth` retries a request once after `POST /api/v1/auth/refresh` when it receives `401`

Slices live in `lib/features/*` (`features.auth.ts`, `features.user.ts`, `features.practice.ts`, `features.contest.ts`, `features.upload.ts`). Components consume generated hooks — no `fetch` calls in components.

### Sessions and auth

- The API sets httpOnly `accessToken` (15 min) and `refreshToken` (15 days) cookies.
- `middleware.ts` guards `/home`, `/practice`, `/contests`, `/leaderboard`, `/profile`, `/progress`, `/achievements`, `/settings`, `/battles`, and refreshes an expired access token before the page renders.
- `ClientAuthGate` re-checks the session in the browser and redirects to `/login?next=…` if needed.
- `useAuth()` exposes the current user; the navbar and dashboard read from it so profile/avatar edits appear instantly.

### Errors and toasts

`helper/error-helper.ts` exports `getApiError(error)`. It converts any thrown value — RTK error, `TypeError`, plain `Error`, string — into one short, actionable sentence. It maps known server messages (duplicate email, wrong password, expired code, rate limit, oversized upload, Cloudinary permission failure) and falls back to the HTTP status class. Every toast and inline form error runs through it; raw status codes and API names are never shown.

### Ranked vs practice-only runs

A run is submitted only when **all** of these hold:

- the user is signed in,
- the duration is a preset (15 / 30 / 60 s), and
- the content is not user-supplied (`unranked` is false).

Contest runs submit to `POST /contests/:id/submit` instead of the practice board. Custom lengths and your own pasted text render `TypingCard` with `unranked`, which removes the submit button and makes the handler a no-op — nothing is sent, nothing is ranked. Those texts are stored only in the browser under `typerush:custom-texts`.

### Leaderboards

Results carry a `duration` field, which is the leaderboard category. The global board (`GET /practices/results?duration=…&offset=…`) loads one category at a time with a "Load more" button. Contest boards (`GET /contests/:id/leaderboard`) collapse duplicate typists and keep the best run per person. Each contest has its own board.

### Avatars

`components/app/ProfileEditor.tsx` downscales the chosen image to 512 px WebP on a canvas, then uploads it to `POST /api/v1/uploads`. The API stores it in Cloudinary and writes `avatarUrl` on the user. If an older server build responds without a `user`, the client falls back to `PUT /api/v1/users { avatarUrl }`. `next/image` is allowlisted for `res.cloudinary.com` and `**.googleusercontent.com`; other hosts fall back to a plain `<img>`.

---

## Deployment

### Vercel

1. Import the repository, framework preset **Next.js**.
2. Add `NEXT_PUBLIC_BACKEND_URL` for Production, Preview, and Development.
3. Deploy. The build runs `next build`; no other configuration is required.

CLI:

```bash
npx vercel --prod
```

### Backend dependency

The client expects the API to be reachable at `NEXT_PUBLIC_BACKEND_URL` with CORS-safe cookie settings (the proxy makes them first-party, so the API only needs to accept the forwarded `Cookie` header). Server routes and the full API contract are documented in the server repository.

---

## Quality checks

Run these before opening a pull request:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Keep components consistent with the surrounding patterns: Tailwind utility classes, RTK Query hooks, `getApiError` for user-facing failures, and `unranked` for anything that must not reach a leaderboard.

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `404 {"message":"Route not found"}` on a request | The deployed API is older than the client. | Redeploy the server, or check the endpoint exists on the live build. |
| Redirect loop to `/login` | Expired or missing cookies, or `NEXT_PUBLIC_BACKEND_URL` pointing somewhere unreachable. | Verify the API is running and the env var has no trailing slash. |
| `Invalid src prop … hostname not configured` | An avatar URL from an unlisted host. | `Avatar` falls back to `<img>`; add the host to `next.config.ts` if it should be optimised. |
| Avatar upload fails with a permission error | The Cloudinary key lacks the `create` action. | Create a key with upload rights and update the server's `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`. |
| Practice bank empty | No passages uploaded. | Seed passages through the admin API (`POST /api/v1/admin/submit`). |
| Chart shows "No tests in the last N days" | No results in the selected window. | Finish a ranked run or widen the range to 90D. |

---

## Roadmap

- 1v1 battles (currently a `ComingSoon` page; the server already depends on Socket.IO)
- Achievements and XP surfaces (`/achievements` is a placeholder)
- Admin UI for contests, passages, announcements, and users (API exists; no screens yet)
- Real-time leaderboard updates instead of poll/revalidate
- Team/organisation dashboards for `ORG` accounts

---

## License

Private project — all rights reserved.
