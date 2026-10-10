

/** Raw server gibberish → human sentences users can act on. */
const FRIENDLY: Array<[RegExp, string]> = [
  [/another email/i, "That email is already registered — try logging in instead."],
  [/validation failed/i, "Please check the highlighted fields and try again."],
  [/correct password/i, "Wrong email or password. Double-check and try again."],
  [/expired|invalid.*(token|otp|code)/i, "That code expired or is wrong — request a fresh one."],
  [/too many/i, "Too many tries — wait a minute, then try again."],
  [/unauthorized|session expired/i, "Your session expired — please log in again."],
  [/cannot reach|network|fetch failed/i, "Cannot reach the server. Check your connection."],
];

export function getApiError(e: unknown): string {
  let raw = "Request failed. Try again.";
  if (e && typeof e === "object") {
    const err = e as { data?: unknown; message?: unknown };
    const d = err.data;
    if (d && typeof d === "object") {
      const m = (d as Record<string, unknown>).message;
      if (typeof m === "string" && m.trim()) raw = m;
    } else if (typeof d === "string" && d.trim()) {
      raw = d;
    } else if (typeof err.message === "string" && err.message) {
      raw = err.message;
    }
  }
  for (const [re, friendly] of FRIENDLY) {
    if (re.test(raw)) return friendly;
  }
  return raw;
}