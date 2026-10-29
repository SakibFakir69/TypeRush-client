import "server-only";

import { cookies } from "next/headers";

const API  = process.env.NEXT_PUBLIC_BACKEND_URL;

export type ServerSessionUser = {
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
} & Record<string, unknown>;

/** Read the logged-in user on the server via the httpOnly cookie. */
export async function getSessionUser(): Promise<ServerSessionUser | null> {
  const jar = await cookies();
  const token = jar.get("accessToken")?.value;
  if (!token) return null;
  try {
    const res = await fetch(`${API}/api/v1/users`, {
      headers: { Cookie: `accessToken=${token}` },
      cache: "no-store",
    });
    console.log(res, 'user data')
    if (!res.ok) return null;
    const json: unknown = await res.json().catch(() => null);
    if (!json || typeof json !== "object") return null;
    const d = json as Record<string, unknown>;
    // Envelope is { success, message, data: <user> } — never the row itself.
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

/**
 * Role gate. The server User model has NO role column yet, so every
 * authenticated account counts as role "user". The day the backend
 * adds roles, this check enforces for real with zero caller changes.
 */
export function hasRole(
  user: ServerSessionUser | null,
  allowed: string[]
): user is ServerSessionUser {
  if (!user) return false;
  const role = typeof user.role === "string" ? user.role : "USER";
  return allowed.includes(role);
}

/**
 * Verified-only gate for main pages. Local accounts must have
 * emailVerified === true. Google accounts are exempt — Google
 * already verified that address at the identity provider, and those
 * users have no password to log back in with.
 */
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
    await fetch(`${API}/api/v1/auth/resend-verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    // Verify screen always offers Resend — never strand the user here.
  }
}
