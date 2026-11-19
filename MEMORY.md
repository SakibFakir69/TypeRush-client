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
  (live), contests, battles + Coming Soon screen (progress). URL-stable.
- **Progress**: `/progress` is a real screen — `GET /api/v1/progress/overview`
  (lifetime totals), `/charts?range=7d|30d|90d` (one row per day: avg+max
  WPM, avg accuracy, sessions) and `/history?page&limit&from&to` (the run
  list). `components/app/ProgressDashboard.tsx` + `ProgressCurve` (dual-axis
  chart with a volume strip), `ProgressHistory` (date window + page size +
  pagination) and `ProgressUnlocks` (badge shelf). The server only applies
  the history window when BOTH `from` and `to` are sent — the client fills in
  the missing end. Lifetime totals fall back to the practice stats when the
  server has no `UserStats` row yet. The `Progress` tag is invalidated by
  every saved run.
- **Achievements**: `/achievements` is a real screen — `GET /api/v1/achievements`
  (catalogue + `unlockedAt` per badge) and `/api/v1/achievements/me` (own
  unlocks). The SERVER unlocks badges: after every practice run, contest run
  and finished battle it re-checks the user's numbers (best WPM, best
  accuracy, runs, day streak, contests, battles) against the published
  thresholds and returns `unlockedAchievements` in the submit response →
  `TypingCard` toasts it. The unlock runs in its own short transaction (the
  Neon DB is remote: ~250 ms per query), so a slow badge check never fails a
  saved run. Empty catalogue → the page falls back to the local milestones.
  The catalogue read ALSO re-runs the unlock check, so a badge unlocks even
  when the run that earned it was saved elsewhere. Badge categories, tier
  colours and the goal sentences live in `lib/achievement-meta.ts` (shared by
  the shelf and the progress screen).
- **Badge colours**: WPM = accent, accuracy = amber-500, errors = rose-500
  (the dashboard curve was violet for accuracy — now amber everywhere).
- `/test` is the PUBLIC arena: logged-in visitors redirect to `/practice`.
  Shortcuts are session-aware: S→session/test, B→battles/login,
  C→contests/test, G→session/login. Stats show "–" until typing starts.
- Results: TypingCard submits `{paragraphId,wpm,accuracy,errors,timeTaken}`
  on finish (admin passages + logged in only) → in-app `/leaderboard`
  renders the live board with your row highlighted.
- **Battles**: `/battles` queue (`/api/v1/matchmaking/*`) → `/battles/[id]`
  race. One Ably connection per tab (`lib/ably.ts`), tokens come from the API
  (never a browser key). Realtime is the fast path; every step has an HTTP
  polling fallback so a blocked WebSocket still ends in a finished race.
  Starting gun is server-side: both players must read/ack the match, then
  `startedAt = now + 3s`. Results are Elo-settled once both submit.
- **Private invite**: `Play a friend` on `/battles` opens `/battles/invite`,
  which creates a 5-minute code (`/api/v1/battle/invite`) with a chosen race
  length (30/60/120 s) and the newest passage. Sharing
  `/battles/invite?code=…` lets a friend accept; both land in the same
  `/battles/[id]` room. `private-match:{code}` rides Ably with 3 s status
  polling; invites skip the queue and the ack handshake, and `match.duration`
  drives the race clock.
- **History**: sidebar `/history` → Ranked tab (`/api/v1/matchmaking/history`:
  own WPM/accuracy/result/rating delta + opponent) and Invites tab
  (`/api/v1/battle/invite/history`: sent + received). Invite rows also carry the
  match result (`WIN`/`LOSS`/`DRAW`/`ABANDONED`), WPM and Elo delta, and keep the
  `Open` link. Filters, empty states, and a "Latest battles" panel on the
  dashboard that merges the newest of both.
- **Maintenance**: `MAINTENANCE_MODE=true` on Vercel locks the app to
  `/maintenance` — every other path (pages, login, `/backend` proxy calls)
  redirects back there, so visitors can't reach any other screen. Only Next's
  build assets still load. The flag lives in `middleware.ts` and needs a
  redeploy after changing. ⚠️ It also de-indexes the whole site while it is
  on (every path redirects), so keep it off outside a real outage.
- **SEO**: the canonical origin is `typepotijogita.com`, and in production it
  is FIXED in `lib/seo/site.ts` — `NEXT_PUBLIC_SITE_URL` is only honoured in
  development, so no env var or preview deploy can point the canonicals,
  the sitemap or the social cards at another host. `typerush.app` serves an
  OLD Lovable build in Portuguese — it must never be pointed at by the
  sitemap, robots or canonicals, and it should be 301'd here (or dropped).
  `typerush-client.vercel.app` is only the pre-domain host — it must not be
  canonicalised either (redirect it to the real domain).
  Public, indexable pages: `/`, `/test`, `/typing-speed-test`, `/wpm-test`,
  `/type-practice`, `/about`, `/contact`, `/privacy`, `/terms`, `/cookies`.
  The guide pages carry FAQPage + BreadcrumbList + WebApplication schema and
  their own generated OG card. `/leaderboard`, `/contests`, `/practice` are
  still behind the session (307 → /login) — they cannot rank until they are
  public, and they are deliberately absent from the sitemap.
