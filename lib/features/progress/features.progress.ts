import { baseApi } from "../api/base-api";

/**
 * Progress API (backend `src/app/modules/progress`).
 *
 * Three read-only endpoints, all behind the session cookie:
 *   GET /api/v1/progress/overview  → lifetime totals (UserStats row)
 *   GET /api/v1/progress/charts    → one row per day (avg WPM / accuracy)
 *   GET /api/v1/progress/history   → paginated run history
 *
 * The server answers with the raw payload; older builds wrap it in the
 * usual `{ success, message, data }` envelope. `unwrap` accepts both.
 */

/** The windows the server understands. */
export type ProgressRange = "7d" | "30d" | "90d";

export const PROGRESS_RANGES: { id: ProgressRange; label: string; days: number }[] =
  [
    { id: "7d", label: "7D", days: 7 },
    { id: "30d", label: "30D", days: 30 },
    { id: "90d", label: "90D", days: 90 },
  ];

/** `GET /api/v1/progress/overview` — the user's lifetime totals. */
export type ProgressOverview = {
  userId: string;
  /** Runs stored for this user. */
  totalSessions: number;
  /** Seconds spent typing. */
  totalTimeTyped: number;
  bestWpm: number;
  bestAccuracy: number;
  avgWpm: number;
  avgAccuracy: number;
};

/** One day of the progress curve. */
export type ProgressChartPoint = {
  /** UTC day key, e.g. "2026-11-01". */
  day: string;
  /** Average WPM that day. */
  avgWpm: number;
  /** Average accuracy that day (%). */
  avgAccuracy: number;
  /** Best WPM that day (falls back to the average when not reported). */
  maxWpm: number;
  /** Runs logged that day. */
  sessions: number;
};

/** One logged run. */
export type ProgressRun = {
  id: string;
  paragraphId: string | null;
  contestId: string | null;
  wpm: number;
  accuracy: number;
  errors: number;
  /** Seconds the run took. */
  timeTaken: number;
  /** Chosen run length in seconds (15 / 30 / 60 …), null for legacy rows. */
  duration: number | null;
  createdAt: string;
};

/** One page of `GET /api/v1/progress/history`. */
export type ProgressHistoryPage = {
  items: ProgressRun[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/** Filters accepted by the history endpoint. */
export type ProgressHistoryQuery = {
  page?: number;
  limit?: number;
  /** ISO datetime (inclusive). */
  from?: string;
  /** ISO datetime (inclusive). */
  to?: string;
};

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * The server sends the payload directly; some builds wrap it in
 * `{ success, message, data }`. Unwrap when the envelope is there.
 */
function unwrap(res: unknown): unknown {
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    const root = res as Record<string, unknown>;
    if ("data" in root) return root.data;
  }
  return res;
}

/** "2026-11-01T00:00:00.000Z" / "2026-11-01" → "2026-11-01". */
function toDayKey(value: unknown): string {
  const raw = str(value);
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function toOverview(res: unknown): ProgressOverview {
  const data = unwrap(res);
  const o =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};
  return {
    userId: str(o.userId),
    totalSessions: Math.round(num(o.totalSessions)),
    totalTimeTyped: Math.round(num(o.totalTimeTyped)),
    bestWpm: Math.round(num(o.bestWpm)),
    bestAccuracy: Math.round(num(o.bestAccuracy)),
    avgWpm: Math.round(num(o.avgWpm)),
    avgAccuracy: Math.round(num(o.avgAccuracy)),
  };
}

function toChartPoints(res: unknown): ProgressChartPoint[] {
  const data = unwrap(res);
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (row): row is Record<string, unknown> =>
        Boolean(row) && typeof row === "object" && !Array.isArray(row)
    )
    .map((row) => {
      const avgWpm = Math.round(num(row.avgWpm));
      const maxWpm = Math.round(num(row.maxWpm));
      return {
        day: toDayKey(row.day),
        avgWpm,
        avgAccuracy: Math.round(num(row.avgAccuracy)),
        maxWpm: maxWpm > 0 ? maxWpm : avgWpm,
        sessions: Math.round(num(row.sessions)),
      };
    })
    .filter((point) => point.day !== "")
    .sort((a, b) => a.day.localeCompare(b.day));
}

function toRun(row: unknown): ProgressRun | null {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const o = row as Record<string, unknown>;
  const id = str(o.id);
  if (!id) return null;
  return {
    id,
    paragraphId: str(o.paragraphId) || null,
    contestId: str(o.contestId) || null,
    wpm: Math.round(num(o.wpm)),
    accuracy: Math.round(num(o.accuracy)),
    errors: Math.round(num(o.errors)),
    timeTaken: Math.round(num(o.timeTaken)),
    duration:
      o.duration === null || o.duration === undefined
        ? null
        : Math.round(num(o.duration)),
    createdAt: str(o.createdAt),
  };
}

function toHistoryPage(res: unknown): ProgressHistoryPage {
  const data = unwrap(res);
  const o =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};
  const rows = Array.isArray(o.items)
    ? o.items
    : Array.isArray(data)
      ? data
      : [];
  const items = rows
    .map(toRun)
    .filter((run): run is ProgressRun => run !== null);
  const total = Math.round(num(o.total));
  const limit = Math.round(num(o.limit)) || 20;
  const page = Math.max(1, Math.round(num(o.page)) || 1);
  const totalPages = Math.round(num(o.totalPages));
  return {
    items,
    total: total || items.length,
    page,
    limit,
    totalPages: totalPages || 1,
  };
}

export const progressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Lifetime totals: runs, time typed, best and average numbers. */
    getProgressOverview: builder.query<ProgressOverview, void>({
      query: () => ({ url: "/api/v1/progress/overview", method: "GET" }),
      transformResponse: (res: unknown) => toOverview(res),
      providesTags: ["Progress"],
    }),

    /** One row per day for the selected window. */
    getProgressCharts: builder.query<ProgressChartPoint[], ProgressRange>({
      query: (range) => ({
        url: "/api/v1/progress/charts",
        method: "GET",
        params: { range },
      }),
      transformResponse: (res: unknown) => toChartPoints(res),
      providesTags: ["Progress"],
    }),

    /** Paginated run history, newest first. */
    getProgressHistory: builder.query<ProgressHistoryPage, ProgressHistoryQuery>({
      query: (arg) => {
        const params: Record<string, string> = {
          page: String(arg?.page ?? 1),
          limit: String(arg?.limit ?? 20),
        };
        // The server only applies the window when both ends are present.
        if (arg?.from) params.from = arg.from;
        if (arg?.to) params.to = arg.to;
        return {
          url: "/api/v1/progress/history",
          method: "GET",
          params,
        };
      },
      transformResponse: (res: unknown) => toHistoryPage(res),
      providesTags: ["Progress"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProgressOverviewQuery,
  useGetProgressChartsQuery,
  useGetProgressHistoryQuery,
  useLazyGetProgressHistoryQuery,
} = progressApi;
