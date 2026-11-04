
import { baseApi } from "../api/base-api";


export type Topic = {
  id: string;
  name: string;
  description?: string;
};

export type Paragraph = {
  id: string;
  topicId: string;
  title: string;
  content: string;
  wordCount: number;
};

export type SubmitResultRequest = {
  /** Omitted for arena runs (words / quotes / custom text). */
  paragraphId?: string;
  wpm: number;
  accuracy: number;
  errors: number;
  timeTaken: number;
  /** Run length in seconds — the leaderboard category. */
  duration?: number;
};

/** One day of the signed-in user's practice curve. */
export type PracticeStatsPoint = {
  /** UTC day key, e.g. "2026-11-01". */
  date: string;
  wpm: number;
  accuracy: number;
  tests: number;
};

/** One logged run, newest first — powers the dashboard activity feed. */
export type PracticeStatsRecentRun = {
  id: string;
  wpm: number;
  accuracy: number;
  timeTaken: number;
  /** Chosen run length (15 / 30 / 60 …); null for legacy rows. */
  duration: number | null;
  /** Set when the run was posted to a contest. */
  contestId: string | null;
  createdAt: string;
};

/** `GET /api/v1/practices/stats/me` — computed from the user's own results. */
export type PracticeStats = {
  currentWpm: number;
  wpmChangePercent: number;
  bestWpm: number;
  currentAccuracy: number;
  accuracyChangePercent: number;
  /** How many earlier tests the deltas are compared against. */
  sampleSize: number;
  totalTests: number;
  /** Contests joined by the user. */
  contestsJoined: number;
  /** Runs posted to a contest. */
  contestRuns: number;
  /** Newest runs, newest first. */
  recent: PracticeStatsRecentRun[];
  history: PracticeStatsPoint[];
};

/** `{ success, message, data }` → `data`; anything else passes through. */
function unwrapData(res: unknown): unknown {
  if (res && typeof res === "object" && "data" in (res as Record<string, unknown>)) {
    return (res as Record<string, unknown>).data;
  }
  return res;
}

/** Coerce a stats payload; returns null when there is nothing usable. */
function toPracticeStats(res: unknown): PracticeStats | null {
  const data = unwrapData(res);
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const o = data as Record<string, unknown>;
  const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const history = Array.isArray(o.history)
    ? o.history
        .filter(
          (row): row is Record<string, unknown> =>
            Boolean(row) && typeof row === "object"
        )
        .map((row) => ({
          date: typeof row.date === "string" ? row.date : "",
          wpm: Math.round(num(row.wpm)),
          accuracy: Math.round(num(row.accuracy)),
          tests: Math.round(num(row.tests)),
        }))
        .filter((row) => row.date !== "")
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  const recent = Array.isArray(o.recent)
    ? o.recent
        .filter(
          (row): row is Record<string, unknown> =>
            Boolean(row) && typeof row === "object"
        )
        .map((row) => ({
          id: typeof row.id === "string" ? row.id : "",
          wpm: Math.round(num(row.wpm)),
          accuracy: Math.round(num(row.accuracy)),
          timeTaken: Math.round(num(row.timeTaken)),
          duration:
            row.duration === null || row.duration === undefined
              ? null
              : Math.round(num(row.duration)),
          contestId:
            typeof row.contestId === "string" && row.contestId
              ? row.contestId
              : null,
          createdAt: typeof row.createdAt === "string" ? row.createdAt : "",
        }))
        .filter((row) => row.id !== "")
    : [];

  return {
    currentWpm: Math.round(num(o.currentWpm)),
    wpmChangePercent: Math.round(num(o.wpmChangePercent)),
    bestWpm: Math.round(num(o.bestWpm)),
    currentAccuracy: Math.round(num(o.currentAccuracy)),
    accuracyChangePercent: Math.round(num(o.accuracyChangePercent)),
    sampleSize: Math.round(num(o.sampleSize)),
    totalTests: Math.round(num(o.totalTests)),
    contestsJoined: Math.round(num(o.contestsJoined)),
    contestRuns: Math.round(num(o.contestRuns)),
    recent,
    history,
  };
}

export type Result = {
  id: string;
  userId: string;
  paragraphId: string;
  wpm: number;
  accuracy: number;
  errors?: number;
  timeTaken?: number;
  createdAt?: string;
};

export type LeaderboardEntry = {
  userId: string;
  userName?: string;
  wpm: number;
  accuracy: number;
  rank: number;
  timeTaken?: number;
  /** Time category of the run (seconds), e.g. 60. */
  duration?: number;
  createdAt?: string;
};

/** One page of the leaderboard plus the server's paging metadata. */
export type LeaderboardPage = {
  rows: LeaderboardEntry[];
  total: number;
  hasMore: boolean;
  nextOffset: number | null;
};

export type LeaderboardQuery = {
  /** Time category: only runs of this length (seconds). Omit for all. */
  duration?: number;
  offset?: number;
  limit?: number;
};

export type CreateParagraphRequest = {
  topicId: string;
  title: string;
  content: string;
};

export type ParagraphItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: string;
  wordCount: number;
};

function toParagraphItem(row: unknown): ParagraphItem | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  if (typeof o.content !== "string" || !o.content.trim()) return null;
  const content = o.content.trim();
  const rawDiff =
    (typeof o.difficulty === "string" && o.difficulty.trim()) || "Medium";
  return {
    id: String(o.id ?? ""),
    title:
      (typeof o.title === "string" && o.title.trim()) ||
      content.slice(0, 42) + (content.length > 42 ? "…" : ""),
    content,
    category:
      (typeof o.category === "string" && o.category.trim()) || "General",
    difficulty: rawDiff.charAt(0).toUpperCase() + rawDiff.slice(1).toLowerCase(),
    wordCount:
      typeof o.wordCount === "number"
        ? o.wordCount
        : content.split(/\s+/).length,
  };
}

