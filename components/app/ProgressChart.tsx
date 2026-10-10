"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { CHART } from "@/lib/dashboard";
import { cn } from "@/lib/cn";

const W = 400;
const H = 150;
const PAD = 28;
const MAX = 180;

function points(values: number[]): string {
  return values
    .map((v, i) => {
      const x = PAD + (i * (W - PAD * 2)) / (values.length - 1);
      const y = H - PAD - (v / MAX) * (H - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

const RANGES = Object.keys(CHART);

export function ProgressChart() {
  const [range, setRange] = useState("7D");
  const set = CHART[range];

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
      <p className="mt-2 flex gap-4 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> WPM
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> Accuracy
        </span>
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full" role="img" aria-label={`Typing progress, ${range}`}>
        {[0, 60, 120, 180].map((g) => {
          const y = H - PAD - (g / MAX) * (H - PAD * 2);
          return (
            <g key={g}>
              <line x1={PAD} x2={W - 8} y1={y} y2={y} stroke="var(--line)" strokeWidth="1" />
              <text x={2} y={y + 3} fontSize="8" fill="var(--faint)" className="tabular-nums">
                {g}
              </text>
            </g>
          );
        })}
        <polyline points={points(set.wpm)} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
        <polyline points={points(set.acc)} fill="none" stroke="#a855f7" strokeWidth="2" strokeLinejoin="round" />
        {points(set.wpm)
          .split(" ")
          .map((pt, i) => {
            const [x, y] = pt.split(",");
            return <circle key={`w${i}`} cx={x} cy={y} r="2.6" fill="var(--accent)" />;
          })}
        {set.labels.map((d, i) => {
          const x = PAD + (i * (W - PAD * 2)) / (set.labels.length - 1);
          return (
            <text key={d} x={x} y={H - 8} fontSize="8" fill="var(--faint)" textAnchor="middle">
              {d}
            </text>
          );
        })}
      </svg>
    </Card>
  );
}
