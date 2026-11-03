"use client";

import { Crosshair, Flame, Layers, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import {
  useGetMyStatsQuery,
  type PracticeStats,
  type PracticeStatsPoint,
} from "@/lib/features/practice/features.practice";
import { cn } from "@/lib/cn";

/** "↑ 12%" / "↓ 3%" / null when there is nothing to compare against. */
function deltaLabel(value: number, sampleSize: number): string | null {
  if (sampleSize <= 0) return null;
  if (value === 0) return "flat";
  return `${value > 0 ? "↑" : "↓"} ${Math.abs(value)}%`;
}

/**
 * Consecutive days with at least one test, ending today or yesterday
 * (so the streak survives until you train again today).
 */
function streakFrom(history: PracticeStatsPoint[], today: string): number {
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

type StatCard = {
  Icon: LucideIcon;
  label: string;
  value: string;
  delta: string | null;
  sub: string;
};

export function StatCards({ today }: { today: string }) {
  const { data, isLoading, isError } = useGetMyStatsQuery();
  const stats: PracticeStats | null = data ?? null;
  const ready = Boolean(stats) && !isLoading;
  const empty = !isLoading && (isError || !stats);

  const streak = stats ? streakFrom(stats.history, today) : 0;

  const cards: StatCard[] = [
    {
      Icon: Zap,
      label: "Current WPM",
      value: ready && stats ? String(stats.currentWpm) : "–",
      delta: stats ? deltaLabel(stats.wpmChangePercent, stats.sampleSize) : null,
      sub:
        ready && stats
          ? `Your best: ${stats.bestWpm}`
          : empty
            ? "Finish a test to start"
            : "Loading your results…",
    },
    {
      Icon: Crosshair,
      label: "Accuracy",
      value: ready && stats ? `${stats.currentAccuracy}%` : "–",
      delta: stats
        ? deltaLabel(stats.accuracyChangePercent, stats.sampleSize)
        : null,
      sub:
        ready && stats
          ? stats.sampleSize > 0
            ? `Last ${Math.min(10, stats.sampleSize + 1)} tests`
            : "First test logged"
          : empty
            ? "No accuracy yet"
            : "Loading your results…",
    },
    {
      Icon: Flame,
      label: "Current Streak",
      value: ready ? `${streak} ${streak === 1 ? "day" : "days"}` : "–",
      delta: null,
      sub: ready
        ? streak > 0
          ? "Keep it up!"
          : "Start a streak today"
        : empty
          ? "No streak yet"
          : "Loading your results…",
    },
    {
      Icon: Layers,
      label: "Total Tests",
      value: ready && stats ? stats.totalTests.toLocaleString() : "–",
      delta: null,
      sub: ready ? "Practice runs logged" : empty ? "Nothing logged yet" : "Loading…",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ Icon, label, value, delta, sub }) => (
        <Card key={label} className="flex items-center gap-3 p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
            <Icon size={20} strokeWidth={2.2} aria-hidden />
          </span>
          <span>
            <span className="block text-[11px] text-muted">{label}</span>
            <span
              className={cn(
                "block text-2xl font-black tabular-nums",
                !ready && "text-muted"
              )}
            >
              {value}{" "}
              {delta && (
                <span
                  className={cn(
                    "align-middle text-[11px] font-bold",
                    delta.startsWith("↓") ? "text-rose-500" : "text-accent"
                  )}
                >
                  {delta}
                </span>
              )}
            </span>
            <span className="block text-[11px] text-faint">{sub}</span>
          </span>
        </Card>
      ))}
    </div>
  );
}