export const practiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    getTopics: builder.query<Topic[], void>({
      query: () => ({
        url: "/api/v1/practices/topics",
        method: "GET",
      }),
      providesTags: ["Paragraph"],
    }),

    getParagraph: builder.query<Paragraph, string>({
      query: (id) => ({
        url: `/api/v1/practices/${id}`,
        method: "GET",
      }),
      // Server wraps the row: { success, message, data: {...} }
      transformResponse: (res: unknown) => {
        if (res && typeof res === "object" && "data" in res) {
          return (res as { data: Paragraph }).data;
        }
        return res as Paragraph;
      },
      providesTags: (result, error, id) => [{ type: "Paragraph", id }],
    }),

   

    submitPracticeResult: builder.mutation<Result, SubmitResultRequest>({
      query: (body) => ({
        url: "/api/v1/practices/results",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Result"],
    }),

    getLeaderboard: builder.query<LeaderboardPage, LeaderboardQuery | void>({
      query: (arg) => {
        const params = new URLSearchParams();
        params.set("limit", String(arg?.limit ?? 50));
        if (arg?.offset) params.set("offset", String(arg.offset));
        if (arg?.duration) params.set("duration", String(arg.duration));
        return {
          url: `/api/v1/practices/results?${params.toString()}`,
          method: "GET",
        };
      },
      // Server nests twice: { data: { data: [...], nextCursor, pagination } }.
      // Rows carry userName (email) and no userId; 0-WPM rows are skipped.
      transformResponse: (res: unknown, _meta, arg) => {
        const root =
          res && typeof res === "object" ? (res as Record<string, unknown>) : {};
        const inner = root.data;
        const rows = Array.isArray(inner)
          ? inner
          : inner && typeof inner === "object" && Array.isArray((inner as Record<string, unknown>).data)
            ? ((inner as Record<string, unknown>).data as unknown[])
            : Array.isArray(root.results)
              ? (root.results as unknown[])
              : Array.isArray(res)
                ? (res as unknown[])
                : [];
        const paging =
          inner && typeof inner === "object"
            ? ((inner as Record<string, unknown>).pagination as
                | { total?: unknown; hasMore?: unknown; nextOffset?: unknown }
                | undefined)
            : undefined;
        const start = Number(arg?.offset) || 0;
        const mapped = rows
          .map((r, i): LeaderboardEntry | null => {
            if (!r || typeof r !== "object") return null;
            const o = r as Record<string, unknown>;
            const wpm = Number(o.wpm);
            const accuracy = Number(o.accuracy);
            if (!Number.isFinite(wpm) || wpm <= 0 || !Number.isFinite(accuracy))
              return null;
            const userName =
              typeof o.userName === "string" && o.userName ? o.userName : undefined;
            return {
              userId:
                (typeof o.userId === "string" && o.userId) || userName || `row-${start + i}`,
              ...(userName ? { userName } : {}),
              wpm: Math.round(wpm),
              accuracy: Math.round(accuracy),
              rank: start + i + 1,
              ...(typeof o.timeTaken === "number" ? { timeTaken: o.timeTaken } : {}),
              ...(typeof o.duration === "number" ? { duration: o.duration } : {}),
              ...(typeof o.createdAt === "string" ? { createdAt: o.createdAt } : {}),
            };
          })
          .filter((r): r is LeaderboardEntry => r !== null);

        return {
          rows: mapped,
          total: typeof paging?.total === "number" ? paging.total : mapped.length,
          hasMore: paging?.hasMore === true,
          nextOffset:
            typeof paging?.nextOffset === "number" ? paging.nextOffset : null,
        };
      },
      providesTags: ["Result"],
    }),

    /** The signed-in user's own stats + 90-day progress curve. */
    getMyStats: builder.query<PracticeStats | null, void>({
      query: () => ({ url: "/api/v1/practices/stats/me", method: "GET" }),
      transformResponse: (res: unknown) => toPracticeStats(res),
      providesTags: ["Result"],
    }),

    /** Admin-uploaded practice bank (paginated paragraph rows). */
    getParagraphs: builder.query<
      { items: ParagraphItem[]; total: number },
      { search?: string; limit?: number } | void
    >({
      query: (arg) => {
        const params: Record<string, string> = {
          limit: String(arg?.limit ?? 50),
        };
        if (arg?.search?.trim()) params.search = arg.search.trim();
        return {
          url: "/api/v1/practices/topics",
          method: "GET",
          params,
        };
      },
      transformResponse: (res: unknown) => {
        const root =
          res && typeof res === "object" ? (res as Record<string, unknown>) : {};
        const rows = Array.isArray(root.data)
          ? root.data
          : Array.isArray(res)
            ? (res as unknown[])
            : [];
        const items = rows
          .map(toParagraphItem)
          .filter((p): p is ParagraphItem => p !== null && p.id !== "");
        const pagination =
          root.pagination && typeof root.pagination === "object"
            ? (root.pagination as Record<string, unknown>)
            : null;
        const total =
          typeof pagination?.total === "number" ? pagination.total : items.length;
        return { items, total };
      },
      providesTags: ["Paragraph"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTopicsQuery,
  useGetParagraphQuery,
  useGetParagraphsQuery,

  useSubmitPracticeResultMutation,
  useGetLeaderboardQuery,
  useLazyGetLeaderboardQuery,
  useGetMyStatsQuery,
} = practiceApi;