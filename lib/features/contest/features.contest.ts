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
  /** Duration in seconds, as stored by the admin API (60 = 1 minute). */
  time: number;
  contestDate: string;
  condition: string;
  createdAt?: string;
  userId?: string | null;
  user?: ContestUser | null;
  participants?: ContestParticipant[];
};

/** One row of `GET /contests/:id/leaderboard` (best result per user). */
export type ContestLeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  wpm: number;
  accuracy: number;
  errors: number;
  timeTaken: number;
  createdAt?: string;
};

/** One contest plus the board that belongs to it (`GET /contests/leaderboards`). */
export type ContestLeaderboardGroup = {
  contest: Contest;
  leaderboard: ContestLeaderboardRow[];
};

/** Body accepted by `POST /contests/:id/submit`. */
export type SubmitContestResultRequest = {
  id: string;
  wpm: number;
  accuracy: number;
  errors: number;
  timeTaken: number;
};

/** The server wraps every payload as { success, message, data }. */
function unwrap(res: unknown): unknown {
  if (res && typeof res === "object" && "data" in (res as Record<string, unknown>)) {
    return (res as Record<string, unknown>).data;
  }
  return res;
}

/** Anything that can tell us when a contest starts and how long it runs. */
export type ContestLike = {
  condition?: string;
  contestDate?: string;
  time?: number;
};

/** A contest with no usable duration is treated as a one-hour window. */
const DEFAULT_WINDOW_SECONDS = 60 * 60;

function startOf(contest: ContestLike | null | undefined): number | null {
  const raw = contest?.contestDate;
  if (!raw) return null;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function endOf(contest: ContestLike | null | undefined): number | null {
  const start = startOf(contest);
  if (start === null) return null;
  const seconds = Math.max(0, Math.round(Number(contest?.time) || 0));
  return start + (seconds > 0 ? seconds : DEFAULT_WINDOW_SECONDS) * 1000;
}

/**
 * Phase of a contest.
 *
 * The server's `condition` column is only changed by admin actions, so a race
 * whose scheduled time has passed would keep reading "UPCOMING" forever. When
 * a start time is available we derive the phase from the clock instead; the
 * stored condition is only a fallback (an explicit FINISHED always wins).
 *
 * Pass `now` as `undefined` to get the server-condition-only answer.
 */
export function contestStatus(
  contest: ContestLike | null | undefined,
  now?: number
): ContestCondition {
  const stored = (contest?.condition ?? "").toUpperCase();
  const fallback: ContestCondition =
    stored === "RUNNING" || stored === "FINISHED" ? stored : "UPCOMING";

  // An admin marking a contest finished is final; without a clock we have to
  // trust whatever the server stored.
  if (fallback === "FINISHED" || now === undefined) return fallback;

  const start = startOf(contest);
  const end = endOf(contest);
  if (start === null || end === null) return fallback;

  if (now >= end) return "FINISHED";
  if (now >= start) return "RUNNING";
  return "UPCOMING";
}

export type ContestTiming = {
  phase: ContestCondition;
  /** Epoch ms, or null when the contest has no scheduled date. */
  startsAt: number | null;
  endsAt: number | null;
  /** Milliseconds until the start line; 0 once it has passed. */
  startsInMs: number;
  /** Milliseconds until the window closes; 0 once it has passed. */
  endsInMs: number;
};

export function contestTiming(
  contest: ContestLike | null | undefined,
  now: number = Date.now()
): ContestTiming {
  const startsAt = startOf(contest);
  const endsAt = endOf(contest);
  return {
    phase: contestStatus(contest, now),
    startsAt,
    endsAt,
    startsInMs: startsAt === null ? 0 : Math.max(0, startsAt - now),
    endsInMs: endsAt === null ? 0 : Math.max(0, endsAt - now),
  };
}

/**
 * "2d 4h", "5h 12m", "12m 08s", "42s" — short enough for a chip.
 * Counts stay coarse until the last hour so the text doesn't jitter much.
 */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  if (total <= 0) return "now";

  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3_600);
  const minutes = Math.floor((total % 3_600) / 60);
  const seconds = total % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
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

