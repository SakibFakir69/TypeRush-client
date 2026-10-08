"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

type Racer = {
  name: string;
  wpm: number;
  img: number;
};

const TABS: Record<string, Racer[]> = {
  Today: [
    { name: "TypeNinja", wpm: 171, img: 22 },
    { name: "SpeedMaster", wpm: 169, img: 8 },
    { name: "SwiftTyper", wpm: 132, img: 60 },
    { name: "Sakib", wpm: 121, img: 45 },
    { name: "KeyBlazer", wpm: 119, img: 36 },
  ],
  "This Week": [
    { name: "SpeedMaster", wpm: 167, img: 8 },
    { name: "TypeNinja", wpm: 156, img: 22 },
    { name: "KeyBlazer", wpm: 148, img: 36 },
    { name: "Sakib", wpm: 123, img: 45 },
    { name: "SwiftTyper", wpm: 118, img: 60 },
  ],
  "This Month": [
    { name: "SpeedMaster", wpm: 172, img: 8 },
    { name: "KeyBlazer", wpm: 161, img: 36 },
    { name: "TypeNinja", wpm: 158, img: 22 },
    { name: "SwiftTyper", wpm: 129, img: 60 },
    { name: "Sakib", wpm: 124, img: 45 },
  ],
  "All Time": [
    { name: "SpeedMaster", wpm: 189, img: 8 },
    { name: "TypeNinja", wpm: 181, img: 22 },
    { name: "KeyBlazer", wpm: 174, img: 36 },
    { name: "Sakib", wpm: 141, img: 45 },
    { name: "SwiftTyper", wpm: 136, img: 60 },
  ],
};

const TAB_NAMES = Object.keys(TABS);

/** Shortcut key per tab (T is taken by the theme toggle, so Today gets D). */
const TAB_KEYS: Record<string, string> = {
  Today: "D",
  "This Week": "W",
  "This Month": "M",
  "All Time": "A",
};

export const LEADERBOARD_TAB_EVENT = "leaderboard-tab";

const MEDALS = [
  "border-amber-500/50 bg-amber-500/10 text-amber-500",
  "border-sky-500/50 bg-sky-500/10 text-sky-500",
  "border-orange-500/50 bg-orange-500/10 text-orange-500",
];

/** Faint keys drifting behind the board (positions in % of the card). */
const BG_KEYS = [
  { l: 3, t: 8, s: 26, r: -8, legend: "R", dur: 3.4, delay: -1.2, lift: 8 },
  { l: 92, t: 12, s: 30, r: 7, legend: "A", dur: 4.1, delay: -2.6, lift: 10 },
  { l: 5, t: 76, s: 24, r: 6, legend: "N", dur: 3.0, delay: -0.6, lift: 7 },
  { l: 90, t: 72, s: 28, r: -7, legend: "K", dur: 4.4, delay: -3.1, lift: 9 },
  { l: 40, t: 3, s: 22, r: 5, legend: "T", dur: 3.8, delay: -1.9, lift: 7 },
  { l: 63, t: 93, s: 24, r: -6, legend: "O", dur: 3.2, delay: -0.3, lift: 8 },
  { l: 20, t: 91, s: 20, r: 8, legend: "P", dur: 4.0, delay: -2.2, lift: 6 },
  { l: 79, t: 89, s: 22, r: -5, legend: "★", dur: 3.6, delay: -1.5, lift: 9 },
  { l: 15, t: 40, s: 24, r: -6, legend: "2", dur: 3.1, delay: -2.8, lift: 8 },
  { l: 85, t: 42, s: 26, r: 5, legend: "0", dur: 4.2, delay: -0.9, lift: 7 },
  { l: 50, t: 94, s: 22, r: -4, legend: "W", dur: 3.9, delay: -1.1, lift: 8 },
  { l: 30, t: 5, s: 20, r: 6, legend: "M", dur: 3.3, delay: -2.0, lift: 6 },
];

export function LeaderboardSection() {
  const [tab, setTab] = useState("This Week");
  const rows = TABS[tab];
  const top = rows[0].wpm;

  // Navbar shortcut keys (D/W/M/A) switch tabs via this event.
  useEffect(() => {
    const onTab = (e: Event) => {
      const name = (e as CustomEvent<string>).detail;
      if (name && TABS[name]) setTab(name);
    };
    window.addEventListener(LEADERBOARD_TAB_EVENT, onTab);
    return () => window.removeEventListener(LEADERBOARD_TAB_EVENT, onTab);
  }, []);

  return (
    <section id="leaderboard" className="scroll-mt-20">
      <Card className="relative overflow-hidden p-5 sm:p-8">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {BG_KEYS.map((k, i) => (
            <span
              key={i}
              aria-hidden
              className="kb-key-soft"
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
          Top <span className="text-accent">Typists</span>
        </h2>
        <p className="mt-1.5 text-center text-[13px] text-muted">
          Every test is another step toward the top.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          {TAB_NAMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              title={`${t} (press ${TAB_KEYS[t]})`}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs transition",
                tab === t
                  ? "bg-chip font-bold text-ink"
                  : "text-muted hover:text-ink"
              )}
            >
              {t}
              <kbd
                aria-hidden
                className="ml-1.5 rounded border border-line bg-inset px-1 text-[10px] tabular-nums text-faint"
              >
                {TAB_KEYS[t]}
              </kbd>
            </button>
          ))}
          <span className="ml-1 hidden items-center gap-1.5 text-[11px] text-faint md:inline-flex">
            jump here
            <button
              type="button"
              title="Jump to leaderboard (R)"
              onClick={() =>
                document
                  .getElementById("leaderboard")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="grid h-7 min-w-7 place-items-center rounded-lg border border-line bg-inset px-1.5 text-xs font-black text-muted shadow-[0_2px_0_rgba(0,0,0,0.25)] transition hover:text-ink active:translate-y-px active:shadow-none"
            >
              R
            </button>
          </span>
        </div>

        <motion.ul
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mx-auto mt-5 max-w-2xl space-y-2"
        >
          {rows.map((r, i) => (
            <li
              key={r.name}
              className="flex items-center gap-3 rounded-xl border border-transparent bg-inset px-3.5 py-2.5 transition hover:border-line"
            >
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-sm font-black tabular-nums shadow-[0_2px_0_rgba(0,0,0,0.25)]",
                  MEDALS[i] ?? "border-line bg-inset text-muted"
                )}
              >
                {i + 1}
              </span>
              <Image
                src={`https://i.pravatar.cc/56?img=${r.img}`}
                alt={r.name}
                width={28}
                height={28}
                className="h-7 w-7 shrink-0 rounded-full border border-line object-cover"
              />
              <span className="truncate text-sm font-medium">{r.name}</span>
              <span className="ml-auto w-24 shrink-0 text-right">
                <span className="block font-mono text-sm font-extrabold tabular-nums text-accent">
                  {r.wpm} <span className="text-[10px] font-bold">WPM</span>
                </span>
                <span
                  aria-hidden
                  className="mt-1 block h-1 overflow-hidden rounded-full bg-chip"
                >
                  <span
                    className="block h-full rounded-full bg-accent/50"
                    style={{ width: `${Math.round((r.wpm / top) * 100)}%` }}
                  />
                </span>
              </span>
            </li>
          ))}
        </motion.ul>

        <p className="mt-4 text-center text-xs font-semibold text-accent">
          View Full Leaderboard →
        </p>
        </div>
      </Card>
    </section>
  );
}
