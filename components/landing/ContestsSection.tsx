"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, Medal, Ticket, Trophy } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

type Contest = {
  duration: [string, string];
  cta: string;
};

const CONTESTS: Record<string, Contest> = {
  Weekly: {
    duration: ["7 Days", "Per round"],
    cta: "Join Weekly Contest",
  },
  Monthly: {
    duration: ["30 Days", "Per season"],
    cta: "Join Monthly Contest",
  },
};

const CONTEST_NAMES = Object.keys(CONTESTS);

/** Shortcut key per tab (W/M are taken by leaderboard periods). */
const CONTEST_KEYS: Record<string, string> = {
  Weekly: "E",
  Monthly: "O",
};

export const CONTEST_TAB_EVENT = "contest-tab";

export function ContestsSection() {
  const [tab, setTab] = useState("Weekly");
  const contest = CONTESTS[tab];

  // Navbar shortcut keys (E/O) switch contests via this event.
  useEffect(() => {
    const onTab = (e: Event) => {
      const name = (e as CustomEvent<string>).detail;
      if (name && CONTESTS[name]) setTab(name);
    };
    window.addEventListener(CONTEST_TAB_EVENT, onTab);
    return () => window.removeEventListener(CONTEST_TAB_EVENT, onTab);
  }, []);

  const steps = [
    { Icon: Ticket, title: "No Entry Fee", desc: "Just type — free forever" },
    { Icon: CalendarDays, title: contest.duration[0], desc: contest.duration[1] },
    { Icon: Medal, title: "Top 100", desc: "Rank up with every test" },
  ];

  return (
    <section id="contests" className="scroll-mt-20">
      <Card className="p-5 sm:p-8">
        <h2 className="text-center text-2xl font-black tracking-tight sm:text-3xl">
          TypeRush <span className="text-accent">Contests</span>
        </h2>
        <p className="mt-1.5 text-center text-[13px] text-muted">
          Compete with typists around the world and climb on points alone —
          no prizes, just rank.
        </p>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          {CONTEST_NAMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              title={`${t} contest (press ${CONTEST_KEYS[t]})`}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs transition",
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
                {CONTEST_KEYS[t]}
              </kbd>
            </button>
          ))}
        </div>

        <div className="mx-auto mt-6 grid max-w-3xl items-center gap-5 sm:grid-cols-[1fr_auto]">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-xl border border-line bg-inset p-4 text-center"
              >
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                  <s.Icon size={18} strokeWidth={2.2} aria-hidden />
                </span>
                <p className="mt-2 text-sm font-extrabold">{s.title}</p>
                {s.desc && <p className="mt-0.5 text-[11px] text-muted">{s.desc}</p>}
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-line bg-card text-accent sm:grid"
                  >
                    <ChevronRight size={13} strokeWidth={2.5} />
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mx-auto grid w-40 place-items-center rounded-2xl border border-accent/25 bg-gradient-to-b from-accent/15 to-transparent p-5 shadow-[0_0_28px_rgba(46,242,200,0.18)]">
            <span className="grid h-20 w-20 place-items-center rounded-2xl bg-accent/15 text-accent">
              <Trophy size={40} strokeWidth={1.8} aria-hidden />
            </span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/test"
            title="Join contest (press C)"
            className="inline-block rounded-lg bg-mint px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
          >
            {contest.cta}
            <kbd
              aria-hidden
              className="ml-1.5 rounded border border-black/20 bg-black/10 px-1 text-[10px] tabular-nums text-black/60"
            >
              C
            </kbd>{" "}
            →
          </Link>
        </div>
      </Card>
    </section>
  );
}
