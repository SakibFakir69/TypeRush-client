import "server-only";

import { cookies, headers } from "next/headers";

export type ServerSessionUser = {
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
} & Record<string, unknown>;

/** Read the logged-in user on the server via the httpOnly cookie, through the same-origin proxy. */
export async function getSessionUser(): Promise<ServerSessionUser | null> {
  const jar = await cookies();
  const token = jar.get("accessToken")?.value;
  if (!token) return null;

  const h = await headers();
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  try {
    const res = await fetch(`${protocol}://${host}/backend/api/v1/users`, {
      headers: { Cookie: `accessToken=${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json: unknown = await res.json().catch(() => null);
    if (!json || typeof json !== "object") return null;
    const d = json as Record<string, unknown>;
    const u =
      d.data && typeof d.data === "object"
        ? d.data
        : d.user && typeof d.user === "object"
          ? d.user
          : null;
    if (!u) return null;
    return u as ServerSessionUser;
  } catch {
    return null;
  }
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
  const h = await headers();
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  try {
    await fetch(`${protocol}://${host}/backend/api/v1/auth/resend-verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    // Verify screen always offers Resend — never strand the user here.
  }
}