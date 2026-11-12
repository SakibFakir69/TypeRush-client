"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  CalendarCheck,
  Clock,
  Crosshair,
  Flame,
  RefreshCw,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { ProgressCurve } from "@/components/app/ProgressCurve";
import { ProgressHistory } from "@/components/app/ProgressHistory";
import { ProgressUnlocks } from "@/components/app/ProgressUnlocks";
import {
  PROGRESS_RANGES,
  useGetProgressChartsQuery,
  useGetProgressOverviewQuery,
  type ProgressChartPoint,
  type ProgressRange,
} from "@/lib/features/progress/features.progress";
import { useGetMyStatsQuery } from "@/lib/features/practice/features.practice";
import { streakFrom } from "@/lib/stats-helpers";
import { cn } from "@/lib/cn";

const WEEKDAYS = [
  "Sundays",
  "Mondays",
  "Tuesdays",
  "Wednesdays",
  "Thursdays",
  "Fridays",
  "Saturdays",
];

/** "2h 14m" — seconds as a readable duration. */
function durationLabel(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  if (total === 0) return "–";
  const hours = Math.floor(total / 3600);
  const minutes = Math.round((total % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Day key → weekday index (0 = Sunday), in UTC so the server agrees. */
function weekdayOf(day: string): number {
  const d = new Date(`${day}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? 0 : d.getUTCDay();
}

function shortDay(day: string): string {
  const d = new Date(`${day}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return day;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

type StatCard = {
  Icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  tone: string;
};

export function ProgressDashboard({ today }: { today: string }) {
  const [range, setRange] = useState<ProgressRange>("30d");

  const overviewQuery = useGetProgressOverviewQuery();
  const chartsQuery = useGetProgressChartsQuery(range);
  const { data: stats } = useGetMyStatsQuery();

  const points: ProgressChartPoint[] = useMemo(
    () => chartsQuery.data ?? [],
    [chartsQuery.data]
  );
  const overview = overviewQuery.data;

  const model = useMemo(() => {
    const runs = points.reduce((sum, p) => sum + p.sessions, 0);
    const activeDays = points.filter((p) => p.sessions > 0).length;

    /** Session-weighted average of a daily value. */
    const weighted = (pick: (p: ProgressChartPoint) => number): number => {
      if (runs === 0) return 0;
      const sum = points.reduce((acc, p) => acc + pick(p) * p.sessions, 0);
      return Math.round(sum / runs);
    };

    const chartAvgWpm = weighted((p) => p.avgWpm);
    const chartAvgAccuracy = weighted((p) => p.avgAccuracy);

    // Trend: the second half of the window against the first half.
    const half = Math.floor(points.length / 2);
    const first = points.slice(0, half);
    const second = points.slice(half);
    const avgOf = (list: ProgressChartPoint[], pick: (p: ProgressChartPoint) => number) => {
      const total = list.reduce((sum, p) => sum + p.sessions, 0);
      if (total === 0) return 0;
      return (
        list.reduce((sum, p) => sum + pick(p) * p.sessions, 0) / total
      );
    };
    const firstAvg = avgOf(first, (p) => p.avgWpm);
    const secondAvg = avgOf(second, (p) => p.avgWpm);
    const trendPct =
      firstAvg > 0 && secondAvg > 0
        ? Math.round(((secondAvg - firstAvg) / firstAvg) * 100)
        : null;

    // The best day of the window.
    const bestDay = points.reduce<ProgressChartPoint | null>(
      (best, p) => (!best || p.avgWpm > best.avgWpm ? p : best),
      null
    );

    // The weekday the user types most on.
    const perWeekday = new Array(7).fill(0) as number[];
    for (const p of points) perWeekday[weekdayOf(p.day)] += p.sessions;
    const busiest = perWeekday.reduce(
      (best, count, index) => (count > perWeekday[best] ? index : best),
      0
    );

    // Consistency: how tight the daily speeds are around their average.
    const mean = chartAvgWpm;
    let spread = 0;
    if (points.length > 1 && mean > 0) {
      const variance =
        points.reduce((sum, p) => sum + (p.avgWpm - mean) ** 2, 0) /
        points.length;
      spread = Math.sqrt(variance);
    }
    const consistency =
      points.length > 1 && mean > 0
        ? Math.max(0, Math.min(100, Math.round(100 - (spread / mean) * 100)))
        : null;

    return {
      runs,
      activeDays,
      chartAvgWpm,
      chartAvgAccuracy,
      trendPct,
      bestDay,
      busiestWeekday: perWeekday[busiest] > 0 ? WEEKDAYS[busiest] : null,
      consistency,
    };
  }, [points]);

  // The server owns the lifetime totals; the practice stats fill the gap for
  // accounts whose stats row was never written (older logins).
  const bestWpm = Math.max(
    overview?.bestWpm ?? 0,
    stats?.bestWpm ?? 0,
    ...points.map((p) => p.maxWpm)
  );
  const bestAccuracy = Math.max(
    overview?.bestAccuracy ?? 0,
    stats?.currentAccuracy ?? 0,
    ...points.map((p) => p.avgAccuracy)
  );
  const avgWpm = overview?.avgWpm || model.chartAvgWpm;
  const avgAccuracy = overview?.avgAccuracy || model.chartAvgAccuracy;
  const totalSessions =
    overview?.totalSessions || stats?.totalTests || model.runs;
  const timeTyped = overview?.totalTimeTyped ?? 0;

  const streak = stats ? streakFrom(stats.history, today) : 0;

  const cards: StatCard[] = [
    {
      Icon: Zap,
      label: "Best WPM",
      value: bestWpm > 0 ? String(bestWpm) : "–",
      sub: "Personal record",
      tone: "bg-accent/10 text-accent",
    },
    {
      Icon: TrendingUp,
      label: "Average WPM",
      value: avgWpm > 0 ? String(avgWpm) : "–",
      sub: "Across every run",
      tone: "bg-accent/10 text-accent",
    },
    {
      Icon: Crosshair,
      label: "Best accuracy",
      value: bestAccuracy > 0 ? `${bestAccuracy}%` : "–",
      sub: `Average ${avgAccuracy > 0 ? `${avgAccuracy}%` : "–"}`,
      tone: "bg-amber-500/15 text-amber-500",
    },
    {
      Icon: Activity,
      label: "Runs logged",
      value: totalSessions > 0 ? totalSessions.toLocaleString() : "–",
      sub: `${model.activeDays} active ${
        model.activeDays === 1 ? "day" : "days"
      } in this window`,
      tone: "bg-violet-500/15 text-violet-400",
    },
  ];

  const rangeLabel =
    PROGRESS_RANGES.find((r) => r.id === range)?.label.toUpperCase() ?? "30D";

  const refreshing =
    overviewQuery.isFetching ||
    chartsQuery.isFetching ||
    chartsQuery.isLoading ||
    overviewQuery.isLoading;

  const refresh = () => {
    void overviewQuery.refetch();
    void chartsQuery.refetch();
  };

  /** The numbers behind every badge category. */
  const unlockValues = {
    speed: bestWpm,
    accuracy: bestAccuracy,
    volume: stats?.totalTests ?? totalSessions,
    streak,
    contest: stats?.contestsJoined ?? 0,
    social: null as number | null,
  };

  return (
    <div className="space-y-4">
      {/* Toolbar: the window of the curve + a manual refresh. */}
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          aria-label="Progress window"
          className="flex items-center gap-1 rounded-xl border border-line bg-card p-1"
        >
          {PROGRESS_RANGES.map((option) => (
            <button
              key={option.id}
              role="tab"
              type="button"
              aria-selected={range === option.id}
              onClick={() => setRange(option.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 font-mono text-[11px] font-bold transition",
                range === option.id
                  ? "bg-mint text-black"
                  : "text-muted hover:bg-chip hover:text-ink"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={refresh}
          aria-label="Refresh progress"
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-2 text-[11px] font-bold text-muted transition hover:bg-chip hover:text-ink"
        >
          <RefreshCw
            size={13}
            aria-hidden
            className={cn(refreshing && "animate-spin")}
          />
          Refresh
        </button>

        <p className="ml-auto text-[11px] text-faint">
          {model.runs > 0
            ? `${model.runs} ${model.runs === 1 ? "run" : "runs"} in the last ${
                PROGRESS_RANGES.find((r) => r.id === range)?.days ?? 30
              } days`
            : "No runs in this window yet"}
        </p>
      </div>

      {/* Headline numbers. */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ Icon, label, value, sub, tone }) => (
          <Card key={label} className="flex items-center gap-3 p-4">
            <span
              className={cn(
                "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                tone
              )}
            >
              <Icon size={20} strokeWidth={2.2} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] text-muted">{label}</span>
              <span className="block text-2xl font-black tabular-nums">
                {value}
              </span>
              <span className="block truncate text-[11px] text-faint">{sub}</span>
            </span>
          </Card>
        ))}
      </div>

      {/* The curve + what it means. */}
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <ProgressCurve
          points={points}
          isLoading={chartsQuery.isLoading}
          isError={chartsQuery.isError}
          onRetry={() => void chartsQuery.refetch()}
          rangeLabel={rangeLabel}
        />

        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <p className="text-sm font-extrabold">Insights</p>
            <p className="mt-0.5 text-[11px] text-muted">
              What your last {rangeLabel.toLowerCase()} says about you
            </p>

            <ul className="mt-3 space-y-2.5">
              <li className="flex items-start gap-2.5 rounded-xl border border-line bg-inset p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                  <TrendingUp size={15} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-faint">
                    Trend
                  </span>
                  <span className="block text-[13px] font-extrabold text-ink">
                    {model.trendPct === null
                      ? "Not enough data yet"
                      : `${model.trendPct >= 0 ? "↑" : "↓"} ${Math.abs(
                          model.trendPct
                        )}% speed`}
                  </span>
                  <span className="block text-[11px] leading-4 text-muted">
                    {model.trendPct === null
                      ? "Keep typing to unlock a trend line."
                      : model.trendPct >= 0
                        ? "Your second half outran your first."
                        : "Your second half was slower than your first."}
                  </span>
                </span>
              </li>

              <li className="flex items-start gap-2.5 rounded-xl border border-line bg-inset p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-500">
                  <Trophy size={15} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-faint">
                    Best day
                  </span>
                  <span className="block text-[13px] font-extrabold text-ink">
                    {model.bestDay
                      ? `${model.bestDay.avgWpm} WPM on ${shortDay(
                          model.bestDay.day
                        )}`
                      : "—"}
                  </span>
                  <span className="block text-[11px] leading-4 text-muted">
                    {model.bestDay
                      ? `${model.bestDay.sessions} ${
                          model.bestDay.sessions === 1 ? "run" : "runs"
                        } that day`
                      : "No active day in this window."}
                  </span>
                </span>
              </li>

              <li className="flex items-start gap-2.5 rounded-xl border border-line bg-inset p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-400">
                  <CalendarCheck size={15} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-faint">
                    Rhythm
                  </span>
                  <span className="block text-[13px] font-extrabold text-ink">
                    {model.busiestWeekday
                      ? `You type most on ${model.busiestWeekday}`
                      : "No rhythm yet"}
                  </span>
                  <span className="block text-[11px] leading-4 text-muted">
                    {model.consistency === null
                      ? "Type a few runs to see your rhythm."
                      : `${model.consistency}% consistency — ${
                          model.consistency >= 70
                            ? "very steady"
                            : model.consistency >= 40
                              ? "room to settle"
                              : "still finding your pace"
                        }`}
                  </span>
                </span>
              </li>
            </ul>
          </Card>

          <Card className="grid grid-cols-2 gap-3 p-4">
            <div>
              <span className="flex items-center gap-1.5 text-[11px] text-muted">
                <Clock size={13} aria-hidden /> Time typed
              </span>
              <span className="mt-0.5 block text-xl font-black tabular-nums">
                {durationLabel(timeTyped)}
              </span>
            </div>
            <div>
              <span className="flex items-center gap-1.5 text-[11px] text-muted">
                <Flame size={13} aria-hidden /> Streak
              </span>
              <span className="mt-0.5 block text-xl font-black tabular-nums">
                {streak > 0 ? `${streak}d` : "–"}
              </span>
            </div>
          </Card>
        </div>
      </div>

      <ProgressUnlocks values={unlockValues} />

      <ProgressHistory />
    </div>
  );
}
