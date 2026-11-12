import { baseApi } from "../api/base-api";

/**
 * Achievement API (backend `src/app/modules/achievements`).
 *
 * The catalogue holds every published badge; the signed-in user's own
 * unlocks ride along on the same rows (`unlockedAt` is null until the badge
 * is earned).
 */

export type AchievementCategory =
  | "speed"
  | "accuracy"
  | "volume"
  | "streak"
  | "contest"
  | "social";

/** One badge as the server stores it. */
export type Achievement = {
  id: string;
  key: string;
  name: string;
  description: string;
  category: AchievementCategory | string;
  /** 1 = bronze, 2 = silver, 3 = gold. */
  tier: number;
  /** The number to reach in the category, e.g. WPM 40 / 70 / 100. */
  threshold: number;
  iconUrl?: string | null;
};

/** A badge plus this user's unlock state. */
export type AchievementWithState = Achievement & {
  /** When the user unlocked it — null while it is still locked. */
  unlockedAt: string | null;
};

/** One row of `GET /achievements/me` (the user's unlocked badges only). */
export type UserAchievement = {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievement: Achievement;
};

/** The server wraps every payload as { success, message, data }. */
function unwrap(res: unknown): unknown {
  if (res && typeof res === "object" && "data" in (res as Record<string, unknown>)) {
    return (res as Record<string, unknown>).data;
  }
  return res;
}

function toAchievement(row: unknown): AchievementWithState | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  if (!id) return null;
  return {
    id,
    key: typeof o.key === "string" ? o.key : "",
    name: typeof o.name === "string" ? o.name : "Achievement",
    description: typeof o.description === "string" ? o.description : "",
    category: typeof o.category === "string" ? o.category : "speed",
    tier: Number(o.tier) || 1,
    threshold: Number(o.threshold) || 0,
    iconUrl: typeof o.iconUrl === "string" ? o.iconUrl : null,
    unlockedAt:
      typeof o.unlockedAt === "string" && o.unlockedAt ? o.unlockedAt : null,
  };
}

export const achievementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Every badge with the signed-in user's unlock state. */
    getAchievements: builder.query<AchievementWithState[], void>({
      query: () => ({ url: "/api/v1/achievements", method: "GET" }),
      transformResponse: (res: unknown) => {
        const data = unwrap(res);
        if (!Array.isArray(data)) return [];
        return data
          .map(toAchievement)
          .filter((a): a is AchievementWithState => a !== null);
      },
      providesTags: ["Achievement"],
    }),

    /** The badges this user has unlocked, newest first. */
    getMyAchievements: builder.query<UserAchievement[], void>({
      query: () => ({ url: "/api/v1/achievements/me", method: "GET" }),
      transformResponse: (res: unknown) => {
        const data = unwrap(res);
        if (!Array.isArray(data)) return [];
        return data
          .filter(
            (row): row is Record<string, unknown> =>
              Boolean(row) && typeof row === "object"
          )
          .map((row) => ({
            id: String(row.id ?? ""),
            userId: String(row.userId ?? ""),
            achievementId: String(row.achievementId ?? ""),
            unlockedAt:
              typeof row.unlockedAt === "string" ? row.unlockedAt : "",
            achievement: toAchievement(row.achievement) ?? {
              id: String(row.achievementId ?? ""),
              key: "",
              name: "Achievement",
              description: "",
              category: "speed",
              tier: 1,
              threshold: 0,
              iconUrl: null,
              unlockedAt: null,
            },
          }))
          .filter((row) => row.achievementId !== "");
      },
      providesTags: ["Achievement"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAchievementsQuery, useGetMyAchievementsQuery } =
  achievementsApi;
