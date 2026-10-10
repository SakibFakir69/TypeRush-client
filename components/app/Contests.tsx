import Link from "next/link";
import { ArrowRight, CalendarDays, Trophy, Users } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { DASH } from "@/lib/dashboard";

export function UpcomingContests() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/15 text-amber-500">
          <Trophy size={15} aria-hidden />
        </span>
        <p className="text-sm font-extrabold">Upcoming Contests</p>
        <Link href="/contests" className="ml-auto text-xs font-semibold text-accent hover:underline">
          View all →
        </Link>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border border-violet-500/30 bg-gradient-to-b from-violet-500/10 to-transparent p-4">
          <p className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-extrabold text-accent">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" /> Live
          </p>
          <p className="mt-2 text-[15px] font-extrabold">Weekly Typing Showdown</p>
          <p className="text-xs text-muted">Type faster. Climb the leaderboard.</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={12} aria-hidden /> Oct 10 – Oct 16
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={12} aria-hidden /> 523 participants
            </span>
          </p>
          <Link
            href="/contests"
            className="mt-3 block rounded-lg bg-mint px-4 py-2 text-center text-sm font-bold text-black transition hover:brightness-110"
          >
            Join Contest →
          </Link>
        </div>
        <ul className="space-y-2">
          {DASH.contests.map((c) => (
            <li
              key={c.name}
              className="flex items-center gap-2.5 rounded-xl border border-line bg-inset p-3"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold">{c.name}</span>
                <span className="block text-[11px] text-muted">{c.dates}</span>
              </span>
              <Link
                href="/contests"
                className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-bold transition hover:border-accent/50 hover:text-accent"
              >
                Join
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-inset p-3 text-[13px] font-bold">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/10 text-accent">
          <ArrowRight size={14} aria-hidden />
        </span>
        Your Recent Activity
        <Link href="/progress" className="ml-auto text-xs font-semibold text-accent hover:underline">
          View all →
        </Link>
      </div>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {DASH.recentChips.map((c) => (
          <li key={c.title} className="rounded-xl border border-line bg-inset p-3">
            <p className="text-[13px] font-bold">{c.title}</p>
            <p className="mt-0.5 text-[11px] leading-4 text-muted">{c.desc}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
