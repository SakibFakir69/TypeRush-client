/**
 * Typed fetch wrapper for the Express API (via the /backend rewrite,
 * so cookies stay first-party). Tolerant to the server's response
 * envelope: message is read from common fields, payload from `data`.
 */

export type ApiResult<T = unknown> = {
  ok: boolean;
  status: number;
  message: string;
  data: T | null;
};

type ApiBody = Record<string, unknown>;

function pickMessage(json: unknown, fallback: string): string {
  if (json && typeof json === "object") {
    const o = json as Record<string, unknown>;
    for (const key of ["message", "msg", "error"]) {
      const v = o[key];
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  return fallback;
}

function pickData<T>(json: unknown): T | null {
  if (json && typeof json === "object" && "data" in json) {
    return (json as { data: T }).data ?? null;
  }
  return (json as T) ?? null;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: { method?: string; body?: ApiBody } = {}
): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`/backend${path}`, {
      method: init.method ?? "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Cannot reach the server. Is it running?",
      data: null,
    };
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  return {
    ok: res.ok,
    status: res.status,
    message: pickMessage(json, res.ok ? "Done" : `Request failed (${res.status})`),
    data: pickData<T>(json),
  };
}
