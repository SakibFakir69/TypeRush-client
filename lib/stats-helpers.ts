import type {
  PracticeStats,
  PracticeStatsPoint,
  PracticeStatsRecentRun,
} from "@/lib/features/practice/features.practice";

/**
 * XP → level. Mirrors `getLevelFromXp` in the server helper
 * (`src/helpers/levelup-helper.ts`): level 1 costs 100 XP, level 2 costs 200,
 * level 3 costs 300, and so on.
 */
export function levelFromXp(xp: number): {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
} {
  const total = Math.max(0, Math.round(Number(xp) || 0));
  let level = 1;
  let required = 100;
  let remaining = total;
  while (remaining >= required && level < 999) {
    remaining -= required;
    level += 1;
    required = level * 100;
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: required };
}

/**
 * Consecutive days with at least one test, ending today or yesterday
 * (so the streak survives until you train again today).
 */
export function streakFrom(history: PracticeStatsPoint[], today: string): number {
  const days = new Set(history.map((p) => p.date));
  if (days.size === 0) return 0;
  const cursor = new Date(`${today}T00:00:00.000Z`);
  if (Number.isNaN(cursor.getTime())) return 0;
  const key = (d: Date) => d.toISOString().slice(0, 10);

  if (!days.has(key(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (days.has(key(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/** "Nov 4, 05:15" — stable, locale-aware, never throws on bad input. */
export function formatRunWhen(value: string | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const PRESET_LENGTHS = [15, 30, 60] as const;

/**
 * Leaderboard rows only carry `userName` today (often the display name, not
 * the email) and no real user id. Match every identity the session exposes so
 * the same person is highlighted — and gets their own avatar — on every run.
 */
export function isLeaderboardRowMine(
  row: { userId?: string; userName?: string },
  user:
    | { id?: string; name?: string; fullName?: string; email?: string }
    | null
    | undefined
): boolean {
  if (!user) return false;
  const id = typeof user.id === "string" ? user.id.trim() : "";
  if (id && row.userId === id) return true;

  const rowName =
    typeof row.userName === "string" ? row.userName.trim().toLowerCase() : "";
  if (!rowName) return false;

  return [user.email, user.name, user.fullName].some((value) => {
    if (typeof value !== "string" || !value.trim()) return false;
    return value.trim().toLowerCase() === rowName;
  });
}

/** "60s" for a preset run, "12s" for a custom/legacy one. */
export function runLengthLabel(seconds: number | null | undefined): string {
  const value = Math.round(Number(seconds) || 0);
  if (value <= 0) return "run";
  return `${value}s`;
}

/** The length a run belongs to, falling back to its elapsed time. */
export function runLengthOf(run: PracticeStatsRecentRun): number {
  const duration = Number(run.duration);
  if (Number.isFinite(duration) && duration > 0) return duration;
  return Math.max(0, Math.round(Number(run.timeTaken) || 0));
}

export type Milestone = {
  id: string;
  Icon: "zap" | "target" | "layers" | "flame" | "trophy";
  name: string;
  /** Progress towards the goal, e.g. "58 / 60 WPM". */
  detail: string;
  earned: boolean;
};

/**
 * Real milestones derived from the user's own numbers — there is no badge
 * table on the server yet, so a badge is simply a goal that has been met.
 */
export function milestonesFrom(
  stats: PracticeStats | null,
  streak: number
): Milestone[] {
  const best = Math.max(0, Math.round(stats?.bestWpm ?? 0));
  const accuracy = Math.max(
    Math.round(stats?.currentAccuracy ?? 0),
    ...(stats?.history ?? []).map((p) => p.accuracy),
    0
  );
  const tests = Math.max(0, Math.round(stats?.totalTests ?? 0));

  return [
    {
      id: "speed",
      Icon: "zap",
      name: "Speed Demon",
      detail: `${best} / 60 WPM`,
      earned: best >= 60,
    },
    {
      id: "accuracy",
      Icon: "target",
      name: "Accuracy Master",
      detail: `${accuracy} / 95%`,
      earned: accuracy >= 95,
    },
    {
      id: "volume",
      Icon: "layers",
      name: "Ten Down",
      detail: `${tests} / 10 tests`,
      earned: tests >= 10,
    },
    {
      id: "streak",
      Icon: "flame",
      name: "Consistent Typist",
      detail: `${streak} / 3 days`,
      earned: streak >= 3,
    },
  ];
}
