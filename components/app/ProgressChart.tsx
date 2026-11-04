"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import {
  useGetMyStatsQuery,
  type PracticeStatsPoint,
} from "@/lib/features/practice/features.practice";
import { cn } from "@/lib/cn";

const W = 400;
const H = 150;
const PAD = 28; // left gutter: WPM axis
const PAD_R = 30; // right gutter: accuracy axis (%)
const PLOT_W = W - PAD - PAD_R;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Accuracy is always drawn on its own fixed 0–100 % scale. */
const ACC_MAX = 100;
/** Round the WPM axis up to a multiple of 15 so the thirds stay whole numbers. */
const WPM_STEP = 15;

const RANGES = ["7D", "30D", "90D"] as const;
type Range = (typeof RANGES)[number];
const DAYS: Record<Range, number> = { "7D": 7, "30D": 30, "90D": 90 };

/** Day key → milliseconds at UTC midnight (stable, no local-time drift). */
function dayMs(date: string): number {
  return new Date(`${date}T00:00:00.000Z`).getTime();
}

function shortDay(date: string): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function xAt(i: number, count: number): number {
  return PAD + (i * PLOT_W) / (count - 1 || 1);
}

function yAt(value: number, max: number): number {
  return H - PAD - (Math.min(Math.max(value, 0), max) / max) * (H - PAD * 2);
}

function polyline(values: number[], max: number, xs?: number[]): string {
  return values
    .map((v, i) => {
      const x = xs ? xs[i] : xAt(i, values.length);
      return `${x.toFixed(1)},${yAt(v, max).toFixed(1)}`;
    })
    .join(" ");
}