export function statusLabel(
  contest: ContestLike | null | undefined,
  now?: number
): string {
  return STATUS_LABEL[contestStatus(contest, now)];
}

export function statusStyle(
  contest: ContestLike | null | undefined,
  now?: number
): string {
  return STATUS_STYLE[contestStatus(contest, now)];
}

/** The backend stores `time` in **seconds** (60 = one minute). */
export function formatContestTime(seconds: number | undefined): string {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  return `${total} s`;
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

/** Coerce the server's leaderboard rows into the shape the UI renders. */
function mapLeaderboardRows(res: unknown): ContestLeaderboardRow[] {
  const data = unwrap(res);
  if (!Array.isArray(data)) return [];
  return data
    .filter((row): row is Record<string, unknown> =>
      Boolean(row) && typeof row === "object"
    )
    .map((row, i) => {
      const name =
        typeof row.name === "string" && row.name.trim() ? row.name : "Typist";
      return {
        rank: Number(row.rank) || i + 1,
        userId: String(row.userId ?? ""),
        name,
        avatarUrl: typeof row.avatarUrl === "string" ? row.avatarUrl : null,
        wpm: Math.round(Number(row.wpm) || 0),
        accuracy: Math.round(Number(row.accuracy) || 0),
        errors: Math.round(Number(row.errors) || 0),
        timeTaken: Math.round(Number(row.timeTaken) || 0),
        ...(typeof row.createdAt === "string"
          ? { createdAt: row.createdAt }
          : {}),
      };
    })
    .sort((a, b) => a.rank - b.rank);
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

    /** Best run per participant, already ranked by the server. */
    getContestLeaderboard: builder.query<ContestLeaderboardRow[], string>({
      query: (id) => ({
        url: `/api/v1/contests/${id}/leaderboard`,
        method: "GET",
      }),
      transformResponse: (res: unknown) => mapLeaderboardRows(res),
      providesTags: (result, error, id) => [{ type: "Contest", id }],
    }),

    /**
     * Every contest with its own board — one contest can never leak into
     * another's ranking.
     */
    getAllContestLeaderboards: builder.query<ContestLeaderboardGroup[], void>({
      query: () => ({ url: "/api/v1/contests/leaderboards", method: "GET" }),
      transformResponse: (res: unknown) => {
        const data = unwrap(res);
        if (!Array.isArray(data)) return [];
        return data
          .map((group): ContestLeaderboardGroup | null => {
            if (!group || typeof group !== "object") return null;
            const g = group as Record<string, unknown>;
            const contest = g.contest;
            if (!contest || typeof contest !== "object") return null;
            const c = contest as Record<string, unknown>;
            if (typeof c.id !== "string" || !c.id) return null;
            return {
              contest: {
                id: c.id,
                name:
                  typeof c.name === "string" && c.name.trim()
                    ? c.name
                    : "Contest",
                content: typeof c.content === "string" ? c.content : "",
                time: Number(c.time) || 0,
                contestDate:
                  typeof c.contestDate === "string" ? c.contestDate : "",
                condition: typeof c.condition === "string" ? c.condition : "",
              },
              leaderboard: mapLeaderboardRows(g.leaderboard),
            };
          })
          .filter((g): g is ContestLeaderboardGroup => g !== null);
      },
      providesTags: ["Contest"],
    }),

    /** Post a run to a RUNNING contest you have joined. */
    submitContestResult: builder.mutation<unknown, SubmitContestResultRequest>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/contests/${id}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Contest", id }],
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
  useGetContestLeaderboardQuery,
  useGetAllContestLeaderboardsQuery,
  useSubmitContestResultMutation,
} = contestApi;
