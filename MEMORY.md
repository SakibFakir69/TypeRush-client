# TypeRush Client — Project Memory

Living notes for future work. Update when conventions change.

## Stack
- Next.js 16.3.5 (App Router, Turbopack) + React 19 + Tailwind v4 + TypeScript 5
- motion (scroll reveals), next-themes (dark/light), lucide-react (icons only —
  brand icons were REMOVED upstream; hand-roll brand SVGs), next/image
- react-hook-form + zod + @hookform/resolvers for ALL forms
- **Redux Toolkit Query**: shared `lib/features/api/base-api.ts`
  (reducerPath "api", tags Session/Paragraph/Result) + injected feature
  modules `lib/features/auth/features.auth.ts` (session, login, logout,
  refresh, OTP, reset) and `lib/features/user/features.user.ts` (getMe,
  create, update, delete). `lib/auth.tsx` is a hook-only `useAuth`
  (no provider) over the session query; `helper/error-helper.ts` formats
  rejections. No manual thunks, no duplicated session state.
- next/font: Ubuntu (sans) + Geist Mono (typing text)
- **Theme**: custom `lib/theme.tsx` (class toggle + system support,
  `typerush-theme` key) — next-themes was removed (its rendered `<script>`
  tripped React 19 console errors), along with the blocking pre-paint
  script (React 19 rejects sync scripts outside `<head>`)
- **Toasts**: sonner via `components/ui/ThemedToaster.tsx` on auth
  success actions (login, logout, code sent, password updated)
- Backend: Express on :5000 (`API_URL` env), client talks via `/backend` rewrite

## Structure
- `app/page.tsx` landing (thin composition) · `app/test/page.tsx` typing app
- `app/(app)/` guarded member area (Sidebar+Topbar shell, session gate in
  layout): home (dashboard), practice (hub), profile, settings, leaderboard
  (live) + Coming Soon screens (battles, contests, progress, achievements).
  No friends route. URL-stable.
- `/test` is the PUBLIC arena: logged-in visitors redirect to `/practice`.
  Shortcuts are session-aware: S→session/test, B→battles/login,
  C→contests/test, G→session/login. Stats show "–" until typing starts.
- Results: TypingCard submits `{paragraphId,wpm,accuracy,errors,timeTaken}`
  on finish (admin passages + logged in only) → in-app `/leaderboard`
  renders the live board with your row highlighted.
- ⚠️ SERVER BUG #3: `POST /practices/results` has no auth middleware, so
  `req.user` is always empty → submit 401s until `verifyToken` is added.
- Practice is server-driven: `getParagraphs` (admin bank, search/limit)
  feeds `/practice` hub; `/practice/session?id=` types one passage in-app
  (kinds fall back to the local bank). No Level labels anywhere.
- Server envelope is ALWAYS `{success, message, errorCode?, data}` —
  unwrap `data` in every transformResponse (single objects AND lists).
  Leaderboard nests twice: `data.data[]`, rows carry `userName` (no ids),
  zero-WPM rows are filtered.
- `components/app/` shell + dashboard widgets; `lib/dashboard.ts` demo data
- `app/(auth)/` login, signup, forgot-password, verify-otp, reset-password
- `app/auth/callback` Google OAuth landing
- `components/landing/*` one file per section · `components/ui/*` primitives
- `lib/api.ts` (fetch wrapper), `lib/auth.tsx` (session), `lib/practice.ts`
  (EN/BN/HI banks), `lib/keySound.ts` (Web Audio blips), `lib/landing.ts`
- `hooks/`: useTypingTest(target), useActiveSection (scroll-position scrollspy)

## Conventions (do not drift)
- **Semantic theme tokens only**: bg-app/card/raised/inset/chip, text-ink/
  muted/faint, border-line, text-accent. Never slate/white/black utilities.
  Accent = teal (dark) / pine (light). Stat colors: WPM accent, acc amber-500,
  err rose-500. Solid mint fills keep black text.
- **LayoutProps<"/">** in root layout (Next 16 typegen). `useSearchParams`
  always under Suspense. No sync setState in effects (lint enforced).
- **Keyboard language**: every major action has a key + kbd badge + sound +
  glow pulse. Map: 1–5 sections, T theme, L login, S/B test, C contest,
  G teams, R ranks, P progress, D/W/M/A leaderboard tabs, E/O contest tabs,
  F signup. Ignored inside inputs. Sounds = Web Audio synths in keySound.ts.
- **Avatars**: always `components/ui/Avatar.tsx` (initials fallback — photo
  host failures once duplicated names via alt text).
- **Images**: next/image + remotePatterns (no `domains`, deprecated in Next 16).
- **Route rules**: use `Link` for internal routes (lint enforced).

## Auth contract (server: typerush-server, PORT=5000)
- POST /api/v1/auth/login {email,password} → httpOnly cookies + body tokens
- POST /api/v1/users {name,fullName,email,country,password 8–100} (signup)
- Signup flow: register → auto-send code → /verify-signup?email= →
  verify-email (marks emailVerified) → welcome overlay → /login.
  Login checks the fresh session: unverified → resends code + diverts
  to verification. Resend lives on the verify screen (cooldown-aware).
- Login lands on **/home** (was /test). `(app)` is server-guarded:
  no session → /login?next=/home; unverified local accounts get a fresh
  code + divert to verification (`isAppAllowed` — Google exempt).
  Roles via `hasRole`: no role column yet, every account counts as "user".
- POST /api/v1/auth/forgot-password {email} → OTP email
- POST /api/v1/auth/verify {email,otp} → {resetToken} (sessionStorage)
- POST /api/v1/auth/reset-password {resetToken,password 8–128}
- GET /api/v1/auth/google → FRONTEND_URL/auth/callback?token=
- GET /api/v1/users = session (cookie or Bearer)
- ⚠️ KNOWN SERVER BUGS: reset token stored at `otp:reset-token:{email}` but
  read from `reset:token:{hash}` (never matches); reset route requires
  access-JWT so logged-out reset 401s; helpers/ dir missing (won't compile
  as-is); CORS `*` breaks credentialed calls (client dodges via rewrite).

## Verified behaviors (browser-tested)
- Scrollspy incl. footer About; all shortcut keys navigate + glow; theme
  persists; demo loop WPM ramps ~12→140, errors dip accuracy; mute global;
  countdown 24→22 ticks; tab switches D/W/M/A, E/O.
