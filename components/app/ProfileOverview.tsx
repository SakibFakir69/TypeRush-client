"use client";

import Link from "next/link";
import {
  Award,
  Flame,
  Layers,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import {
  useGetLeaderboardQuery,
  useGetMyStatsQuery,
  type LeaderboardEntry,
} from "@/lib/features/practice/features.practice";
import {
  isLeaderboardRowMine,
  levelFromXp,
  milestonesFrom,
  streakFrom,
  type Milestone,
} from "@/lib/stats-helpers";
import { cn } from "@/lib/cn";

const MILESTONE_ICONS: Record<Milestone["Icon"], LucideIcon> = {
  zap: Zap,
  target: Target,
  layers: Layers,
  flame: Flame,
  trophy: Trophy,
};

/** "sakib.fakir@gmail.com" → "Sakib Fakir"; names pass through. */
function displayName(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.includes("@")) return raw;
  const local = raw.split("@")[0].replace(/[._-]+/g, " ").trim();
  if (!local) return fallback;
  return local
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** One row per typist: their best run. Mirrors the dashboard mini board. */
function bestRows(rows: LeaderboardEntry[]): LeaderboardEntry[] {
  const best = new Map<string, LeaderboardEntry>();
  for (const row of rows) {
    const key = (row.userId || row.userName || "anon").toLowerCase();
    const prev = best.get(key);
    if (
      !prev ||
      row.wpm > prev.wpm ||
      (row.wpm === prev.wpm && row.accuracy > prev.accuracy)
    ) {
      best.set(key, row);
    }
  }
  return [...best.values()].sort(
    (a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy
  );
}

export function ProfileOverview({ xp, today }: { xp: number; today: string }) {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetMyStatsQuery();
  const { data: board, isLoading: boardLoading } = useGetLeaderboardQuery({
    limit: 50,
  });

  const totalXp = Math.max(0, Math.round(Number(xp) || 0));
  const { level, xpIntoLevel, xpForNextLevel } = levelFromXp(totalXp);
  const xpPct =
    xpForNextLevel > 0
      ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100))
      : 0;

  const streak = stats ? streakFrom(stats.history, today) : 0;
  const milestones = milestonesFrom(stats ?? null, streak);
  const earned = milestones.filter((m) => m.earned).length;

  const rows = bestRows(board?.rows ?? []);
  const myRank = rows.findIndex((r) => isLeaderboardRowMine(r, user));
  const top = rows.slice(0, 4).map((r, i) => ({ r, rank: i + 1 }));
  if (myRank >= 4) top.push({ r: rows[myRank], rank: myRank + 1 });

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent/10 text-accent">
            <Zap size={20} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-extrabold">Level {level}</p>
              <span className="rounded-full bg-chip px-2 py-0.5 text-[10px] font-bold tabular-nums text-muted">
                {totalXp.toLocaleString()} XP
              </span>
            </div>
            <div
              aria-hidden
              className="mt-2 h-2 overflow-hidden rounded-full bg-chip"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width]"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] tabular-nums text-muted">
              {xpIntoLevel.toLocaleString()} /{" "}
              {xpForNextLevel.toLocaleString()} XP to level {level + 1}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Award size={15} className="text-violet-400" aria-hidden />
            <p className="text-sm font-extrabold">Achievements</p>
            <span className="ml-auto rounded-full bg-chip px-2 py-0.5 text-[10px] font-bold tabular-nums text-muted">
              {earned}/{milestones.length}
            </span>
          </div>

          {statsLoading ? (
            <div className="mt-3 grid grid-cols-2 gap-2" aria-hidden>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-inset" />
              ))}
            </div>
          ) : (
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {milestones.map((m) => {
                const Icon = MILESTONE_ICONS[m.Icon] ?? Award;
                return (
                  <li
                    key={m.id}
                    title={`${m.name} — ${m.earned ? "earned" : "in progress"} (${m.detail})`}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-2",
                      m.earned
                        ? "border-violet-500/35 bg-violet-500/[0.07]"
                        : "border-line bg-inset opacity-70"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                        m.earned
                          ? "bg-violet-500/15 text-violet-400"
                          : "bg-chip text-muted"
                      )}
                    >
                      <Icon size={13} aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[11px] font-bold leading-4">
                        {m.name}
                      </span>
                      <span className="block text-[10px] tabular-nums text-faint">
                        {m.detail}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/achievements"
            className="mt-3 block text-center text-[11px] font-bold text-accent hover:underline"
          >
            View all achievements →
          </Link>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Trophy size={15} className="text-amber-500" aria-hidden />
            <p className="text-sm font-extrabold">Leaderboard</p>
            <Link
              href="/leaderboard"
              className="ml-auto text-[11px] font-bold text-accent hover:underline"
            >
              View all →
            </Link>
          </div>

          {boardLoading ? (
            <div className="mt-3 space-y-2" aria-hidden>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded-lg bg-inset" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="mt-3 rounded-lg border border-line bg-inset p-3 text-center text-[11px] text-muted">
              No ranks yet — finish a test to appear here.
            </p>
          ) : (
            <>
              <p className="mt-2 text-[11px] font-bold text-muted">
                {myRank >= 0 ? (
                  <>
                    Your best rank{" "}
                    <span className="text-accent">#{myRank + 1}</span>
                    <span className="font-medium text-faint">
                      {" "}
                      · {rows[myRank].wpm} WPM
                    </span>
                  </>
                ) : (
                  "Keep typing to enter the live board."
                )}
              </p>
              <ul className="mt-2 space-y-1">
                {top.map(({ r, rank }) => {
                  const you = myRank >= 0 && rank === myRank + 1;
                  const name = displayName(r.userName, `Typist ${rank}`);
                  return (
                    <li
                      key={`${rank}-${r.userId || r.userName}`}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px]",
                        you && "border border-accent/30 bg-accent/[0.07]"
                      )}
                    >
                      <span className="w-6 shrink-0 font-mono text-[10px] font-bold tabular-nums text-muted">
                        #{rank}
                      </span>
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-800 text-[9px] font-black text-white">
                        {initialsOf(you ? "You" : name)}
                      </span>
                      <span
                        className={cn(
                          "truncate font-medium",
                          you && "font-bold text-accent"
                        )}
                      >
                        {you ? "You" : name}
                      </span>
                      <span className="ml-auto shrink-0 font-mono text-[11px] font-bold tabular-nums text-accent">
                        {r.wpm} WPM
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
