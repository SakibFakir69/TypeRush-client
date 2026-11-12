"use client";

import { useMemo, useRef, useState } from "react";
import { Activity, RotateCw } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import type { ProgressChartPoint } from "@/lib/features/progress/features.progress";

const W = 640;
const H = 260;
const PAD_L = 36; // left gutter: WPM axis
const PAD_R = 38; // right gutter: accuracy axis (%)
const PAD_T = 18;
const PAD_B = 46; // room for the day labels + the volume strip
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const VOL_H = 26; // the run-volume strip under the plot
const ACC_MAX = 100;
/** Round the WPM axis up to a multiple of 10 so the ticks stay whole numbers. */
const WPM_STEP = 10;

function shortDay(day: string): string {
  const d = new Date(`${day}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return day;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function niceCeil(value: number, step: number): number {
  return Math.ceil(value / step) * step;
}

/** Catmull-Rom → cubic Bézier: a smooth curve that never overshoots wildly. */
function smoothPath(
  values: number[],
  xs: number[],
  y: (value: number) => number
): string {
  if (values.length === 0) return "";
  if (values.length === 1) {
    return `M ${xs[0].toFixed(1)},${y(values[0]).toFixed(1)}`;
  }
  const pts = values.map((v, i) => ({ x: xs[i], y: y(v) }));
  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

function yAt(value: number, max: number): number {
  const safeMax = max > 0 ? max : 1;
  return PAD_T + PLOT_H - (Math.min(Math.max(value, 0), safeMax) / safeMax) * PLOT_H;
}

export function ProgressCurve({
  points,
  isLoading,
  isError,
  onRetry,
  rangeLabel,
}: {
  points: ProgressChartPoint[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  rangeLabel: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const model = useMemo(() => {
    const count = points.length;
    const xs = points.map((_, i) =>
      count === 1 ? PAD_L + PLOT_W / 2 : PAD_L + (i * PLOT_W) / (count - 1),
    );
    const peak = Math.max(0, ...points.map((p) => p.avgWpm));
    const wpmMax = Math.max(40, niceCeil(peak * 1.15 || 40, WPM_STEP));
    const accValues = points.map((p) => p.avgAccuracy);
    const accMin = accValues.length
      ? Math.max(0, Math.floor((Math.min(...accValues) - 2) / 5) * 5)
      : 0;
    const accFloor = Math.min(accMin, 95);
    const accSpan = Math.max(5, ACC_MAX - accFloor);
    const maxSessions = Math.max(1, ...points.map((p) => p.sessions));
    const wpmTicks = [0, Math.round(wpmMax / 2), wpmMax];
    const accTicks = [
      accFloor,
      Math.round((accFloor + ACC_MAX) / 2),
      ACC_MAX,
    ];
    return {
      xs,
      wpmMax,
      accFloor,
      accSpan,
      maxSessions,
      wpmTicks,
      accTicks,
      totalRuns: points.reduce((sum, p) => sum + p.sessions, 0),
    };
  }, [points]);

  const { xs, wpmMax, accFloor, accSpan, maxSessions, wpmTicks, accTicks } =
    model;

  /** Accuracy lives on its own axis, so it needs its own scale helper. */
  const accY = (value: number) =>
    PAD_T + PLOT_H - ((value - accFloor) / accSpan) * PLOT_H;

  const wpmValues = points.map((p) => p.avgWpm);
  const accValues = points.map((p) => p.avgAccuracy);
  const wpmPath = smoothPath(wpmValues, xs, (v) => yAt(v, wpmMax));
  const accPath = smoothPath(accValues, xs, (v) => accY(v));

  // The area under the WPM curve: the same path closed on the baseline.
  const areaPath =
    points.length > 0
      ? `${wpmPath} L ${xs[xs.length - 1].toFixed(1)},${(PAD_T + PLOT_H).toFixed(1)} L ${xs[0].toFixed(1)},${(PAD_T + PLOT_H).toFixed(1)} Z`
      : "";

  /** Nearest day to the pointer, in chart coordinates (mouse or touch). */
  const dayAt = (clientX: number): number | null => {
    const el = svgRef.current;
    if (!el || points.length === 0) return null;
    const rect = el.getBoundingClientRect();
    if (!rect.width) return null;
    if (points.length === 1) return 0;
    const x = ((clientX - rect.left) / rect.width) * W;
    const step = PLOT_W / (points.length - 1);
    return Math.min(
      points.length - 1,
      Math.max(0, Math.round((x - PAD_L) / step))
    );
  };

  const active = hover !== null && points[hover] ? hover : null;
  const activeX = active === null ? 0 : xs[active];

  // Evenly spaced day labels, always including the first and last day.
  const labelCount = Math.min(6, points.length);
  const labelIdx = new Set<number>();
  for (let k = 0; k < labelCount; k += 1) {
    labelIdx.add(
      Math.round((k * (points.length - 1)) / Math.max(labelCount - 1, 1))
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
          <Activity size={16} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-extrabold">Speed &amp; accuracy curve</p>
          <p className="text-[11px] text-muted">
            {rangeLabel} · daily average of your runs
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-4 rounded-full bg-accent" /> WPM
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-4 rounded-full bg-amber-500" /> Accuracy
          </span>
        </div>
      </div>

      {isLoading ? (
        <div
          aria-hidden
          className="mt-4 h-[220px] animate-pulse rounded-xl bg-inset"
        />
      ) : isError ? (
        <div className="mt-4 grid h-[220px] place-items-center rounded-xl border border-dashed border-line px-6 text-center">
          <div>
            <p className="text-sm font-bold">Could not load your curve</p>
            <p className="mt-1 text-xs text-muted">
              The progress service did not answer — try again.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-chip"
            >
              <RotateCw size={13} aria-hidden /> Retry
            </button>
          </div>
        </div>
      ) : points.length === 0 ? (
        <div className="mt-4 grid h-[220px] place-items-center rounded-xl border border-dashed border-line px-6 text-center">
          <p className="max-w-[280px] text-[12px] leading-5 text-muted">
            Nothing typed in this window yet. Finish a practice run and your
            daily curve starts here.
          </p>
        </div>
      ) : (
        <div className="relative mt-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full touch-pan-y"
            role="img"
            aria-label={`Progress curve over ${rangeLabel}: ${points.length} active ${
              points.length === 1 ? "day" : "days"
            }, ${model.totalRuns} ${model.totalRuns === 1 ? "run" : "runs"}`}
            onPointerMove={(e) => setHover(dayAt(e.clientX))}
            onPointerDown={(e) => setHover(dayAt(e.clientX))}
            onPointerLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id="progress-wpm-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {wpmTicks.map((t) => (
              <g key={`g${t}`}>
                <line
                  x1={PAD_L}
                  x2={W - PAD_R}
                  y1={yAt(t, wpmMax)}
                  y2={yAt(t, wpmMax)}
                  stroke="var(--line)"
                  strokeWidth="1"
                />
                <text
                  x={PAD_L - 6}
                  y={yAt(t, wpmMax) + 3}
                  fontSize="9"
                  textAnchor="end"
                  fill="var(--faint)"
                  className="tabular-nums"
                >
                  {t}
                </text>
              </g>
            ))}

            {accTicks.map((t) => (
              <text
                key={`a${t}`}
                x={W - PAD_R + 6}
                y={accY(t) + 3}
                fontSize="9"
                fill="var(--faint)"
                className="tabular-nums"
              >
                {t}%
              </text>
            ))}

            {areaPath && <path d={areaPath} fill="url(#progress-wpm-fill)" />}

            {accPath && (
              <path
                d={accPath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="5 4"
              />
            )}

            {wpmPath && (
              <path
                d={wpmPath}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {points.map((p, i) => (
              <circle
                key={`w${p.day}`}
                cx={xs[i]}
                cy={yAt(p.avgWpm, wpmMax)}
                r={active === i ? 4.5 : 2.6}
                fill="var(--accent)"
                stroke={active === i ? "var(--card)" : "none"}
                strokeWidth={active === i ? 1.5 : 0}
              >
                <title>{`${shortDay(p.day)} · ${p.avgWpm} WPM · ${p.avgAccuracy}% · ${p.sessions} ${
                  p.sessions === 1 ? "run" : "runs"
                }`}</title>
              </circle>
            ))}

            {active !== null && (
              <line
                x1={activeX}
                x2={activeX}
                y1={PAD_T - 6}
                y2={PAD_T + PLOT_H + 4}
                stroke="var(--faint)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            )}

            {/* Run volume per day — the bars under the curve. */}
            <g>
              {points.map((p, i) => {
                const barW = Math.max(3, Math.min(14, PLOT_W / points.length - 4));
                const h = (p.sessions / maxSessions) * VOL_H;
                return (
                  <rect
                    key={`v${p.day}`}
                    x={xs[i] - barW / 2}
                    y={PAD_T + PLOT_H + 8 + (VOL_H - h)}
                    width={barW}
                    height={Math.max(h, p.sessions > 0 ? 2 : 0)}
                    rx={2}
                    fill={active === i ? "var(--accent)" : "var(--chip)"}
                    opacity={active === i ? 0.9 : 0.75}
                  >
                    <title>{`${shortDay(p.day)} · ${p.sessions} ${
                      p.sessions === 1 ? "run" : "runs"
                    }`}</title>
                  </rect>
                );
              })}
            </g>

            {points.map((p, i) => {
              if (!labelIdx.has(i)) return null;
              const last = i === points.length - 1;
              return (
                <text
                  key={`l${p.day}`}
                  x={xs[i]}
                  y={H - 8}
                  fontSize="9"
                  fill="var(--faint)"
                  textAnchor={
                    i === 0 ? "start" : last ? "end" : "middle"
                  }
                >
                  {shortDay(p.day)}
                </text>
              );
            })}
          </svg>

          {active !== null && (
            <div
              role="status"
              className="pointer-events-none absolute top-1 z-10 w-max rounded-xl border border-line bg-card px-3 py-2 text-[11px] shadow-lg"
              style={{
                left: `${Math.min(80, Math.max(20, (activeX / W) * 100))}%`,
                transform: "translateX(-50%)",
              }}
            >
              <p className="font-extrabold text-ink">
                {shortDay(points[active].day)}
              </p>
              <p className="mt-1 flex items-center gap-1.5 tabular-nums text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {points[active].avgWpm} WPM avg
              </p>
              <p className="flex items-center gap-1.5 tabular-nums text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {points[active].avgAccuracy}% accuracy
              </p>
              <p className="tabular-nums text-faint">
                {points[active].sessions}{" "}
                {points[active].sessions === 1 ? "run" : "runs"} · best{" "}
                {points[active].maxWpm} WPM
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
