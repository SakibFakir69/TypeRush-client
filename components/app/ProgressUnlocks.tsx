"use client";

import Link from "next/link";
import { Award, Lock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import {
  useGetAchievementsQuery,
  type AchievementWithState,
} from "@/lib/features/achievements/features.achievements";
import {
  CATEGORY_BY_ID,
  CATEGORY_META,
  TIER_FALLBACK,
  TIER_STYLE,
  goalText,
  valueText,
} from "@/lib/achievement-meta";
import { formatRunWhen } from "@/lib/stats-helpers";
import { cn } from "@/lib/cn";

/** The user's own number per category — null when we can't know it. */
export type UnlockValues = Record<string, number | null>;

function UnlockTile({
  badge,
  value,
}: {
  badge: AchievementWithState;
  value: number | null;
}) {
  const meta = CATEGORY_BY_ID[badge.category] ?? CATEGORY_META[0];
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
          {unlocked ? (
            <Icon size={17} aria-hidden />
          ) : (
            <Lock size={14} aria-hidden />
          )}
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
 * The unlock shelf on the progress screen: what the user already holds and
 * what is one step away. The catalogue itself lives on /achievements.
 */
export function ProgressUnlocks({
  values,
}: {
  values: UnlockValues;
}) {
  const { data: badges, isLoading, isError } = useGetAchievementsQuery();
  const all = badges ?? [];

  const unlocked = all.filter((b) => b.unlockedAt);
  const locked = all.filter((b) => !b.unlockedAt);
  // The closest locked badges come first: the biggest share of the goal.
  const nextUp = [...locked]
    .map((badge) => {
      const value = values[badge.category] ?? null;
      const pct =
        value !== null && badge.threshold > 0
          ? value / badge.threshold
          : null;
      return { badge, pct };
    })
    .sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1))
    .slice(0, 6)
    .map((entry) => entry.badge);

  const gold = unlocked.filter((b) => b.tier === 3).length;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-500">
          <Award size={17} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold">Unlocks</p>
          <p className="text-[11px] text-muted">
            {all.length === 0
              ? "Badges unlock by themselves the moment you cross a goal"
              : `${unlocked.length} of ${all.length} badges unlocked · ${gold} gold`}
          </p>
        </div>
        <Link
          href="/achievements"
          className="rounded-lg border border-line px-3 py-1.5 text-[11px] font-bold text-muted transition hover:bg-chip hover:text-ink"
        >
          All badges →
        </Link>
      </div>

      {isLoading ? (
        <div aria-hidden className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-inset" />
          ))}
        </div>
      ) : isError ? (
        <p className="mt-3 rounded-xl border border-dashed border-line px-4 py-6 text-center text-xs text-muted">
          The badge service is unreachable — try again in a moment.
        </p>
      ) : all.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-line px-4 py-8 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl border border-line bg-inset text-muted">
            <Sparkles size={18} aria-hidden />
          </span>
          <p className="mt-2.5 text-sm font-extrabold">No badges published yet</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted">
            Once the first set is published they show up here — locked or
            unlocked — and unlock themselves the moment you cross their goal.
          </p>
          <Link
            href="/practice"
            className="mt-4 inline-block rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
          >
            Practice a run →
          </Link>
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          {unlocked.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-faint">
                Unlocked
              </p>
              <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {unlocked.slice(0, 6).map((badge) => (
                  <UnlockTile
                    key={badge.id}
                    badge={badge}
                    value={values[badge.category] ?? null}
                  />
                ))}
              </ul>
            </div>
          )}

          {nextUp.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-faint">
                Next unlocks
              </p>
              <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {nextUp.map((badge) => (
                  <UnlockTile
                    key={badge.id}
                    badge={badge}
                    value={values[badge.category] ?? null}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
