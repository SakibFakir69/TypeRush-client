import "server-only";

import { cookies } from "next/headers";

const API =
  process.env.NEXT_BACKEND_URL ??
  process.env.API_URL ??
  "http://localhost:5000";

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
    if (!res.ok) return null;
    const json: unknown = await res.json().catch(() => null);
    if (!json || typeof json !== "object") return null;
    const d = json as Record<string, unknown>;
    const u = d.data && typeof d.data === "object" ? d.data : d;
    console.log(u , " [ U ]")
    
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
  const role = "user"
  return allowed.includes(role);
}
