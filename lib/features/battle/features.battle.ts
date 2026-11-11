import { baseApi } from "../api/base-api";

/**
 * Global 1v1 matchmaking (`/api/v1/matchmaking`, `/api/v1/matches`).
 *
 * A player joins the queue, waits for `match_found` on their Ably channel, then
 * both players race the same paragraph. Results are submitted once per player;
 * the server settles ratings as soon as both are in.
 */

export type QueueState = "idle" | "waiting" | "matched";

export type QueueStatus = {
  status: QueueState;
  matchId?: string;
};

export type BattleResult = "WIN" | "LOSS" | "DRAW" | "ABANDONED";

export type BattleParticipant = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  ratingBefore: number;
  ratingAfter: number | null;
  wpm: number | null;
  accuracy: number | null;
  errors: number | null;
  result: BattleResult | null;
  finished: boolean;
};

export type BattleMatch = {
  id: string;
  status: "WAITING" | "ACTIVE" | "COMPLETED" | "ABANDONED";
  paragraph: string;
  /** Race length in seconds — invites choose it, ranked matches use the default. */
  duration: number;
  startedAt: string | null;
  endedAt: string | null;
  winnerId: string | null;
  createdAt: string;
  participants: BattleParticipant[];
};

export type MatchFoundPayload = {
  matchId: string;
  paragraph: string;
  matchChannel: string;
};

/** Private ("play a friend") invites. */
export type InviteStatus =
  | "PENDING"
  | "MATCHED"
  | "DECLINED"
  | "CANCELLED"
  | "EXPIRED";

export type CreatedInvite = {
  code: string;
  /** Seconds until the code stops working (server: 5 minutes). */
  expiresIn: number;
};

export type AcceptedInvite = {
  matchId: string;
  paragraphId: string;
};

export type InviteState = {
  status: InviteStatus;
  matchId: string | null;
  paragraphId: string;
};

/** One row of `GET /api/v1/matchmaking/history`. */
export type RankedHistoryEntry = {
  wpm: number | null;
  accuracy: number | null;
  errors: number | null;
  result: BattleResult | null;
  ratingBefore: number;
  ratingAfter: number | null;
  joinedAt: string;
  match: {
    id: string;
    status: "WAITING" | "ACTIVE" | "COMPLETED" | "ABANDONED";
    duration: number;
    startedAt: string | null;
    endedAt: string | null;
    paragraph: { content: string; difficulty: string | null };
    participants: Array<{
      userId: string;
      wpm: number | null;
      result: BattleResult | null;
      user: { name: string };
    }>;
  };
};

/** One row of `GET /api/v1/battle/invite/history`. */
export type InviteHistoryEntry = {
  code: string;
  status: InviteStatus;
  duration: number;
  matchId: string | null;
  createdAt: string;
  respondedAt: string | null;
  invitee?: { id: string; name: string } | null;
  inviter?: { id: string; name: string } | null;
  paragraph: { content: string; difficulty: string | null };
  /** The invite's match with the signed-in player's own row. */
  match?: {
    id: string;
    status: "WAITING" | "ACTIVE" | "COMPLETED" | "ABANDONED";
    winnerId: string | null;
    participants: Array<{
      userId: string;
      result: BattleResult | null;
      wpm: number | null;
      accuracy: number | null;
      ratingBefore: number;
      ratingAfter: number | null;
    }>;
  } | null;
};

export type InviteHistory = {
  sent: InviteHistoryEntry[];
  received: InviteHistoryEntry[];
};

/** The server wraps payloads as `{ success, message, data }`. */
function unwrap<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in (res as Record<string, unknown>)) {
    return (res as Record<string, unknown>).data as T;
  }
  return res as T;
}

