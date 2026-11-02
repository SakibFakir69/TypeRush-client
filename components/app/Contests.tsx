"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Timer, Trophy } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { DASH } from "@/lib/dashboard";
import {
  contestExcerpt,
  contestStatus,
  formatContestDate,
  formatContestTime,
  statusLabel,
  statusStyle,
  useGetContestsQuery,
} from "@/lib/features/contest/features.contest";

/**
 * Dashboard contest panel — driven by the real contest API.
 *
 * The featured slot is the contest that is running right now, or the one
 * that starts soonest; the list holds the next few upcoming races.
 */
export function UpcomingContests() {
  const { data, isLoading } = useGetContestsQuery();
  const contests = data ?? [];

  const live = contests.find((c) => contestStatus(c.condition) === "RUNNING");
  const upcoming = contests
    .filter((c) => contestStatus(c.condition) === "UPCOMING")
    .sort(
      (a, b) =>
        new Date(a.contestDate).getTime() - new Date(b.contestDate).getTime()
    );

  const featured = live ?? upcoming[0] ?? null;
  const rest = upcoming.filter((c) => c.id !== featured?.id).slice(0, 3);

  // Keep the activity chips, but never claim a contest that isn't there.
  const chips = [
    ...DASH.recentChips
      .filter((c) => c.title !== "Joined Contest")
      .slice(0, 3),
    ...(featured
      ? [{ icon: "trophy", title: "Next Contest", desc: featured.name }]
      : []),
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/15 text-amber-500">
          <Trophy size={15} aria-hidden />
        </span>
        <p className="text-sm font-extrabold">Upcoming Contests</p>
        <Link
          href="/contests"
          className="ml-auto text-xs font-semibold text-accent hover:underline"
        >
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div aria-hidden className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
          <div className="h-40 animate-pulse rounded-xl border border-line bg-inset" />
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[52px] animate-pulse rounded-xl border border-line bg-inset"
              />
            ))}
          </div>
        </div>
      ) : !featured ? (
        <div className="mt-3 rounded-xl border border-line bg-inset p-4 text-center">
          <p className="text-[13px] font-bold">No contests scheduled yet</p>
          <p className="mt-1 text-[12px] text-muted">
            The next race hasn&apos;t been announced — keep training.
          </p>
          <Link
            href="/contests"
            className="mt-3 inline-block rounded-lg border border-line px-3 py-1.5 text-xs font-bold transition hover:bg-chip"
          >
            Browse contests →
          </Link>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-violet-500/30 bg-gradient-to-b from-violet-500/10 to-transparent p-4">
            <p className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-extrabold text-accent">
              {live ? (
                <>
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
                  Live
                </>
              ) : (
                statusLabel(featured.condition)
              )}
            </p>
            <p className="mt-2 line-clamp-2 text-[15px] font-extrabold">
              {featured.name}
            </p>
            <p className="line-clamp-2 text-xs text-muted">
              {contestExcerpt(featured.content, 80)}
            </p>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={12} aria-hidden />
                {formatContestDate(featured.contestDate)}
              </span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Timer size={12} aria-hidden />
                {formatContestTime(featured.time)}
              </span>
            </p>
            <Link
              href={`/contests/${featured.id}`}
              className="mt-3 block rounded-lg bg-mint px-4 py-2 text-center text-sm font-bold text-black transition hover:brightness-110"
            >
              Join Contest →
            </Link>
          </div>

          <ul className="space-y-2">
            {rest.length === 0 ? (
              <li className="rounded-xl border border-line bg-inset p-3 text-[12px] text-muted">
                More races are being scheduled.
              </li>
            ) : (
              rest.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-2.5 rounded-xl border border-line bg-inset p-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold">
                      {c.name}
                    </span>
                    <span className="block text-[11px] text-muted">
                      {formatContestDate(c.contestDate)}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusStyle(c.condition)}`}
                  >
                    {statusLabel(c.condition)}
                  </span>
                  <Link
                    href={`/contests/${c.id}`}
                    className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-bold transition hover:border-accent/50 hover:text-accent"
                  >
                    Join
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-inset p-3 text-[13px] font-bold">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/10 text-accent">
          <ArrowRight size={14} aria-hidden />
        </span>
        Your Recent Activity
        <Link
          href="/progress"
          className="ml-auto text-xs font-semibold text-accent hover:underline"
        >
          View all →
        </Link>
      </div>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {chips.map((c) => (
          <li key={c.title} className="rounded-xl border border-line bg-inset p-3">
            <p className="text-[13px] font-bold">{c.title}</p>
            <p className="mt-0.5 text-[11px] leading-4 text-muted">{c.desc}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
