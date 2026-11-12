"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  History as HistoryIcon,
  RotateCw,
  Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/primitives";
import {
  useGetProgressHistoryQuery,
  type ProgressRun,
} from "@/lib/features/progress/features.progress";
import { cn } from "@/lib/cn";

const PAGE_SIZES = [10, 20, 50] as const;

/** "2026-11-01" → "2026-11-01T00:00:00.000Z" (the server wants ISO). */
function startOfDay(value: string): string {
  return `${value}T00:00:00.000Z`;
}

/** "2026-11-01" → "2026-11-01T23:59:59.999Z". */
function endOfDay(value: string): string {
  return `${value}T23:59:59.999Z`;
}

function formatWhen(value: string): { day: string; time: string } {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { day: "—", time: "" };
  return {
    day: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

/** "45s" — the run length, falling back to the elapsed time. */
function lengthLabel(run: ProgressRun): string {
  const duration = Number(run.duration);
  if (Number.isFinite(duration) && duration > 0) return `${duration}s`;
  const taken = Number(run.timeTaken);
  if (Number.isFinite(taken) && taken > 0) return `${taken}s`;
  return "–";
}

function MiniBar({ value, tone }: { value: number; tone: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <span
      aria-hidden
      className="mt-1 block h-1 w-full max-w-[86px] overflow-hidden rounded-full bg-chip"
    >
      <span
        className={cn("block h-full rounded-full", tone)}
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}

function RunRow({
  run,
  isBest,
}: {
  run: ProgressRun;
  isBest: boolean;
}) {
  const when = formatWhen(run.createdAt);
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-inset px-3 py-2.5">
      <span className="flex w-[132px] shrink-0 items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-chip text-muted">
          <HistoryIcon size={14} aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12px] font-bold text-ink">
            {when.day}
          </span>
          <span className="block text-[10px] tabular-nums text-faint">
            {when.time}
          </span>
        </span>
      </span>

      <span className="w-[86px] shrink-0">
        <span className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-black tabular-nums text-ink">
            {run.wpm}
          </span>
          <span className="text-[10px] font-bold uppercase text-faint">wpm</span>
          {isBest && (
            <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-500">
              <Trophy size={9} aria-hidden /> best
            </span>
          )}
        </span>
        <MiniBar value={(run.wpm / 120) * 100} tone="bg-accent" />
      </span>

      <span className="w-[86px] shrink-0">
        <span className="text-[15px] font-black tabular-nums text-amber-500">
          {run.accuracy}%
        </span>
        <MiniBar value={run.accuracy} tone="bg-amber-500" />
      </span>

      <span className="w-[64px] shrink-0 text-[13px] font-bold tabular-nums text-rose-500">
        {run.errors}
        <span className="ml-1 text-[10px] font-semibold uppercase text-faint">
          err
        </span>
      </span>

      <span className="w-[56px] shrink-0 text-[13px] font-bold tabular-nums text-muted">
        {lengthLabel(run)}
      </span>

      <span className="ml-auto flex items-center gap-2">
        {run.contestId ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-400">
            <Trophy size={10} aria-hidden /> Contest
          </span>
        ) : (
          <span className="rounded-full border border-line bg-chip px-2 py-0.5 text-[10px] font-bold text-muted">
            Practice
          </span>
        )}
      </span>
    </li>
  );
}

