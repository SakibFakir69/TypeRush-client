import "server-only";

import { cookies } from "next/headers";
import { backendUrl } from "@/lib/backend-url";

export type ServerSessionUser = {
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
} & Record<string, unknown>;

/** The server wraps payloads in `data` — sometimes. Accept every shape. */
function pickUser(body: unknown): ServerSessionUser | null {
  if (!body || typeof body !== "object") return null;
  const d = body as Record<string, unknown>;
  const payload =
    d.data && typeof d.data === "object"
      ? d.data
      : d.user && typeof d.user === "object"
        ? d.user
        : null;
  if (!payload) return null;
  const record = payload as Record<string, unknown>;
  const nested = record.user;
  const user = nested && typeof nested === "object" ? nested : record;
  return user as ServerSessionUser;
}

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

async function fetchMe(accessToken: string): Promise<ServerSessionUser | null> {
  try {
    const res = await fetch(backendUrl("/api/v1/users"), {
      headers: { Cookie: `accessToken=${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return pickUser(await res.json().catch(() => null));
  } catch {
    return null;
  }
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(backendUrl("/api/v1/auth/refresh"), {
      method: "POST",
      headers: { Cookie: `refreshToken=${refreshToken}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return readAccessToken(await res.json().catch(() => null));
  } catch {
    return null;
  }
}

/**
 * Read the logged-in user on the server from the httpOnly cookies.
 *
 * Calls the backend directly (never the app's own public origin), so it works
 * behind proxies and inside Docker/serverless where the `Host` header is not
 * routable. If the short-lived access token has expired we refresh with the
 * refresh cookie first — the same recovery the browser-side RTK baseQuery does.
 */
export async function getSessionUser(): Promise<ServerSessionUser | null> {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const refreshToken = jar.get("refreshToken")?.value;

  if (accessToken) {
    const user = await fetchMe(accessToken);
    if (user) return user;
  }

  if (!refreshToken) return null;
  const refreshed = await refreshAccessToken(refreshToken);
  return refreshed ? await fetchMe(refreshed) : null;
}

export function hasRole(
  user: ServerSessionUser | null,
  allowed: string[]
): user is ServerSessionUser {
  if (!user) return false;
  const role = typeof user.role === "string" ? user.role : "USER";
  return allowed.includes(role);
}

export function isAppAllowed(user: ServerSessionUser | null): user is ServerSessionUser {
  if (!hasRole(user, ["USER", "admin"])) return false;
  if (typeof user?.authProvider === "string" && user.authProvider === "google") {
    return true;
  }
  return user?.emailVerified === true;
}

/** Best-effort verification code (never blocks navigation on failure). */
export async function sendVerifyCode(email: string): Promise<void> {
  try {
    await fetch(backendUrl("/api/v1/auth/resend-verify-otp"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });
  } catch {
    // Verify screen always offers Resend — never strand the user here.
  }
}
