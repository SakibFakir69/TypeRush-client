import { baseApi } from "../api/base-api";

/**
 * Contest API (backend `src/app/modules/contest`).
 *
 * Listing and single-contest reads are public on the server; joining and
 * leaving need a session, which is why the buttons ask you to log in.
 */

export type ContestCondition = "UPCOMING" | "RUNNING" | "FINISHED";

export type ContestUser = {
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
};

export type ContestParticipant = {
  userId: string;
  contestId: string;
  joinedAt?: string;
  user?: ContestUser | null;
};

export type Contest = {
  id: string;
  name: string;
  content: string;
  /** Duration in minutes, as stored by the admin API. */
  time: number;
  contestDate: string;
  condition: string;
  createdAt?: string;
  userId?: string | null;
  user?: ContestUser | null;
  participants?: ContestParticipant[];
};

/** The server wraps every payload as { success, message, data }. */
function unwrap(res: unknown): unknown {
  if (res && typeof res === "object" && "data" in (res as Record<string, unknown>)) {
    return (res as Record<string, unknown>).data;
  }
  return res;
}

export function contestStatus(condition: string | undefined): ContestCondition {
  const value = (condition ?? "").toUpperCase();
  return value === "RUNNING" || value === "FINISHED" ? value : "UPCOMING";
}

const STATUS_LABEL: Record<ContestCondition, string> = {
  UPCOMING: "Upcoming",
  RUNNING: "Live now",
  FINISHED: "Finished",
};

const STATUS_STYLE: Record<ContestCondition, string> = {
  UPCOMING: "border-sky-500/40 bg-sky-500/10 text-sky-500",
  RUNNING: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  FINISHED: "border-line bg-inset text-muted",
};

export function statusLabel(condition: string | undefined): string {
  return STATUS_LABEL[contestStatus(condition)];
}

export function statusStyle(condition: string | undefined): string {
  return STATUS_STYLE[contestStatus(condition)];
}

/** "12 Nov 2026, 18:00" — locale-aware, never throws on bad input. */
export function formatContestDate(value: string | undefined): string {
  if (!value) return "Date to be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date to be announced";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function contestExcerpt(content: string, max = 120): string {
  const clean = content.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

export const contestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContests: builder.query<Contest[], void>({
      query: () => ({ url: "/api/v1/contests", method: "GET" }),
      transformResponse: (res: unknown) => {
        const data = unwrap(res);
        return Array.isArray(data) ? (data as Contest[]) : [];
      },
      providesTags: ["Contest"],
    }),

    getContestById: builder.query<Contest | null, string>({
      query: (id) => ({ url: `/api/v1/contests/${id}`, method: "GET" }),
      transformResponse: (res: unknown) => {
        const data = unwrap(res);
        return data && typeof data === "object" ? (data as Contest) : null;
      },
      providesTags: (result, error, id) => [{ type: "Contest", id }],
    }),

    /** Contests the signed-in user created (backend `/contests/my`). */
    getMyContests: builder.query<Contest[], void>({
      query: () => ({ url: "/api/v1/contests/my", method: "GET" }),
      transformResponse: (res: unknown) => {
        const data = unwrap(res);
        return Array.isArray(data) ? (data as Contest[]) : [];
      },
      providesTags: ["Contest"],
    }),

    joinContest: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/api/v1/contests/${id}/join`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Contest", id }, "Contest"],
    }),

    leaveContest: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/api/v1/contests/${id}/leave`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Contest", id }, "Contest"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetContestsQuery,
  useGetContestByIdQuery,
  useGetMyContestsQuery,
  useJoinContestMutation,
  useLeaveContestMutation,
} = contestApi;
