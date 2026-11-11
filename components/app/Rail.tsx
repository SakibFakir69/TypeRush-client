"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  BarChart3,
  Crosshair,
  Flame,
  Layers,
  Star,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import {
  useGetLeaderboardQuery,
  useGetMyStatsQuery,
  type LeaderboardEntry,
} from "@/lib/features/practice/features.practice";
import {
  formatRunWhen,
  isLeaderboardRowMine,
  levelFromXp,
  milestonesFrom,
  runLengthLabel,
  runLengthOf,
  streakFrom,
} from "@/lib/stats-helpers";
import { cn } from "@/lib/cn";

function PanelHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-sm font-extrabold">{title}</p>
      <Link href={href} className="ml-auto text-xs font-semibold text-accent hover:underline">
        View all â†’
      </Link>
    </div>
  );
}

export function ProfileCard({ name, today }: { name: string; today: string }) {
  const { user } = useAuth();
  const { data: stats } = useGetMyStatsQuery();

  const fullName =
    (typeof user?.fullName === "string" && user.fullName) ||
    (typeof user?.name === "string" && user.name) ||
    name;
  const avatarUrl = typeof user?.avatarUrl === "string" ? user.avatarUrl : "";

  // XP and level come straight from the session row; the curve mirrors the
  // server's level helper (level 1 = 100 XP, level 2 = 200 XP, …).
  const xp = Math.max(0, Math.round(Number(user?.xp) || 0));
  const { level, xpIntoLevel, xpForNextLevel } = levelFromXp(xp);
  const pct =
    xpForNextLevel > 0
      ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100))
      : 0;

  const streak = stats ? streakFrom(stats.history, today) : 0;
  const badges = stats
    ? milestonesFrom(stats, streak).filter((m) => m.earned).length
    : 0;

  return (
    <Card className="p-5 text-center">
      {avatarUrl ? (
        <Avatar
          src={avatarUrl}
          alt={fullName}
          width={64}
          height={64}
          className="mx-auto h-16 w-16 rounded-full border-2 border-accent/40 object-cover"
        />
      ) : (
        <span
          role="img"
          aria-label={fullName}
          className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-accent/40 bg-gradient-to-br from-teal-600 to-emerald-800 text-lg font-black text-white"
        >
          {initialsOf(fullName)}
        </span>
      )}
      <p className="mt-2 text-lg font-black">{fullName}</p>
      <p className="text-[11px] font-bold text-accent">Level {level}</p>
      <div
        aria-hidden
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-chip"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] tabular-nums text-muted">
        {xpIntoLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          [String(stats?.totalTests ?? 0), "Total Races"],
          [String(stats?.contestsJoined ?? 0), "Contests"],
          [String(badges), "Milestones"],
        ].map(([v, k]) => (
          <div key={k} className="rounded-lg bg-inset p-2">
            <p className="text-base font-black tabular-nums">{v}</p>
            <p className="text-[10px] text-muted">{k}</p>
          </div>
        ))}
      </div>
      <Link
        href="/settings"
        className="mt-3 block rounded-lg border border-line px-4 py-2 text-[13px] font-bold transition hover:bg-chip"
      >
        View Profile â†’
      </Link>
    </Card>
  );
}

/** Time-category boards, matching /leaderboard: Global = every run length. */
const BOARDS = [
  { id: "global", label: "Global", duration: undefined },
  { id: "15", label: "15s", duration: 15 },
  { id: "30", label: "30s", duration: 30 },
  { id: "60", label: "60s", duration: 60 },
] as const;
type BoardTab = (typeof BOARDS)[number]["id"];

/** "sakib.fakir@gmail.com" â†’ "Sakib Fakir"; names pass through. */
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

