"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { Swords, Timer } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

type Lane = {
  name: string;
  wpm: string;
  acc: string;
  img: number;
  side: "left" | "right";
  bar: string;
  wpmCls: string;
  from: string;
  to: string;
  dur: string;
};

const LANES: Lane[] = [
  {
    name: "Sakib",
    wpm: "124 WPM",
    acc: "98% acc",
    img: 11,
    side: "left",
    bar: "bg-accent",
    wpmCls: "text-accent",
    from: "64%",
    to: "76%",
    dur: "3.2s",
  },
  {
    name: "Alex",
    wpm: "119 WPM",
    acc: "96% acc",
    img: 53,
    side: "right",
    bar: "bg-violet-500",
    wpmCls: "text-violet-500",
    from: "58%",
    to: "70%",
    dur: "3.9s",
  },
];

function LaneRow({ lane }: { lane: Lane }) {
  const mirrored = lane.side === "right";
  return (
    <div className={cn("flex items-center gap-3", mirrored && "flex-row-reverse")}>
      <Image
        src={`https://i.pravatar.cc/88?img=${lane.img}`}
        alt={lane.name}
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 rounded-full border-2 border-line object-cover"
      />
      <div className={cn("w-24 shrink-0 sm:w-28", mirrored && "text-right")}>
        <p className="truncate text-sm font-bold">{lane.name}</p>
        <p className={cn("font-mono text-sm font-extrabold tabular-nums", lane.wpmCls)}>
          {lane.wpm}
        </p>
      </div>
      <div className="relative h-3.5 min-w-0 flex-1 overflow-hidden rounded-full bg-chip">
        <span
          aria-hidden
          className={cn(
            "lane-fill absolute inset-y-0 rounded-full",
            lane.bar,
            mirrored ? "right-0" : "left-0"
          )}
          style={
            {
              "--from": lane.from,
              "--to": lane.to,
              animationDuration: lane.dur,
            } as CSSProperties
          }
        >
          <span
            aria-hidden
            className={cn(
              "absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white/90",
              mirrored ? "left-1" : "right-1"
            )}
          />
        </span>
      </div>
      <span className="hidden w-20 shrink-0 text-[11px] tabular-nums text-muted min-[420px]:block">
        {lane.acc}
      </span>
    </div>
  );
}

export function BattleSection() {
  // Live round countdown: 24s → 0, then the next round starts.
  const [seconds, setSeconds] = useState(24);

  useEffect(() => {
    const t = setTimeout(() => {
      setSeconds((s) => (s <= 0 ? 24 : s - 1));
    }, 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <section id="challenges" className="scroll-mt-20">
      <Card className="relative overflow-hidden p-5 sm:p-8">
        {/* Centered header: everything about this battle in one place */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-accent">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
            LIVE
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-inset px-2.5 py-1 tabular-nums text-muted">
            <Timer size={12} aria-hidden /> 00:
            {String(seconds).padStart(2, "0")}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <Swords size={20} strokeWidth={2.2} aria-hidden />
          </span>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            1V1 <span className="text-accent">TYPING BATTLES</span>
          </h2>
        </div>
        <p className="mt-2 text-center text-[13px] text-muted">
          Real-time battles. Real challengers. Real fun. First to the finish
          line wins · Round 2 of 3.
        </p>

        {/* Single arena: two lanes racing at one VS medallion */}
        <div className="relative mt-6">
          <span
            aria-hidden
            className="absolute inset-y-1 left-1/2 hidden w-px -translate-x-1/2 bg-line sm:block"
          />
          <div className="space-y-4">
            {LANES.map((lane) => (
              <LaneRow key={lane.name} lane={lane} />
            ))}
          </div>
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 text-lg font-black tracking-[0.35em] text-ink drop-shadow-[0_0_14px_rgba(46,242,200,0.65)] sm:block"
          >
            VS
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-4 text-[11px] text-faint">
          <p>
            Winner takes <span className="font-bold text-accent">+50 rating</span>
          </p>
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/test"
            title="Find an Opponent (press B)"
            className="inline-block rounded-lg bg-mint px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
          >
            Find an Opponent
            <kbd
              aria-hidden
              className="ml-1.5 rounded border border-black/20 bg-black/10 px-1 text-[10px] tabular-nums text-black/60"
            >
              B
            </kbd>{" "}
            →
          </Link>
        </div>
      </Card>
    </section>
  );
}
