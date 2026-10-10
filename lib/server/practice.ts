import "server-only";

const API =
  process.env.NEXT_BACKEND_URL ??
  process.env.API_URL ??
  "http://localhost:5000";

export type BoardRow = { name: string; wpm: number };

async function getJson(path: string, revalidate: number): Promise<unknown> {
  try {
    const res = await fetch(`${API}${path}`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    return await res.json().catch(() => null);
  } catch {
    return null;
  }
}

function firstArray(json: unknown): unknown[] | null {
  if (Array.isArray(json)) return json;
  if (json && typeof json === "object") {
    const o = json as Record<string, unknown>;
    for (const key of ["data", "results", "leaderboard", "topics", "items"]) {
      if (Array.isArray(o[key])) return o[key] as unknown[];
    }
  }
  return null;
}

/** Top typists for the home dashboard. Null when unavailable. */
export async function getLeaderboardPreview(): Promise<BoardRow[] | null> {
  const rows = firstArray(await getJson("/api/v1/practices/results", 60));
  if (!rows) return null;
  const parsed = rows
    .map((r) => {
      if (!r || typeof r !== "object") return null;
      const o = r as Record<string, unknown>;
      const user = o.user && typeof o.user === "object"
        ? (o.user as Record<string, unknown>)
        : null;
      const name =
        (typeof user?.name === "string" && user.name) ||
        (typeof o.name === "string" && o.name) ||
        (typeof o.username === "string" && o.username) ||
        null;
      const wpm = Number(o.wpm ?? o.bestWpm ?? NaN);
      if (!name || !Number.isFinite(wpm)) return null;
      return { name, wpm: Math.round(wpm) };
    })
    .filter((r): r is BoardRow => r !== null)
    .slice(0, 5);
  return parsed.length > 0 ? parsed : null;
}

/** Practice topic chips for the home dashboard. Null when unavailable. */
export async function getTopicList(): Promise<string[] | null> {
  const rows = firstArray(await getJson("/api/v1/practices/topics", 300));
  if (!rows) return null;
  const topics = rows
    .map((t) => {
      if (typeof t === "string") return t;
      if (t && typeof t === "object") {
        const o = t as Record<string, unknown>;
        for (const key of ["name", "title", "topic", "label"]) {
          if (typeof o[key] === "string" && (o[key] as string).trim())
            return (o[key] as string).trim();
        }
      }
      return null;
    })
    .filter((t): t is string => t !== null)
    .slice(0, 8);
  return topics.length > 0 ? topics : null;
}