- **Titles**: `TITLE_TEMPLATE` (`%s | TypePotijogita`) lives in
  `lib/seo/site.ts`. ⚠️ In Next, a layout that defines a title RESETS the
  inherited template for its whole subtree (`resolve-metadata.js` re-stashes
  the template from the segment's own title object), so a layout with
  children must re-declare `template: TITLE_TEMPLATE`. A client-component
  page cannot export `metadata` at all → those titles live in a `layout.tsx`
  next to the page (`app/(auth)/*/layout.tsx`, `app/(app)/*/layout.tsx`).
- **JSON-LD**: one `@id` graph — `#website` (WebSite), `#application`
  (WebApplication + SoftwareApplication), `#organization` (Organization,
  legalName Seven Ventures Labs). No `SearchAction`: there is no internal
  search, and pointing Google at an endpoint that does not exist is a
  markup lie.
- **Ads**: the publisher id (`ca-pub-6208140455870067`) is set in Vercel
  (Production + Preview). The AdSense snippet is rendered in
  `app/layout.tsx` as a plain `<script async src>` — React hoists it into
  the `<head>` and it is SERVER-RENDERED on every page. This is
  load-bearing: the AdSense crawler reads the page source and never sees
  an injected-after-consent script ("Couldn't verify your site"), and
  `next/script` does not work either — `beforeInteractive` only emits a
  `<link rel="preload">`. The ad UNITS live on `/` (public) and the three
  member lobbies (`/practice`, `/battles`, `/contests`). The three guide
  pages (`/typing-speed-test`, `/wpm-test`, `/type-practice`) are
  deliberately ad-free — visitors land there from search and start a test.
  Consent is Google's: `NEXT_PUBLIC_ADSENSE_CMP=google` → their CMP
  blocks the ad request until the visitor answers; the cookie policy's
  "change cookie choices" button calls `googlefc.showRevocationMessage()`.
- **No consent wall**: `resolveConsent()` returns "granted" when nobody has
  answered, so ads show for everyone without an accept click. Our dialog
  only renders when `forced` (opened from the cookie policy); a stored
  "denied" keeps ads off. Adsterra checks `thirdPartyAdConsent()` (own
  answer or the middleware's "auto" country) and stays off in the EEA/UK
  until someone accepts on purpose.
  Three rules: an ad NEVER goes on a typing surface (`/test`,
  `/practice/session`, `/battles` — accidental clicks = policy strike),
  the snippet is always in the HTML, and auto ads stay off unless
  deliberately enabled in the dashboard.
  `app/ads.txt/route.ts` generates ads.txt from the same env var.
  Two placements in use: `/` (home) + the member rail.
- **Ads — Adsterra (second network)**: `components/ads/AdsterraSlot.tsx`
  (`AdsterraNative`, `AdsterraBanner`) + the keys in `lib/ads.ts`. One calm
  format in use: a **728×90** on `/` above the footer, mounted only at
  ≥768px (it is inside an `srcdoc` iframe because Adsterra's banner script
  uses `document.write`). No popunder / social bar / interstitial — on
  purpose. The native loader is a sibling `<script>` inserted before the
  `container-<key>` div and removed on unmount so a client-side return
  re-runs it; `AdsterraNative` is kept for a future reading page. Adsterra is **not** a Google CMP vendor: with
  `ADSENSE_CMP=google` it loads only when our own banner was accepted or the
  middleware flagged the country "auto" (`thirdPartyAdConsent()`), so it
  stays off in the EEA/UK. `NEXT_PUBLIC_ADSTERRA_PUBLISHER` adds its ads.txt
  line; ads never go on `/test`, `/practice/session`, `/battles`.
- **Member rail**: `components/ads/AdRail.tsx` renders in `AppShell` (right
  column, `min-[1740px]` and up, sticky) on the three LOBBY hubs - `/practice`,
  `/battles`, `/contests` - via `isMemberAdRoute()` (exact match, so
  `/practice/session`, `/battles/<id>`, `/battles/invite` and
  `/contests/<id>` never inherit it). One `AD_SLOTS.rail` unit, inert until
  that slot id is set (`NEXT_PUBLIC_ADSENSE_SLOT_RAIL` or the literal in
  `lib/ads.ts`).
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
- **SEO rules (do not drift)**:
  - `lib/seo/site.ts` owns the origin (SITE_URL / absoluteUrl / ogImages /
    TITLE_TEMPLATE). `metadataBase` points at it — NEVER hard-code a domain
    in a page, and never leave a placeholder (`YOUR-DOMAIN.com` once
    canonicalised the whole site to a domain nobody owns). In production
    the origin is fixed to `typepotijogita.com`.
  - Every indexable page sets its OWN `alternates.canonical`. A canonical in
    the root layout is inherited by every page that does not override it.
  - Every route has its own `title` + `description` (a shared root default
    means duplicated metadata across a dozen routes). Client pages get them
    from a `layout.tsx` beside the page.
  - `openGraph` is merged shallowly: a page that defines its own must list
    `images: ogImages(...)` or it loses the social card. The root layout
    sets NO `openGraph.url` — each indexable page sets its own.
  - Member area (`app/(app)`) and `/login`, `/signup`, `/auth/callback`,
    `/maintenance` are `noindex` — they are behind a session or are
    hand-off screens.
  - FAQ blocks render through `components/seo/FaqSection.tsx`, which emits
    the matching FAQPage schema from the same list (Google ignores a FAQ
    schema that does not match the visible copy).
  - `app/sitemap.ts` lists ONLY public pages that render without an
    account; `app/robots.ts` must point at its own sitemap.

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