export function ProgressHistory() {
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(20);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetProgressHistoryQuery({ page, limit, from, to });

  const runs = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const bestWpm = useMemo(
    () => runs.reduce((max, run) => Math.max(max, run.wpm), 0),
    [runs]
  );
  const filtered = Boolean(from || to);

  /** The server only applies a window when both ends are present. */
  const apply = () => {
    const today = new Date().toISOString().slice(0, 10);
    let nextFrom: string | undefined;
    let nextTo: string | undefined;

    if (draftFrom && draftTo) {
      nextFrom = startOfDay(draftFrom);
      nextTo = endOfDay(draftTo);
    } else if (draftFrom) {
      nextFrom = startOfDay(draftFrom);
      nextTo = endOfDay(today);
    } else if (draftTo) {
      const start = new Date(`${draftTo}T00:00:00.000Z`);
      start.setUTCDate(start.getUTCDate() - 90);
      nextFrom = startOfDay(start.toISOString().slice(0, 10));
      nextTo = endOfDay(draftTo);
    }

    setFrom(nextFrom);
    setTo(nextTo);
    setPage(1);
  };

  const clear = () => {
    setDraftFrom("");
    setDraftTo("");
    setFrom(undefined);
    setTo(undefined);
    setPage(1);
  };

  const firstShown = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastShown = Math.min(page * limit, total);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
          <HistoryIcon size={16} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-extrabold">Run history</p>
          <p className="text-[11px] text-muted">
            Every finished run, newest first
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="sr-only" htmlFor="progress-rows">
            Rows per page
          </label>
          <select
            id="progress-rows"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-line bg-inset px-2 py-1.5 text-[11px] font-bold text-muted outline-none focus:border-accent/50"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2 rounded-xl border border-line bg-inset p-3">
        <span className="mr-1 hidden items-center gap-1.5 pb-2 text-[11px] font-bold text-muted sm:flex">
          <CalendarRange size={13} aria-hidden /> Window
        </span>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase text-faint">From</span>
          <input
            type="date"
            value={draftFrom}
            max={draftTo || undefined}
            onChange={(e) => setDraftFrom(e.target.value)}
            className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-[12px] font-semibold text-ink outline-none focus:border-accent/50"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase text-faint">To</span>
          <input
            type="date"
            value={draftTo}
            min={draftFrom || undefined}
            onChange={(e) => setDraftTo(e.target.value)}
            className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-[12px] font-semibold text-ink outline-none focus:border-accent/50"
          />
        </label>

        <button
          type="button"
          onClick={apply}
          className="h-[34px] rounded-lg bg-mint px-3.5 text-[12px] font-bold text-black transition hover:brightness-110"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={!filtered && !draftFrom && !draftTo}
          className="h-[34px] rounded-lg border border-line px-3 text-[12px] font-bold text-muted transition hover:bg-chip disabled:opacity-40"
        >
          Clear
        </button>

        {filtered && (
          <span className="ml-auto text-[11px] font-semibold text-faint">
            {draftFrom || "90 days ago"} → {draftTo || "today"}
          </span>
        )}
      </div>

      {isLoading ? (
        <div aria-hidden className="mt-3 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[52px] animate-pulse rounded-xl bg-inset" />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-3 grid place-items-center rounded-xl border border-dashed border-line px-6 py-10 text-center">
          <div>
            <p className="text-sm font-bold">Could not load your runs</p>
            <p className="mt-1 text-xs text-muted">
              The history service did not answer — try again.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-chip"
            >
              <RotateCw size={13} aria-hidden /> Retry
            </button>
          </div>
        </div>
      ) : runs.length === 0 ? (
        <div className="mt-3 grid place-items-center rounded-xl border border-dashed border-line px-6 py-12 text-center">
          <div>
            <p className="text-sm font-extrabold">No runs here yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted">
              {filtered
                ? "No runs were logged inside this window. Widen it, or finish a new run."
                : "Finish a practice run and every one of your results lands here."}
            </p>
            <Link
              href="/practice"
              className="mt-4 inline-block rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
            >
              Practice a run →
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {runs.map((run) => (
            <RunRow key={run.id} run={run} isBest={run.wpm === bestWpm && bestWpm > 0} />
          ))}
        </ul>
      )}

      {!isLoading && !isError && total > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-3">
          <p className="text-[11px] tabular-nums text-faint">
            Showing {firstShown}–{lastShown} of {total.toLocaleString()}{" "}
            {total === 1 ? "run" : "runs"}
          </p>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              aria-label="Previous page"
              className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:bg-chip disabled:opacity-35"
            >
              <ChevronLeft size={15} aria-hidden />
            </button>
            <span className="px-1 text-[11px] font-bold tabular-nums text-muted">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
              aria-label="Next page"
              className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:bg-chip disabled:opacity-35"
            >
              <ChevronRight size={15} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
