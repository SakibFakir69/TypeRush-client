"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  CalendarDays,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { getApiError } from "@/helper/error-helper";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import {
  contestExcerpt,
  contestStatus,
  formatContestDate,
  formatContestTime,
  statusLabel,
  statusStyle,
  useGetContestsQuery,
  useJoinContestMutation,
  type Contest,
} from "@/lib/features/contest/features.contest";

type Filter = "ALL" | "UPCOMING" | "RUNNING" | "FINISHED";

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

function ContestCard({ contest }: { contest: Contest }) {
  const [join, { isLoading }] = useJoinContestMutation();
  const status = contestStatus(contest.condition);

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
            statusStyle(contest.condition)
          )}
        >
          <Trophy size={16} aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-extrabold">{contest.name}</h3>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                statusStyle(contest.condition)
              )}
            >
              {statusLabel(contest.condition)}
            </span>
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
            {contest.participants && (
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Users size={12} aria-hidden />
                {contest.participants.length} joined
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
          Open <ArrowRight size={13} aria-hidden />
        </Link>
        {status !== "FINISHED" && (
          <button
            type="button"
            onClick={onJoin}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-3 py-1.5 text-[13px] font-bold text-black transition hover:brightness-110 disabled:opacity-60"
          >
            {isLoading ? "Joining…" : "Join contest"}
          </button>
        )}
      </div>
    </li>
  );
}

export function ContestBoard() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useGetContestsQuery();
  const [filter, setFilter] = useState<Filter>("ALL");

  const contests = useMemo(() => data ?? [], [data]);

  const counts = useMemo(() => {
    const base: Record<Filter, number> = {
      ALL: contests.length,
      UPCOMING: 0,
      RUNNING: 0,
      FINISHED: 0,
    };
    for (const c of contests) base[contestStatus(c.condition)] += 1;
    return base;
  }, [contests]);

  const visible = useMemo(
    () =>
      contests
        .filter((c) => filter === "ALL" || contestStatus(c.condition) === filter)
        .sort(
          (a, b) =>
            new Date(b.contestDate).getTime() - new Date(a.contestDate).getTime()
        ),
    [contests, filter]
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

      {!user && (
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
      ) : (
        <ul className="space-y-2">
          {visible.map((c) => (
            <ContestCard key={c.id} contest={c} />
          ))}
        </ul>
      )}
    </div>
  );
}