export function MiniLeaderboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<BoardTab>("global");
  const board = BOARDS.find((b) => b.id === tab) ?? BOARDS[0];
  const { data, isLoading, isFetching, isError, refetch } =
    useGetLeaderboardQuery({ duration: board.duration, limit: 50 });

  // One row per typist: their best run in this category. Without this the same
  // person filled four ranks with four different runs.
  const rows = useMemo(() => {
    const best = new Map<string, LeaderboardEntry>();
    for (const row of data?.rows ?? []) {
      const key = row.userId || row.userName || "anon";
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
  }, [data]);

  const mine = rows.findIndex((r) => isLeaderboardRowMine(r, user));
  // Top four, plus your own row when you rank below them.
  const shown = rows.slice(0, 4).map((r, i) => ({ r, rank: i + 1 }));
  if (mine >= 4) shown.push({ r: rows[mine], rank: mine + 1 });

  return (
    <Card className="p-5">
      <PanelHead title="Leaderboard" href="/leaderboard" />
      <div className="mt-2.5 flex gap-1 rounded-lg bg-inset p-1 text-[11px] font-bold">
        {BOARDS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setTab(b.id)}
            aria-pressed={tab === b.id}
            className={cn(
              "flex-1 rounded-md px-1.5 py-1 text-center transition",
              tab === b.id ? "bg-mint text-black" : "text-muted hover:text-ink"
            )}
          >
            {b.label}
          </button>
        ))}
      </div>

      {isLoading || isFetching ? (
        <div className="mt-2 space-y-1" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded-lg bg-inset" />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-3 text-center">
          <p className="text-[12px] text-muted">Couldn&apos;t load ranks.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 rounded-lg border border-line px-3 py-1.5 text-[11px] font-bold transition hover:bg-chip"
          >
            Retry
          </button>
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-3 rounded-lg border border-line bg-inset p-3 text-center text-[12px] text-muted">
          {board.duration
            ? `No ${board.label} runs yet — finish one to take #1.`
            : "No ranks yet — finish a test to appear here."}
        </p>
      ) : (
        <ul className="mt-2 space-y-1">
          {shown.map(({ r, rank }) => {
            const you = mine >= 0 && rank === mine + 1;
            const name = displayName(r.userName, `Typist ${rank}`);
            return (
              <li
                key={`${rank}-${r.userId}`}
                title={`${you ? "You" : name} · ${runLengthLabel(
                  r.duration ?? r.timeTaken
                )} run · ${r.wpm} WPM · ${r.accuracy}% accuracy`}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px]",
                  you && "border border-accent/30 bg-accent/[0.07]"
                )}
              >
                <span className="w-7 shrink-0 font-mono text-[11px] font-bold tabular-nums text-muted">
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
                {!board.duration && (
                  <span className="shrink-0 rounded bg-inset px-1 py-0.5 text-[9px] font-bold tabular-nums text-faint">
                    {runLengthLabel(r.duration ?? r.timeTaken)}
                  </span>
                )}
                <span className="ml-auto shrink-0 font-mono text-[11px] font-bold tabular-nums text-accent">
                  {r.wpm} WPM
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

const FEED_ICONS: Record<string, LucideIcon> = {
  zap: Zap,
  chart: BarChart3,
  swords: Swords,
  trophy: Trophy,
  xp: Star,
  target: Crosshair,
  layers: Layers,
  flame: Flame,
};

export function ActivityFeed() {
  const { data: stats, isLoading } = useGetMyStatsQuery();

  // Newest runs only; the 0-WPM placeholder row is not an achievement.
  const runs = (stats?.recent ?? []).filter((r) => r.wpm > 0).slice(0, 5);
  const best = Math.round(stats?.bestWpm ?? 0);

  return (
    <Card className="p-5">
      <PanelHead title="Recent Activity" href="/practice" />
      {isLoading ? (
        <ul className="mt-2.5 space-y-2.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-8 animate-pulse rounded-lg bg-inset" />
          ))}
        </ul>
      ) : runs.length === 0 ? (
        <p className="mt-3 rounded-lg border border-line bg-inset p-3 text-center text-[12px] text-muted">
          No runs yet — finish a practice test and it shows up here.
        </p>
      ) : (
        <ul className="mt-2.5 space-y-2.5">
          {runs.map((run) => {
            const length = runLengthOf(run);
            const isBest = run.wpm === best;
            const isContest = Boolean(run.contestId);
            const Icon = isContest ? Trophy : isBest ? BarChart3 : Zap;
            const text = isContest
              ? `Contest run · ${run.wpm} WPM · ${run.accuracy}%`
              : isBest
                ? `New personal best · ${run.wpm} WPM`
                : `${runLengthLabel(length)} run · ${run.wpm} WPM · ${run.accuracy}%`;
            return (
              <li
                key={run.id}
                className="flex items-start gap-2.5 text-[13px]"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                  <Icon size={13} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block leading-5">{text}</span>
                  <span className="block text-[11px] text-faint">
                    {formatRunWhen(run.createdAt)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

export function AchievementsRow({ today }: { today: string }) {
  const { data: stats } = useGetMyStatsQuery();
  const streak = stats ? streakFrom(stats.history, today) : 0;
  const milestones = milestonesFrom(stats ?? null, streak);

  return (
    <Card className="p-5">
      <PanelHead title="Milestones" href="/achievements" />
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        {milestones.map((m) => {
          const Icon = FEED_ICONS[m.Icon] ?? Award;
          return (
            <div
              key={m.id}
              title={`${m.name} — ${m.earned ? "earned" : "in progress"} (${m.detail})`}
            >
              <span
                className={cn(
                  "mx-auto grid h-11 w-11 place-items-center rounded-full border",
                  m.earned
                    ? "border-violet-500/40 bg-violet-500/10 text-violet-400"
                    : "border-line bg-inset text-muted"
                )}
              >
                <Icon size={18} aria-hidden />
              </span>
              <p className="mt-1.5 text-[10px] font-bold leading-tight">
                {m.name}
              </p>
              <p
                className={cn(
                  "text-[10px] tabular-nums",
                  m.earned ? "text-accent" : "text-faint"
                )}
              >
                {m.detail}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
