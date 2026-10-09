# TypeRush Client — Project Memory

Living notes for future work. Update when conventions change.

## Stack
- Next.js 16.3.5 (App Router, Turbopack) + React 19 + Tailwind v4 + TypeScript 5
- motion (scroll reveals), next-themes (dark/light), lucide-react (icons only —
  brand icons were REMOVED upstream; hand-roll brand SVGs), next/image
- react-hook-form + zod + @hookform/resolvers for ALL forms
- next/font: Ubuntu (sans) + Geist Mono (typing text)
- Backend: Express on :5000 (`API_URL` env), client talks via `/backend` rewrite

## Structure
- `app/page.tsx` landing (thin composition) · `app/test/page.tsx` typing app
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
