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
const PAD = 28;
const DAY_MS = 24 * 60 * 60 * 1000;

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

function polyline(values: number[], max: number): string {
  const last = values.length - 1;
  return values
    .map((v, i) => {
      const x = PAD + (i * (W - PAD * 2)) / (last || 1);
      const y = H - PAD - (Math.min(v, max) / max) * (H - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
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

  const wpm = points.map((p) => p.wpm);
  const acc = points.map((p) => p.accuracy);
  const peak = Math.max(60, ...wpm);
  const max = Math.max(120, Math.ceil(peak / 60) * 60);
  const ticks = [0, Math.round(max / 3), Math.round((max * 2) / 3), max];
  const labelStep = Math.max(1, Math.ceil(points.length / 7));
  const tests = points.reduce((sum, p) => sum + p.tests, 0);

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
      ) : points.length < 2 ? (
        <div className="mt-2 grid h-[150px] place-items-center rounded-lg border border-dashed border-line">
          <p className="max-w-[260px] text-center text-[12px] leading-5 text-muted">
            {points.length === 0
              ? `No tests in the last ${DAYS[range]} days.`
              : "One more test in this range draws your line."}
          </p>
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mt-1 w-full"
          role="img"
          aria-label={`Typing progress, ${range}: ${points.length} days, ${tests} tests`}
        >
          {ticks.map((g) => {
            const y = H - PAD - (g / max) * (H - PAD * 2);
            return (
              <g key={g}>
                <line
                  x1={PAD}
                  x2={W - 8}
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

          <polyline
            points={polyline(wpm, max)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <polyline
            points={polyline(acc, max)}
            fill="none"
            stroke="#a855f7"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {wpm.map((v, i) => {
            const x = PAD + (i * (W - PAD * 2)) / (wpm.length - 1 || 1);
            const y = H - PAD - (Math.min(v, max) / max) * (H - PAD * 2);
            return (
              <circle key={`w${i}`} cx={x} cy={y} r="2.6" fill="var(--accent)">
                <title>{`${shortDay(points[i].date)} · ${v} WPM · ${acc[i]}% · ${points[i].tests} tests`}</title>
              </circle>
            );
          })}

          {points.map((p, i) => {
            if (i % labelStep !== 0 && i !== points.length - 1) return null;
            const x = PAD + (i * (W - PAD * 2)) / (points.length - 1);
            return (
              <text
                key={p.date}
                x={x}
                y={H - 8}
                fontSize="8"
                fill="var(--faint)"
                textAnchor="middle"
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
