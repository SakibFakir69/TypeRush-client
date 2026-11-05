
/** Raw server gibberish → human sentences users can act on. */
const FRIENDLY: Array<[RegExp, string]> = [
  [/another email|already registered|already exists|unique constraint/i, "That email is already in use — try logging in instead."],
  [/validation failed|invalid request data|check the highlighted/i, "Please check the details and try again."],
  [/correct password|wrong password|invalid credentials/i, "Wrong email or password. Double-check and try again."],
  [/not verified|verify your email/i, "Verify your email first — the code is in your inbox."],
  [/expired|invalid.*(token|otp|code)|wrong code/i, "That code expired or is wrong — request a fresh one."],
  [/too many|rate limit/i, "Too many tries — wait a minute, then try again."],
  [/unauthorized|not authenticated|session expired/i, "Your session expired — please log in again."],
  [/delet|disabled|suspended|deactivated|no longer/i, "This account no longer exists."],
  [/cannot reach|network|fetch failed|load failed|timed out/i, "Cannot reach the server. Check your connection."],
  [/route not found|not found|does not exist/i, "We couldn't find that — it may have been removed."],
  [/missing permissions|api key needs upload|unexpected status code - 403/i, "The image host refused the upload — its Cloudinary API key needs upload permission."],
  [/no (file|image) uploaded|file is required/i, "Choose an image first, then upload."],
  [/invalid file type|allowed_formats|unsupported (file|image)/i, "Use a JPG, PNG or WebP image."],
  [/too large|file size|payload too large|request entity/i, "That image is too large — pick one under 10 MB."],
  [/unexpected status code|internal server error|something went wrong/i, "Something went wrong on our side. Please try again in a moment."],
];

/**
 * Turns any thrown value (RTK error, fetch failure, plain Error) into one short
 * sentence a typist can act on — never a status code, stack or API name.
 */
export function getApiError(e: unknown): string {
  let raw = "";
  let status: number | string | undefined;

  if (typeof e === "string") {
    raw = e;
  } else if (e && typeof e === "object") {
    const err = e as { status?: unknown; data?: unknown; message?: unknown };
    if (typeof err.status === "number" || typeof err.status === "string") {
      status = err.status as number | string;
    }

    const d = err.data;
    if (typeof d === "string") {
      raw = d;
    } else if (d && typeof d === "object") {
      const m = (d as Record<string, unknown>).message;
      if (typeof m === "string") raw = m;
    }
    if (!raw && typeof err.message === "string") raw = err.message;
  }

  const text = raw.trim();
  for (const [re, friendly] of FRIENDLY) {
    if (re.test(text)) return friendly;
  }

  // No message from the server — fall back to the status class.
  if (status === "FETCH_ERROR") {
    return "Cannot reach the server. Check your connection.";
  }
  if (typeof status === "number") {
    if (status === 401) return "Your session expired — please log in again.";
    if (status === 403) return "You don't have permission to do that.";
    if (status === 404) return "We couldn't find that — it may have been removed.";
    if (status === 413) return "That image is too large — pick one under 10 MB.";
    if (status === 429) return "Too many tries — wait a minute, then try again.";
    if (status >= 500) {
      return "Something went wrong on our side. Please try again in a moment.";
    }
  }

  if (text && text.length <= 120 && !/^[A-Z_]+$/.test(text)) return text;
  return "Something went wrong. Please try again.";
}
