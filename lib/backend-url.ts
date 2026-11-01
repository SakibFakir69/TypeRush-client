/**
 * Real backend origin, resolved the same way the `/backend` rewrite in
 * `next.config.ts` resolves its destination.
 *
 * Server-side only (proxy/middleware, Server Components, route handlers).
 * Browser code must keep using the same-origin `/backend` prefix so the
 * httpOnly auth cookies stay first-party.
 */
const rawBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.API_URL ??
  "http://localhost:5000";

export const BACKEND_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

/** Absolute backend URL for a path such as `/api/v1/users`. */
export function backendUrl(path: string): string {
  return `${BACKEND_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