export const battleApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    joinQueue: builder.mutation<QueueStatus, void>({
      query: () => ({ url: "/api/v1/matchmaking/join", method: "POST" }),
      transformResponse: (res: unknown) => unwrap<QueueStatus>(res),
      invalidatesTags: ["Queue"],
    }),
    cancelQueue: builder.mutation<QueueStatus, void>({
      query: () => ({ url: "/api/v1/matchmaking/cancel", method: "POST" }),
      transformResponse: (res: unknown) => unwrap<QueueStatus>(res),
      invalidatesTags: ["Queue"],
    }),
    getQueueStatus: builder.query<QueueStatus, void>({
      query: () => ({ url: "/api/v1/matchmaking/status" }),
      transformResponse: (res: unknown) => unwrap<QueueStatus>(res),
      providesTags: ["Queue"],
    }),
    getMatch: builder.query<BattleMatch, string>({
      query: (id) => ({ url: `/api/v1/matches/${id}` }),
      transformResponse: (res: unknown) => unwrap<BattleMatch>(res),
      providesTags: (_result, _error, id) => [{ type: "Match" as const, id }],
    }),
    submitMatchResult: builder.mutation<
      { match: BattleMatch; finished: boolean },
      { id: string; wpm: number; accuracy: number; errors: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/matches/${id}/result`,
        method: "POST",
        body,
      }),
      transformResponse: (res: unknown) =>
        unwrap<{ match: BattleMatch; finished: boolean }>(res),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Match" as const, id: arg.id },
        "Queue",
        "Session",
      ],
    }),
    forfeitMatch: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({ url: `/api/v1/matches/${id}/forfeit`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Match" as const, id },
        "Queue",
      ],
    }),

    /** Create a private invite and hand the code to a friend. */
    createInvite: builder.mutation<
      CreatedInvite,
      { time: number; paragraphId: string }
    >({
      query: (body) => ({
        url: "/api/v1/battle/invite",
        method: "POST",
        body,
      }),
      transformResponse: (res: unknown) => unwrap<CreatedInvite>(res),
      invalidatesTags: ["Invite"],
    }),
    /** Accept a friend's code — the server creates the match immediately. */
    acceptInvite: builder.mutation<AcceptedInvite, { code: string }>({
      query: (body) => ({
        url: "/api/v1/battle/invite/accept",
        method: "POST",
        body,
      }),
      transformResponse: (res: unknown) => unwrap<AcceptedInvite>(res),
      invalidatesTags: ["Invite", "Queue"],
    }),
    declineInvite: builder.mutation<{ ok: boolean }, { code: string }>({
      query: (body) => ({
        url: "/api/v1/battle/invite/decline",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Invite"],
    }),
    cancelInvite: builder.mutation<{ ok: boolean }, { code: string }>({
      query: (body) => ({
        url: "/api/v1/battle/invite/cancel",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Invite"],
    }),
    /**
     * Polling fallback for the `private-match:{code}` channel. Only the inviter
     * and the invitee can read it, so the inviter polls their own code.
     */
    getInviteStatus: builder.query<InviteState, string>({
      query: (code) => ({
        url: `/api/v1/battle/invite/${encodeURIComponent(code)}/status`,
      }),
      transformResponse: (res: unknown) => unwrap<InviteState>(res),
      providesTags: (_result, _error, code) => [{ type: "Invite" as const, id: code }],
    }),

    /** The signed-in player's ranked matchmaking history (newest first). */
    getMatchHistory: builder.query<
      RankedHistoryEntry[],
      { limit?: number } | void
    >({
      query: (arg) => ({
        url: "/api/v1/matchmaking/history",
        params: { limit: String(arg?.limit ?? 50) },
      }),
      transformResponse: (res: unknown) => unwrap<RankedHistoryEntry[]>(res),
      providesTags: ["Match"],
    }),

    /** Private invites the player sent and received (newest first). */
    getInviteHistory: builder.query<InviteHistory, { limit?: number } | void>({
      query: (arg) => ({
        url: "/api/v1/battle/invite/history",
        params: { limit: String(arg?.limit ?? 50) },
      }),
      transformResponse: (res: unknown) => unwrap<InviteHistory>(res),
      providesTags: ["Invite"],
    }),
  }),
});

export const {
  useJoinQueueMutation,
  useCancelQueueMutation,
  useGetQueueStatusQuery,
  useGetMatchQuery,
  useSubmitMatchResultMutation,
  useForfeitMatchMutation,
  useCreateInviteMutation,
  useAcceptInviteMutation,
  useDeclineInviteMutation,
  useCancelInviteMutation,
  useGetInviteStatusQuery,
  useGetMatchHistoryQuery,
  useGetInviteHistoryQuery,
} = battleApi;
