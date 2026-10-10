

export function getApiError(e: unknown): string {
  if (e && typeof e === "object") {
    const err = e as { data?: unknown; message?: unknown };
    const d = err.data;
    if (d && typeof d === "object") {
      const m = (d as Record<string, unknown>).message;
      if (typeof m === "string" && m.trim()) return m;
    }
    if (typeof d === "string" && d.trim()) return d;
    if (typeof err.message === "string" && err.message) return err.message;
  }
  return "Request failed. Try again.";
}