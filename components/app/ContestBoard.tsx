"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { getApiError } from "@/helper/error-helper";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { useNow } from "@/hooks/useNow";
import {
  contestExcerpt,
  contestStatus,
  contestTiming,
  formatContestDate,
  formatContestTime,
  formatCountdown,
  statusLabel,
  statusStyle,
  useGetAllContestLeaderboardsQuery,
  useGetContestsQuery,
  useJoinContestMutation,
  type Contest,
  type ContestCondition,
  type ContestLeaderboardRow,
} from "@/lib/features/contest/features.contest";

type Filter = "ALL" | "UPCOMING" | "RUNNING" | "FINISHED";
type View = "CONTESTS" | "LEADERBOARDS";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "UPCOMING", label: "Upcoming" },
  { id: "RUNNING", label: "Live" },
  { id: "FINISHED", label: "Finished" },
];

function isConflict(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "status" in error &&
    (error as { status?: unknown }).status === 409
  );
}

/** Sort weight: live races, then upcoming, then finished. */
const PHASE_ORDER: Record<ContestCondition, number> = {
  RUNNING: 0,
  UPCOMING: 1,
  FINISHED: 2,
};

function ContestCard({
  contest,
  board,
  now,
}: {
  contest: Contest;
  board: ContestLeaderboardRow[] | undefined;
  now: number;
}) {
  const { user } = useAuth();
  const [join, { isLoading }] = useJoinContestMutation();
  const phase = contestStatus(contest, now);
  const timing = contestTiming(contest, now);

  const myId = typeof user?.id === "string" ? user.id : "";
  const joined =
    myId !== "" &&
    (contest.participants ?? []).some((p) => p.userId === myId);

  // The clock is the source of truth: a race that started 5 seconds ago is
  // live even if nobody flipped the stored condition yet.
  const countdown =
    phase === "UPCOMING"
      ? `Starts in ${formatCountdown(timing.startsInMs)}`
      : phase === "RUNNING"
        ? `Ends in ${formatCountdown(timing.endsInMs)}`
        : timing.endsAt
          ? `Ended ${formatCountdown(now - timing.endsAt)} ago`
          : "Finished";

  const onJoin = async () => {
    try {
      await join(contest.id).unwrap();
      toast.success(`Joined ${contest.name}. See you at the start line.`);
    } catch (e) {
      if (isConflict(e)) {
        toast.message("You're already in this contest.");
        return;
      }
      toast.error(getApiError(e));
    }
  };

  return (
    <li className="rounded-xl border border-line bg-inset p-4 transition hover:border-accent/40">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border",
            statusStyle(contest, now)
          )}
        >
          <Trophy size={16} aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-extrabold">{contest.name}</h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                statusStyle(contest, now)
              )}
            >
              {phase === "RUNNING" && (
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
              {statusLabel(contest, now)}
            </span>
            {joined && phase !== "FINISHED" && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                Joined
              </span>
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-muted">
            {contestExcerpt(contest.content)}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-faint">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={12} aria-hidden />
              {formatContestDate(contest.contestDate)}
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Timer size={12} aria-hidden />
              {formatContestTime(contest.time)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 font-bold tabular-nums",
                phase === "RUNNING"
                  ? "text-emerald-500"
                  : phase === "UPCOMING"
                    ? "text-sky-500"
                    : "text-muted"
              )}
            >
              <Clock size={12} aria-hidden />
              {countdown}
            </span>
            {contest.participants && (
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Users size={12} aria-hidden />
                {contest.participants.length} joined
              </span>
            )}
          </div>

          {/* Each contest keeps its own board — the leader here is only
              ranked against people who ran *this* passage. */}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-line bg-card/60 px-2.5 py-1.5 text-[11px]">
            <span className="font-bold text-muted">Board</span>
            {board && board.length > 0 ? (
              <>
                <span className="inline-flex min-w-0 items-center gap-1">
                  <Trophy size={11} className="shrink-0 text-amber-500" aria-hidden />
                  <span className="truncate font-bold">{board[0].name}</span>
                  <span className="font-mono font-bold tabular-nums text-accent">
                    {board[0].wpm} WPM
                  </span>
                </span>
                <span className="text-faint">
                  {board.length} ranked
                </span>
              </>
            ) : (
              <span className="text-faint">
                {phase === "RUNNING"
                  ? "No runs yet — the first submission takes #1"
                  : phase === "UPCOMING"
                    ? "Board opens when the race starts"
                    : "No results — nobody submitted a run"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Link
          href={`/contests/${contest.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[13px] font-bold text-muted transition hover:bg-chip hover:text-ink"
        >
          {phase === "FINISHED" ? "Results" : "Open"}{" "}
          <ArrowRight size={13} aria-hidden />
        </Link>
        {phase !== "FINISHED" &&
          (joined ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[13px] font-bold text-emerald-500">
              ✓ You&apos;re in
            </span>
          ) : (
            <button
              type="button"
              onClick={onJoin}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-3 py-1.5 text-[13px] font-bold text-black transition hover:brightness-110 disabled:opacity-60"
            >
              {isLoading ? "Joining…" : "Join contest"}
            </button>
          ))}
      </div>
    </li>
  );
}

export function ContestBoard() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useGetContestsQuery();
  const boards = useGetAllContestLeaderboardsQuery();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [view, setView] = useState<View>("CONTESTS");
  // Contest phases and countdowns move with the clock, not with a refetch.
  const now = useNow(1000);

  const contests = useMemo(() => data ?? [], [data]);

  // contestId → its own board. Two contests never share rows.
  const boardById = useMemo(() => {
    const map = new Map<string, ContestLeaderboardRow[]>();
    for (const group of boards.data ?? []) {
      map.set(group.contest.id, group.leaderboard);
    }
    return map;
  }, [boards.data]);

  const counts = useMemo(() => {
    const base: Record<Filter, number> = {
      ALL: contests.length,
      UPCOMING: 0,
      RUNNING: 0,
      FINISHED: 0,
    };
    for (const c of contests) base[contestStatus(c, now)] += 1;
    return base;
  }, [contests, now]);

  const visible = useMemo(
    () =>
      contests
        .filter((c) => filter === "ALL" || contestStatus(c, now) === filter)
        .sort((a, b) => {
          const pa = contestStatus(a, now);
          const pb = contestStatus(b, now);
          // Live races first, then the next one up, then past races.
          if (pa !== pb) return PHASE_ORDER[pa] - PHASE_ORDER[pb];
          const ta = new Date(a.contestDate).getTime() || 0;
          const tb = new Date(b.contestDate).getTime() || 0;
          // Upcoming: soonest first. Running/finished: most recent first.
          return pa === "UPCOMING" ? ta - tb : tb - ta;
        }),
    [contests, filter, now]
  );

  if (isLoading) {
    return (
      <div className="space-y-2" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-line bg-card"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <p className="text-base font-extrabold">Couldn&apos;t load contests</p>
        <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted">
          The contest list didn&apos;t come back. Check your connection and try
          again.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg border border-line px-4 py-2 text-sm font-bold transition hover:bg-chip"
        >
          Retry
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-lg bg-inset p-1 text-[12px] font-bold">
        {(
          [
            ["CONTESTS", "Contests"],
            ["LEADERBOARDS", "Leaderboards"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            aria-pressed={view === id}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-center transition",
              view === id ? "bg-mint text-black" : "text-muted hover:text-ink"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-[12px] font-bold transition",
              filter === f.id
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-line text-muted hover:bg-chip hover:text-ink"
            )}
          >
            {f.label}
            <span className="ml-1.5 text-[10px] font-semibold tabular-nums text-faint">
              {counts[f.id]}
            </span>
          </button>
        ))}
      </div>

      {!user && view === "CONTESTS" && (
        <p className="rounded-lg border border-line bg-inset px-3 py-2 text-[12px] text-muted">
          Browsing as a guest — log in to join a contest.
        </p>
      )}

      {visible.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-base font-extrabold">
            {filter === "ALL" ? "No contests yet" : `No ${filter.toLowerCase()} contests`}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted">
            {filter === "ALL"
              ? "The next race hasn't been scheduled. Keep training — it'll show up here."
              : "Try another filter to see the scheduled races."}
          </p>
        </Card>
      ) : view === "LEADERBOARDS" ? (
        <ul className="space-y-2">
          {visible.map((c) => {
            const rows = boardById.get(c.id) ?? [];
            return (
              <li
                key={c.id}
                className="rounded-xl border border-line bg-inset p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-extrabold">{c.name}</h3>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      statusStyle(c, now)
                    )}
                  >
                    {statusLabel(c, now)}
                  </span>
                  <span className="text-[11px] tabular-nums text-faint">
                    {rows.length} ranked
                  </span>
                  <Link
                    href={`/contests/${c.id}`}
                    className="ml-auto text-xs font-semibold text-accent hover:underline"
                  >
                    Open board →
                  </Link>
                </div>

                {boards.isLoading ? (
                  <div aria-hidden className="mt-2 space-y-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-7 animate-pulse rounded-lg bg-card"
                      />
                    ))}
                  </div>
                ) : rows.length === 0 ? (
                  <p className="mt-2 text-[12px] text-muted">
                    {contestStatus(c, now) === "RUNNING"
                      ? "No runs yet — the first submission takes #1."
                      : contestStatus(c, now) === "UPCOMING"
                        ? "The board opens when the race starts."
                        : "Results appear here once the contest has run."}
                  </p>
                ) : (
                  <ol className="mt-2 space-y-1">
                    {rows.slice(0, 5).map((row) => (
                      <li
                        key={`${c.id}-${row.userId || row.rank}`}
                        className="flex items-center gap-2 rounded-lg bg-card px-2.5 py-1.5 text-[12px]"
                      >
                        <span className="w-6 shrink-0 font-mono text-[10px] font-bold tabular-nums text-muted">
                          #{row.rank}
                        </span>
                        <span className="truncate font-medium">{row.name}</span>
                        <span className="ml-auto shrink-0 font-mono text-[11px] font-bold tabular-nums text-accent">
                          {row.wpm} WPM
                        </span>
                        <span className="w-9 shrink-0 text-right font-mono text-[10px] tabular-nums text-faint">
                          {row.accuracy}%
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="space-y-2">
          {visible.map((c) => (
            <ContestCard
              key={c.id}
              contest={c}
              board={boardById.get(c.id)}
              now={now}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
