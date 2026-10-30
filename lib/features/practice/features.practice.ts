
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
  paragraphId: string;
  wpm: number;
  accuracy: number;
  errors: number;
  timeTaken: number;
};

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
  createdAt?: string;
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

    getLeaderboard: builder.query<LeaderboardEntry[], void>({
      query: () => ({
        url: "/api/v1/practices/results",
        method: "GET",
      }),
      // Server nests twice: { data: { data: [...], nextCursor } }.
      // Rows carry userName (email) and no userId; 0-WPM rows are skipped.
      transformResponse: (res: unknown) => {
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
        return rows
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
                (typeof o.userId === "string" && o.userId) || userName || `row-${i}`,
              ...(userName ? { userName } : {}),
              wpm: Math.round(wpm),
              accuracy: Math.round(accuracy),
              rank: i + 1,
              ...(typeof o.timeTaken === "number" ? { timeTaken: o.timeTaken } : {}),
              ...(typeof o.createdAt === "string" ? { createdAt: o.createdAt } : {}),
            };
          })
          .filter((r): r is LeaderboardEntry => r !== null);
      },
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
} = practiceApi;