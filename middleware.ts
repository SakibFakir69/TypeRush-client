import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { backendUrl } from "@/lib/backend-url";

const PROTECTED_PATHS = [
  "/home",
  "/battles",
  "/history",
  "/practice",
  "/contests",
  "/leaderboard",
  "/profile",
  "/progress",
  "/achievements",
  "/settings",
];

/** Access token lives on `data.accessToken` (and sometimes on the root). */
function readAccessToken(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const d = body as Record<string, unknown>;
  const data =
    d.data && typeof d.data === "object"
      ? (d.data as Record<string, unknown>)
      : {};
  const token = data.accessToken ?? d.accessToken;
  return typeof token === "string" && token ? token : null;
}

type RefreshResult =
  | { status: "ok"; accessToken: string; setCookies: string[] }
  | { status: "invalid" }
  | { status: "error" };

/**
 * Exchange the refresh cookie for a new access token.
 *
 * Talks to the backend directly instead of fetching our own `/backend` URL:
 * middleware can run before the app server can reach its own public origin.
 */
async function refreshSession(refreshToken: string): Promise<RefreshResult> {
  try {
    const res = await fetch(backendUrl("/api/v1/auth/refresh"), {
      method: "POST",
      headers: { Cookie: `refreshToken=${refreshToken}` },
      cache: "no-store",
    });

    if (!res.ok) {
      // 401/403 means the refresh token itself is dead — clear it.
      return res.status === 401 || res.status === 403
        ? { status: "invalid" }
        : { status: "error" };
    }

    const accessToken = readAccessToken(await res.json().catch(() => null));
    if (!accessToken) return { status: "error" };

    return {
      status: "ok",
      accessToken,
      setCookies: res.headers.getSetCookie?.() ?? [],
    };
  } catch (err) {
    console.error("Middleware refresh failed:", err);
    return { status: "error" };
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (accessToken) {
    return NextResponse.next();
  }

  let refresh: RefreshResult | null = null;

  if (refreshToken) {
    refresh = await refreshSession(refreshToken);

    if (refresh.status === "ok") {
      // Hand the new token to this render too: Server Components call
      // `cookies()` from the *incoming* request, which still has no
      // accessToken at this point. Without this the page renders logged out
      // and only the *next* navigation sees the session.
      const requestHeaders = new Headers(req.headers);
      const existing = requestHeaders.get("cookie");
      requestHeaders.set(
        "cookie",
        `${existing ? `${existing}; ` : ""}accessToken=${refresh.accessToken}`
      );

      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });

      for (const cookie of refresh.setCookies) {
        response.headers.append("set-cookie", cookie);
      }

      return response;
    }
  }

  const loginUrl = new URL("/login", req.url);
  // Keep the query string: invite links (`/battles/invite?code=…`) must survive
  // the login round-trip.
  loginUrl.searchParams.set("next", `${pathname}${req.nextUrl.search}`);
  const response = NextResponse.redirect(loginUrl);

  // Only drop cookies the backend explicitly rejected; a network blip must
  // not log the user out.
  if (refresh?.status === "invalid") {
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
  }

  return response;
}

export const config = {
  matcher: [
    "/home/:path*",
    "/battles/:path*",
    "/history/:path*",
    "/practice/:path*",
    "/contests/:path*",
    "/leaderboard/:path*",
    "/profile/:path*",
    "/progress/:path*",
    "/achievements/:path*",
    "/settings/:path*",
  ],
};