export function ProgressChart({ today }: { today: string }) {
  const [range, setRange] = useState<Range>("7D");
  const { data, isLoading, isError } = useGetMyStatsQuery();

  // Real results only: slice the 90-day curve to the selected window.
  const points = useMemo<PracticeStatsPoint[]>(() => {
    const end = dayMs(today);
    if (Number.isNaN(end)) return [];
    const start = end - (DAYS[range] - 1) * DAY_MS;
    return (data?.history ?? []).filter((p) => {
      const t = dayMs(p.date);
      return Number.isFinite(t) && t >= start && t <= end;
    });
  }, [data, range, today]);

  // One logged day still gets a full chart: plot it as a flat line across the
  // window so the level is visible instead of an empty placeholder.
  const single = points.length === 1;
  const plotted = single ? [points[0], points[0]] : points;
  const wpm = plotted.map((p) => p.wpm);
  const acc = plotted.map((p) => p.accuracy);
  const xs = plotted.map((_, i) => xAt(i, plotted.length));
  const peak = Math.max(45, ...wpm);
  // The WPM axis follows the data, so a 34→45 curve does not sit on the floor of
  // a 0–120 axis. Rounded up to a multiple of 15 with ~10% headroom.
  const max = Math.min(405, Math.max(60, Math.ceil((peak * 1.1) / WPM_STEP) * WPM_STEP));
  const ticks = [0, Math.round(max / 3), Math.round((max * 2) / 3), max];
  const accTicks = [0, 50, ACC_MAX];
  const tests = points.reduce((sum, p) => sum + p.tests, 0);
  // Evenly spaced date labels, always including the first and last day, so two
  // neighbouring labels can never overlap at the edges.
  const labelCount = Math.min(7, points.length);
  const labelIdx = new Set<number>();
  for (let k = 0; k < labelCount; k += 1) {
    labelIdx.add(Math.round((k * (points.length - 1)) / Math.max(labelCount - 1, 1)));
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/10 text-accent">
          <TrendingUp size={15} aria-hidden />
        </span>
        <p className="text-sm font-extrabold">Typing Progress</p>
        <div className="ml-auto flex gap-1" role="tablist" aria-label="Range">
          {RANGES.map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={range === r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[11px] font-bold transition",
                range === r ? "bg-mint text-black" : "text-muted hover:text-ink"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 flex flex-wrap gap-4 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> WPM
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> Accuracy
        </span>
        {points.length > 0 && (
          <span className="ml-auto tabular-nums text-faint">
            {tests} {tests === 1 ? "test" : "tests"} · {points.length}{" "}
            {points.length === 1 ? "day" : "days"}
          </span>
        )}
      </p>

      {isLoading ? (
        <div aria-hidden className="mt-2 h-[150px] animate-pulse rounded-lg bg-inset" />
      ) : isError || !data ? (
        <div className="mt-2 grid h-[150px] place-items-center rounded-lg border border-dashed border-line">
          <p className="max-w-[240px] text-center text-[12px] leading-5 text-muted">
            Finish a practice test and your curve starts here.
          </p>
        </div>
      ) : points.length === 0 ? (
        <div className="mt-2 grid h-[150px] place-items-center rounded-lg border border-dashed border-line">
          <p className="max-w-[260px] text-center text-[12px] leading-5 text-muted">
            No tests in the last {DAYS[range]} days — finish a test or widen the
            range to see this window.
          </p>
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mt-1 w-full"
          role="img"
          aria-label={`Typing progress, ${range}: ${points.length} ${points.length === 1 ? "day" : "days"}, ${tests} ${tests === 1 ? "test" : "tests"}`}
        >
          {ticks.map((g) => {
            const y = yAt(g, max);
            return (
              <g key={g}>
                <line
                  x1={PAD}
                  x2={W - PAD_R}
                  y1={y}
                  y2={y}
                  stroke="var(--line)"
                  strokeWidth="1"
                />
                <text
                  x={2}
                  y={y + 3}
                  fontSize="8"
                  fill="var(--faint)"
                  className="tabular-nums"
                >
                  {g}
                </text>
              </g>
            );
          })}
          {accTicks.map((g) => (
            <text
              key={`a${g}`}
              x={W - 2}
              y={yAt(g, ACC_MAX) + 3}
              fontSize="8"
              fill="var(--faint)"
              textAnchor="end"
              className="tabular-nums"
            >
              {g}%
            </text>
          ))}

          <polyline
            points={polyline(acc, ACC_MAX, xs)}
            fill="none"
            stroke="#a855f7"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <polyline
            points={polyline(wpm, max, xs)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {acc.map((v, i) => {
            if (single && i > 0) return null;
            const x = single ? W / 2 : xAt(i, points.length);
            return (
              <circle
                key={`p${i}`}
                cx={x}
                cy={yAt(v, ACC_MAX)}
                r={single ? 3 : 1.8}
                fill="#a855f7"
              >
                <title>{`${shortDay(plotted[i].date)} · ${v}% accuracy · ${plotted[i].tests} ${plotted[i].tests === 1 ? "test" : "tests"}`}</title>
              </circle>
            );
          })}

          {wpm.map((v, i) => {
            // A single day has no trend yet: one dot in the middle of the line.
            if (single && i > 0) return null;
            const x = single ? W / 2 : xAt(i, points.length);
            return (
              <circle key={`w${i}`} cx={x} cy={yAt(v, max)} r={single ? 4 : 2.6} fill="var(--accent)">
                <title>{`${shortDay(plotted[i].date)} · ${v} WPM · ${acc[i]}% · ${plotted[i].tests} ${plotted[i].tests === 1 ? "test" : "tests"}`}</title>
              </circle>
            );
          })}

          {points.map((p, i) => {
            if (!single && !labelIdx.has(i)) return null;
            const last = i === points.length - 1;
            const x = single ? W / 2 : xAt(i, points.length);
            return (
              <text
                key={p.date}
                x={x}
                y={H - 8}
                fontSize="8"
                fill="var(--faint)"
                textAnchor={single ? "middle" : i === 0 ? "start" : last ? "end" : "middle"}
              >
                {shortDay(p.date)}
              </text>
            );
          })}
        </svg>
      )}
    </Card>
  );
}
