"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  BarChart3,
  Crosshair,
  Flame,
  Star,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/primitives";
import { DASH } from "@/lib/dashboard";
import { useAuth } from "@/lib/auth";
import { useGetLeaderboardQuery } from "@/lib/features/practice/features.practice";
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

export function ProfileCard({ name }: { name: string }) {
  const s = DASH.stats;
  return (
    <Card className="p-5 text-center">
      <Avatar
        src="https://i.pravatar.cc/128?img=11"
        alt={name}
        width={64}
        height={64}
        className="mx-auto h-16 w-16 rounded-full border-2 border-accent/40 object-cover"
      />
      <p className="mt-2 text-lg font-black">{name}</p>
      <div aria-hidden className="mt-2 h-1.5 overflow-hidden rounded-full bg-chip">
        <div className="h-full w-[82%] rounded-full bg-accent" />
      </div>
      <p className="mt-1 text-[11px] tabular-nums text-muted">
        {DASH.xp.toLocaleString()} / {DASH.xpMax.toLocaleString()} XP
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          [String(s.races), "Total Races"],
          [String(s.contests), "Contests"],
          [String(s.badges), "Badges"],
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

const TABS = ["Global", "Weekly", "Friends"] as const;
type BoardTab = (typeof TABS)[number];

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
  const { data, isLoading, isError, refetch } = useGetLeaderboardQuery();
  const [tab, setTab] = useState<BoardTab>("Global");

  const myEmail = typeof user?.email === "string" ? user.email : "";
  const myId = typeof user?.id === "string" ? user.id : "";

  // Real submitted results, highest WPM first — no placeholder names.
  const rows = useMemo(() => {
    const all = [...(data?.rows ?? [])].sort((a, b) => b.wpm - a.wpm);
    if (tab !== "Weekly") return all;
    // "This week" is measured against the newest result in the feed, so the
    // render stays pure (no Date.now()).
    const times = all
      .map((r) => (r.createdAt ? new Date(r.createdAt).getTime() : NaN))
      .filter((t) => Number.isFinite(t)) as number[];
    if (times.length === 0) return all;
    const weekAgo = Math.max(...times) - 7 * 24 * 60 * 60 * 1000;
    return all.filter(
      (r) =>
        !r.createdAt || new Date(r.createdAt).getTime() >= weekAgo
    );
  }, [data, tab]);

  const mine = rows.findIndex(
    (r) =>
      (myId !== "" && r.userId === myId) ||
      (myEmail !== "" && r.userName === myEmail)
  );
  // Top four, plus your own row when you rank below them.
  const shown = rows.slice(0, 4).map((r, i) => ({ r, rank: i + 1 }));
  if (mine >= 4) shown.push({ r: rows[mine], rank: mine + 1 });

  return (
    <Card className="p-5">
      <PanelHead title="Leaderboard" href="/leaderboard" />
      <div className="mt-2.5 flex gap-1 rounded-lg bg-inset p-1 text-[11px] font-bold">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={cn(
              "flex-1 rounded-md px-2 py-1 text-center transition",
              tab === t ? "bg-mint text-black" : "text-muted hover:text-ink"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
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
      ) : tab === "Friends" ? (
        <p className="mt-3 rounded-lg border border-line bg-inset p-3 text-center text-[12px] text-muted">
          Friends ranks arrive with 1v1 battles.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-3 rounded-lg border border-line bg-inset p-3 text-center text-[12px] text-muted">
          {tab === "Weekly"
            ? "No results in the last 7 days."
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

const FEED_ICONS: Record<string, typeof Zap> = {
  zap: Zap,
  chart: BarChart3,
  swords: Swords,
  trophy: Trophy,
  xp: Star,
};

export function ActivityFeed() {
  return (
    <Card className="p-5">
      <PanelHead title="Recent Activity" href="/progress" />
      <ul className="mt-2.5 space-y-2.5">
        {DASH.activity
          .filter((a) => !a.text.includes("Weekly Typing Showdown"))
          .map((a) => {
            const Icon = FEED_ICONS[a.icon] ?? Zap;
            return (
              <li key={a.text} className="flex items-start gap-2.5 text-[13px]">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                  <Icon size={13} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block leading-5">{a.text}</span>
                  <span className="block text-[11px] text-faint">{a.when}</span>
                </span>
              </li>
            );
          })}
      </ul>
    </Card>
  );
}

const BADGE_ICONS: Record<string, typeof Zap> = {
  zap: Zap,
  target: Crosshair,
  flame: Flame,
  swords: Swords,
};

export function AchievementsRow() {
  return (
    <Card className="p-5">
      <PanelHead title="Recent Achievements" href="/achievements" />
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        {DASH.achievements.map((a) => {
          const Icon = BADGE_ICONS[a.icon] ?? Award;
          return (
            <div key={a.name}>
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-400">
                <Icon size={18} aria-hidden />
              </span>
              <p className="mt-1.5 text-[10px] font-bold leading-tight">{a.name}</p>
              <p className="text-[10px] tabular-nums text-accent">{a.xp}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
