import Link from "next/link";
import type { CSSProperties } from "react";
import {
  Award,
  Clock,
  Crosshair,
  Flame,
  Gauge,
  Hash,
  Target,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/primitives";

const STATS = [
  { Icon: Gauge, label: "Best WPM", value: "123" },
  { Icon: Hash, label: "Tests Taken", value: "56" },
  { Icon: Crosshair, label: "Accuracy", value: "96%" },
  { Icon: Clock, label: "Time Typed", value: "3h 24m" },
  { Icon: Flame, label: "Streak", value: "7 days" },
] as const;

const ACHIEVEMENTS = [
  { Icon: Target, title: "Speed Demon", desc: "Achieved 100 WPM", when: "2d ago" },
  { Icon: Zap, title: "Week Warrior", desc: "7-day streak", when: "5d ago" },
  { Icon: Award, title: "Accuracy Master", desc: "98%+ accuracy", when: "1w ago" },
] as const;

/** Faint keys drifting behind the card (positions in % of the card). */
const BG_KEYS = [
  { l: 3, t: 6, s: 26, r: -7, legend: "P", dur: 3.5, delay: -1.1, lift: 8 },
  { l: 91, t: 9, s: 28, r: 6, legend: "R", dur: 4.2, delay: -2.4, lift: 9 },
  { l: 6, t: 46, s: 24, r: 5, legend: "O", dur: 3.1, delay: -0.7, lift: 7 },
  { l: 92, t: 48, s: 26, r: -6, legend: "G", dur: 4.0, delay: -3.0, lift: 8 },
  { l: 4, t: 84, s: 24, r: 7, legend: "R", dur: 3.3, delay: -1.8, lift: 7 },
  { l: 90, t: 85, s: 26, r: -8, legend: "E", dur: 4.3, delay: -0.5, lift: 9 },
  { l: 24, t: 4, s: 20, r: 4, legend: "S", dur: 3.7, delay: -2.1, lift: 6 },
  { l: 70, t: 3, s: 22, r: -4, legend: "S", dur: 3.0, delay: -1.4, lift: 7 },
  { l: 12, t: 93, s: 22, r: 6, legend: "1", dur: 4.1, delay: -2.7, lift: 8 },
  { l: 48, t: 94, s: 20, r: -5, legend: "2", dur: 3.4, delay: -0.9, lift: 6 },
  { l: 82, t: 93, s: 22, r: 5, legend: "3", dur: 3.9, delay: -1.6, lift: 8 },
  { l: 55, t: 5, s: 20, r: -6, legend: "★", dur: 3.2, delay: -2.3, lift: 7 },
  { l: 33, t: 92, s: 20, r: 7, legend: "✓", dur: 4.4, delay: -0.2, lift: 6 },
  { l: 66, t: 91, s: 22, r: -7, legend: "↗", dur: 3.6, delay: -3.2, lift: 8 },
];

export function ProgressSection() {
  return (
    <section id="progress" className="scroll-mt-20">
      <Card className="relative overflow-hidden p-5 sm:p-8">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {BG_KEYS.map((k, i) => (
            <span
              key={i}
              aria-hidden
              className="kb-key-soft kb-key-dim"
              style={
                {
                  left: `${k.l}%`,
                  top: `${k.t}%`,
                  width: k.s,
                  height: k.s,
                  transform: `rotate(${k.r}deg)`,
                  "--kb-dur": `${k.dur}s`,
                  "--kb-delay": `${k.delay}s`,
                  "--kb-lift": `${k.lift}px`,
                } as CSSProperties
              }
            >
              <span className="text-[10px] font-bold leading-none text-muted">
                {k.legend}
              </span>
            </span>
          ))}
        </div>
        <div className="relative">
        <h2 className="text-center text-2xl font-black tracking-tight sm:text-3xl">
          Track your <span className="text-accent">progress</span>
        </h2>
        <p className="mt-1.5 text-center text-[13px] text-muted">
          Detailed insights to help you improve every day.
        </p>

        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map(({ Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-line bg-inset p-3 text-center"
            >
              <span className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-accent/10 text-accent">
                <Icon size={16} strokeWidth={2.2} aria-hidden />
              </span>
              <p className="mt-1.5 text-sm font-extrabold tabular-nums">{value}</p>
              <p className="mt-0.5 text-[10px] text-muted">{label}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-3 grid max-w-3xl gap-3 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-xl border border-line bg-inset p-4">
            <p className="text-[11px] font-bold text-muted">
              WPM LAST 6 WEEKS
            </p>
            <svg viewBox="0 0 400 90" className="mt-2 h-24 w-full" aria-hidden>
              <polyline
                points="0,75 30,68 60,60 90,62 120,50 150,45 180,48 210,38 240,35 270,30 300,28 330,20 360,18 400,12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-accent"
              />
              {[[210, 38], [330, 20], [400, 12]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="3.5" className="fill-accent" />
              ))}
            </svg>
            <div className="flex justify-between text-[10px] tabular-nums text-faint">
              <span>May 10</span>
              <span>May 24</span>
              <span>Jun 7</span>
              <span>Jun 21</span>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-inset p-4">
            <p className="text-[11px] font-bold text-muted">ACHIEVEMENTS</p>
            <ul className="mt-2.5 space-y-2">
              {ACHIEVEMENTS.map(({ Icon, title, desc, when }) => (
                <li key={title} className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-600">
                    <Icon size={15} strokeWidth={2.2} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold">{title}</p>
                    <p className="text-[11px] text-muted">{desc}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-[10px] text-faint">
                    {when}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/test"
            className="inline-block rounded-lg bg-mint px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
          >
            View Dashboard →
          </Link>
          <p className="mt-2.5 text-[11px] text-faint">
            or press{" "}
            <kbd className="rounded border border-line bg-chip px-1 font-bold tabular-nums text-muted">
              P
            </kbd>{" "}
            to jump here
          </p>
        </div>
        </div>
      </Card>
    </section>
  );
}
