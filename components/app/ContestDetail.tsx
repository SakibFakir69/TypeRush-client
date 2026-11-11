"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  LogOut,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { TypingCard } from "@/components/landing/TypingCard";
import { getApiError } from "@/helper/error-helper";
import { useAuth } from "@/lib/auth";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/cn";
import {
  contestExcerpt,
  contestStatus,
  contestTiming,
  formatContestDate,
  formatContestTime,
  formatCountdown,
  statusLabel,
  statusStyle,
  useGetContestByIdQuery,
  useGetContestLeaderboardQuery,
  useJoinContestMutation,
  useLeaveContestMutation,
} from "@/lib/features/contest/features.contest";

/** "sakib.fakir@gmail.com" → "Sakib Fakir"; real names pass through. */
function displayName(raw: string): string {
  if (!raw.includes("@")) return raw;
  const local = raw.split("@")[0].replace(/[._-]+/g, " ").trim();
  if (!local) return "Typist";
  return local
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Podium colours for the top three ranks. */
const RANK_STYLE = [
  "border-amber-500/50 bg-amber-500/10 text-amber-500",
  "border-slate-400/50 bg-slate-400/10 text-muted",
  "border-orange-600/50 bg-orange-600/10 text-orange-400",
];

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ContestDetail({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } =
    useGetContestByIdQuery(id);
  const [join, { isLoading: joining }] = useJoinContestMutation();
  const [leave, { isLoading: leaving }] = useLeaveContestMutation();
  const [showFull, setShowFull] = useState(false);
  const [racing, setRacing] = useState(false);
  const {
    data: board,
    isLoading: boardLoading,
    isError: boardError,
    refetch: refetchBoard,
  } = useGetContestLeaderboardQuery(id);

  const myId = typeof user?.id === "string" ? user.id : "";
  const participants = data?.participants ?? [];
  const joined =
    myId !== "" && participants.some((p) => p.userId === myId);
  const myRow = (board ?? []).find((r) => myId !== "" && r.userId === myId);
  // Phases follow the clock, so a race turns live/finished on its own instead
  // of waiting for an admin to flip the stored condition.
  const now = useNow(1000);
  const status = contestStatus(data, now);
  const timing = contestTiming(data, now);
  const status404 =
    !!error &&
    typeof error === "object" &&
    "status" in error &&
    (error as { status?: unknown }).status === 404;

  const onJoin = async () => {
    try {
      await join(id).unwrap();
      toast.success("You're in. Be ready when the clock starts.");
    } catch (e) {
      const conflict =
        !!e &&
        typeof e === "object" &&
        "status" in e &&
        (e as { status?: unknown }).status === 409;
      if (conflict) {
        toast.message("You're already in this contest.");
        refetch();
        return;
      }
      toast.error(getApiError(e));
    }
  };

  const onLeave = async () => {
    try {
      await leave(id).unwrap();
      toast.success("Left the contest.");
    } catch (e) {
      toast.error(getApiError(e));
    }
  };

  if (isLoading) {
    return (
      <div aria-hidden className="space-y-2">
        <div className="h-28 animate-pulse rounded-2xl border border-line bg-card" />
        <div className="h-48 animate-pulse rounded-2xl border border-line bg-card" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="p-8 text-center">
        <p className="text-base font-extrabold">
          {status404 ? "Contest not found" : "Couldn't load this contest"}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted">
          {status404
            ? "This race may have been removed by its organiser."
            : "The contest details didn't come back. Try again."}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {!status404 && (
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-line px-4 py-2 text-sm font-bold transition hover:bg-chip"
            >
              Retry
            </button>
          )}
          <button
            type="button"
            onClick={() => router.push("/contests")}
            className="rounded-lg border border-line px-4 py-2 text-sm font-bold transition hover:bg-chip"
          >
            All contests
          </button>
        </div>
      </Card>
    );
  }

  const content = data.content ?? "";

  return (
    <div className="space-y-3">
      <Link
        href="/contests"
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted transition hover:text-ink"
      >
        <ArrowLeft size={14} aria-hidden /> All contests
      </Link>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "grid h-11 w-11 shrink-0 place-items-center rounded-xl border",
              statusStyle(data, now)
            )}
          >
            <Trophy size={18} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">{data.name}</h1>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  statusStyle(data, now)
                )}
              >
                {status === "RUNNING" && (
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
                {statusLabel(data, now)}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-faint">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={12} aria-hidden />
                {formatContestDate(data.contestDate)}
              </span>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Timer size={12} aria-hidden />
                {formatContestTime(data.time)}
              </span>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Users size={12} aria-hidden />
                {participants.length} joined
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 font-bold tabular-nums",
                  status === "RUNNING"
                    ? "text-emerald-500"
                    : status === "UPCOMING"
                      ? "text-sky-500"
                      : "text-muted"
                )}
              >
                <Clock size={12} aria-hidden />
                {status === "RUNNING"
                  ? `Ends in ${formatCountdown(timing.endsInMs)}`
                  : status === "UPCOMING"
                    ? `Starts in ${formatCountdown(timing.startsInMs)}`
                    : timing.endsAt
                      ? `Ended ${formatCountdown(now - timing.endsAt)} ago`
                      : "Finished"}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[13px] leading-6 text-muted">
          {contestExcerpt(content, 220)}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {status === "FINISHED" ? (
            <span className="rounded-lg border border-line bg-inset px-4 py-2 text-sm font-bold text-muted">
              This contest has finished
            </span>
          ) : joined ? (
            <>
              <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-500">
                You&apos;re competing
              </span>
              <button
                type="button"
                onClick={onLeave}
                disabled={leaving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-bold text-muted transition hover:bg-chip hover:text-ink disabled:opacity-60"
              >
                <LogOut size={14} aria-hidden />
                {leaving ? "Leaving…" : "Leave"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onJoin}
              disabled={joining}
              className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-60"
            >
              <Trophy size={14} aria-hidden />
              {joining ? "Joining…" : "Join contest"}
            </button>
          )}
          {user && (
            <Link
              href="/practice"
              className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-muted transition hover:bg-chip hover:text-ink"
            >
              Warm up first
            </Link>
          )}
        </div>
      </Card>

      {status === "RUNNING" && joined && content && (
        <Card className="border-emerald-500/30 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-extrabold">Contest run</h2>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
              Live
            </span>
            <span className="text-[11px] text-faint">
              {formatContestTime(data.time)} · your best run ranks you
            </span>
            <button
              type="button"
              onClick={() => setRacing((v) => !v)}
              className="ml-auto rounded-lg bg-mint px-3 py-1.5 text-xs font-bold text-black transition hover:brightness-110"
            >
              {racing ? "Hide arena" : "Race now →"}
            </button>
          </div>
          {racing ? (
            <div className="mt-3">
              <TypingCard
                key={`contest-${data.id}`}
                target={content}
                contest={{
                  id: data.id,
                  seconds: data.time,
                  onSubmitted: () => refetchBoard(),
                }}
              />
            </div>
          ) : (
            <p className="mt-2 text-[13px] text-muted">
              The contest is live — race the passage, then submit your WPM to
              the contest leaderboard.
            </p>
          )}
        </Card>
      )}

      <Card className="p-5">
        <h2 className="text-sm font-extrabold">Contest passage</h2>
        <p
          className={cn(
            "mt-2 whitespace-pre-wrap text-[13px] leading-6 text-muted",
            !showFull && "line-clamp-6"
          )}
        >
          {content || "The passage will be published before the start."}
        </p>
        {content.length > 320 && (
          <button
            type="button"
            onClick={() => setShowFull((v) => !v)}
            className="mt-2 text-[12px] font-bold text-accent hover:underline"
          >
            {showFull ? "Show less" : "Show full passage"}
          </button>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-extrabold">Contest leaderboard</h2>
          {myRow && (
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
              You · #{myRow.rank}
            </span>
          )}
          <button
            type="button"
            onClick={() => refetchBoard()}
            className="ml-auto text-[11px] font-semibold text-muted transition hover:text-accent"
          >
            Refresh
          </button>
        </div>

        {boardLoading ? (
          <div aria-hidden className="mt-3 space-y-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-11 animate-pulse rounded-lg bg-inset" />
            ))}
          </div>
        ) : boardError ? (
          <div className="mt-3 text-center">
            <p className="text-[12px] text-muted">
              Couldn&apos;t load the leaderboard.
            </p>
            <button
              type="button"
              onClick={() => refetchBoard()}
              className="mt-2 rounded-lg border border-line px-3 py-1.5 text-[11px] font-bold transition hover:bg-chip"
            >
              Retry
            </button>
          </div>
        ) : (board ?? []).length === 0 ? (
          <p className="mt-2 text-[13px] text-muted">
            {status === "RUNNING"
              ? "No runs yet — the first submission takes #1."
              : "Results show up here once the contest has run."}
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {(board ?? []).map((row) => {
              const mine = myId !== "" && row.userId === myId;
              const name = displayName(row.name);
              return (
                <li
                  key={`${row.rank}-${row.userId}`}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-3 py-2",
                    mine
                      ? "border-accent/50 bg-accent/[0.07]"
                      : "border-line bg-inset"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-md border text-[10px] font-black tabular-nums",
                      RANK_STYLE[row.rank - 1] ?? "border-line text-muted"
                    )}
                  >
                    {row.rank}
                  </span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-800 text-[11px] font-black text-white">
                    {initials(mine ? "You" : name)}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block truncate text-[13px]",
                        mine ? "font-extrabold text-accent" : "font-bold"
                      )}
                    >
                      {mine ? "You" : name}
                    </span>
                    <span className="block text-[10px] tabular-nums text-faint">
                      {row.accuracy}% accuracy · {row.errors} errors
                    </span>
                  </span>
                  <span className="ml-auto shrink-0 text-right">
                    <span className="block font-mono text-sm font-extrabold tabular-nums text-accent">
                      {row.wpm}
                    </span>
                    <span className="block text-[9px] uppercase tracking-wide text-faint">
                      wpm
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-extrabold">
          Participants{" "}
          <span className="font-semibold text-faint">({participants.length})</span>
        </h2>
        {participants.length === 0 ? (
          <p className="mt-2 text-[13px] text-muted">
            Nobody has joined yet — be the first on the board.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {participants.map((p) => {
              const name =
                p.user?.name || p.user?.fullName || p.user?.email || "Typist";
              const mine = myId !== "" && p.userId === myId;
              return (
                <li
                  key={p.userId}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-3 py-2",
                    mine
                      ? "border-accent/50 bg-accent/[0.07]"
                      : "border-line bg-inset"
                  )}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-teal-600 to-emerald-800 text-[11px] font-black text-white">
                    {initials(name)}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block truncate text-[13px]",
                        mine ? "font-extrabold text-accent" : "font-bold"
                      )}
                    >
                      {mine ? "You" : name}
                    </span>
                    {p.joinedAt && (
                      <span className="block text-[10px] text-faint">
                        joined {formatContestDate(p.joinedAt)}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
