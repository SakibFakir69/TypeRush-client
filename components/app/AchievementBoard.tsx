"use client";

import Link from "next/link";
import { Award, Crosshair, Flame, Layers, Lock, Sparkles, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import {
  useGetAchievementsQuery,
  type AchievementWithState,
} from "@/lib/features/achievements/features.achievements";
import { useGetMyStatsQuery } from "@/lib/features/practice/features.practice";
import type { PracticeStats } from "@/lib/features/practice/features.practice";
import {
  CATEGORY_META,
  TIER_FALLBACK,
  TIER_STYLE,
  goalText,
  valueText,
  type CategoryMeta,
} from "@/lib/achievement-meta";
import {
  formatRunWhen,
  milestonesFrom,
  streakFrom,
  type Milestone,
} from "@/lib/stats-helpers";
import { cn } from "@/lib/cn";

/** Icons for the client-side milestones (the server badges use their own). */
const MILESTONE_ICONS: Record<Milestone["Icon"], LucideIcon> = {
  zap: Zap,
  target: Crosshair,
  layers: Layers,
  flame: Flame,
  trophy: Award,
};

/** The badge categories, in the order the board renders them. */
const CATEGORIES = CATEGORY_META;

function BadgeCard({
  badge,
  meta,
  value,
}: {
  badge: AchievementWithState;
  meta: CategoryMeta;
  /** The user's current number in this category, or null when unknown. */
  value: number | null;
}) {
  const tier = TIER_STYLE[badge.tier] ?? TIER_FALLBACK;
  const unlocked = Boolean(badge.unlockedAt);
  const Icon = meta.Icon;

  const pct =
    value !== null && badge.threshold > 0
      ? Math.min(100, Math.round((value / badge.threshold) * 100))
      : null;

  return (
    <li
      className={cn(
        "flex flex-col rounded-xl border p-3 transition",
        unlocked
          ? "border-accent/30 bg-accent/[0.05]"
          : "border-line bg-inset"
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full border",
            unlocked ? tier.ring : "border-line bg-chip text-muted"
          )}
        >
          {unlocked ? <Icon size={17} aria-hidden /> : <Lock size={14} aria-hidden />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p
              className={cn(
                "truncate text-[13px] font-extrabold",
                !unlocked && "text-muted"
              )}
            >
              {badge.name}
            </p>
            <span
              className={cn(
                "shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase",
                unlocked ? tier.chip : "border-line bg-chip text-faint"
              )}
            >
              {tier.label}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] leading-4 text-muted">
            {badge.description || goalText(meta, badge.threshold)}
          </p>
        </div>
      </div>

      <div className="mt-2.5">
        <div
          aria-hidden
          className="h-1.5 overflow-hidden rounded-full bg-chip"
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width]",
              unlocked ? "bg-accent" : "bg-accent/50"
            )}
            style={{ width: `${unlocked ? 100 : (pct ?? 0)}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] font-semibold tabular-nums text-faint">
          {unlocked ? (
            <>
              Unlocked{" "}
              <span className="text-accent">
                {formatRunWhen(badge.unlockedAt ?? undefined) || "just now"}
              </span>
            </>
          ) : value !== null ? (
            valueText(meta, value, badge.threshold)
          ) : (
            goalText(meta, badge.threshold)
          )}
        </p>
      </div>
    </li>
  );
}

/**
 * The always-on fallback: goals derived from the user's own numbers. They
 * work even before any badge is published on the server.
 */
function PersonalMilestones({
  stats,
  streak,
}: {
  stats: PracticeStats | null;
  streak: number;
}) {
  const milestones = milestonesFrom(stats, streak);

  return (
    <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
      {milestones.map((m) => {
        const Icon = MILESTONE_ICONS[m.Icon] ?? Award;
        return (
          <li
            key={m.id}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-3",
              m.earned
                ? "border-accent/30 bg-accent/[0.05]"
                : "border-line bg-inset"
            )}
          >
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-full border",
                m.earned
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-line bg-chip text-muted"
              )}
            >
              <Icon size={16} aria-hidden />
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "truncate text-[13px] font-extrabold",
                  !m.earned && "text-muted"
                )}
              >
                {m.name}
              </p>
              <p className="text-[11px] tabular-nums text-faint">{m.detail}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function AchievementBoard() {
  const { data: badges, isLoading, isError } = useGetAchievementsQuery();
  const { data: stats } = useGetMyStatsQuery();

  const today = new Date().toISOString().slice(0, 10);
  const streak = stats ? streakFrom(stats.history, today) : 0;

  const bestWpm = Math.max(0, Math.round(stats?.bestWpm ?? 0));
  const bestAccuracy = Math.max(
    Math.round(stats?.currentAccuracy ?? 0),
    ...(stats?.history ?? []).map((p) => p.accuracy),
    0
  );

  /** The user's own number per category — null when we can't know it. */
  const valueFor = (category: string): number | null => {
    switch (category) {
      case "speed":
        return bestWpm;
      case "accuracy":
        return bestAccuracy;
      case "volume":
        return Math.round(stats?.totalTests ?? 0);
      case "streak":
        return streak;
      case "contest":
        return Math.round(stats?.contestsJoined ?? 0);
      default:
        // Battles aren't part of the practice stats — the badge unlocks on
        // the server, the client just can't show the running total.
        return null;
    }
  };

  const all = badges ?? [];
  const unlockedCount = all.filter((b) => b.unlockedAt).length;
  const goldCount = all.filter((b) => b.tier === 3 && b.unlockedAt).length;

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-500/15 text-amber-500">
            <Award size={20} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold">
              {all.length === 0
                ? "Personal milestones"
                : `${unlockedCount} of ${all.length} badges unlocked`}
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              {all.length === 0
                ? "Goals straight from your own runs — published badges show up here too."
                : "Badges unlock by themselves the moment you cross a threshold."}
            </p>
          </div>
          {all.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                ★ {goldCount} gold
              </span>
              <span className="rounded-full border border-line bg-chip px-2 py-0.5 text-[10px] font-bold text-muted">
                {all.length - unlockedCount} to go
              </span>
            </div>
          )}
        </div>
      </Card>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-inset" />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-6 text-center">
          <p className="text-sm font-bold">Could not load your badges</p>
          <p className="mt-1 text-xs text-muted">
            The achievement service is unreachable — try again in a moment.
          </p>
        </Card>
      ) : all.length === 0 ? (
        <Card className="p-4 sm:p-5">
          <div className="text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-line bg-inset text-muted">
              <Sparkles size={20} aria-hidden />
            </span>
            <p className="mt-3 text-sm font-extrabold">No badges published yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted">
              Once the first set is published, they appear here — locked or
              unlocked — and unlock themselves when you cross their goal.
            </p>
            <Link
              href="/practice"
              className="mt-4 inline-block rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
            >
              Practice a run →
            </Link>
          </div>

          <PersonalMilestones stats={stats ?? null} streak={streak} />
        </Card>
      ) : (
        CATEGORIES.map((meta) => {
          const rows = all.filter((b) => b.category === meta.id);
          if (rows.length === 0) return null;
          const Icon = meta.Icon;
          const done = rows.filter((b) => b.unlockedAt).length;
          const value = valueFor(meta.id);

          return (
            <Card key={meta.id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon size={16} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-extrabold">{meta.label}</p>
                  <p className="text-[11px] text-muted">
                    {done}/{rows.length} unlocked · {meta.goal}
                  </p>
                </div>
                {value !== null && (
                  <span className="ml-auto rounded-full bg-chip px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-muted">
                    {meta.id === "speed"
                      ? `${value} WPM`
                      : meta.id === "accuracy"
                        ? `${value}%`
                        : `${value} ${meta.unit}`}
                  </span>
                )}
              </div>

              <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    meta={meta}
                    value={value}
                  />
                ))}
              </ul>
            </Card>
          );
        })
      )}
    </div>
  );
}
