"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Loader2,
  RefreshCcw,
  Send,
  Swords,
  Trophy,
  UserPlus,
} from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { getApiError } from "@/helper/error-helper";
import { formatRunWhen } from "@/lib/stats-helpers";
import { cn } from "@/lib/cn";
import {
  useGetInviteHistoryQuery,
  useGetMatchHistoryQuery,
  type BattleResult,
  type InviteHistoryEntry,
  type InviteStatus,
  type RankedHistoryEntry,
} from "@/lib/features/battle/features.battle";

type Tab = "ranked" | "private";
type RankedFilter = "all" | "WIN" | "LOSS" | "DRAW";
type InviteFilter = "all" | "sent" | "received";

const RESULT_TONE: Record<BattleResult, string> = {
  WIN: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  LOSS: "border-rose-500/40 bg-rose-500/10 text-rose-500",
  DRAW: "border-amber-500/40 bg-amber-500/10 text-amber-500",
  ABANDONED: "border-line bg-chip text-muted",
};

const INVITE_TONE: Record<InviteStatus, string> = {
  PENDING: "border-amber-500/40 bg-amber-500/10 text-amber-500",
  MATCHED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  DECLINED: "border-rose-500/40 bg-rose-500/10 text-rose-500",
  CANCELLED: "border-line bg-chip text-muted",
  EXPIRED: "border-line bg-chip text-faint",
};

const INVITE_LABEL: Record<InviteStatus, string> = {
  PENDING: "Pending",
  MATCHED: "Played",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

function percent(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function StatTile({
  label,
  value,
  hint,
  tone = "text-ink",
}: {
  label: string;
  value: string | number;
  hint: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-inset p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-faint">
        {label}
      </p>
      <p className={cn("mt-1 text-xl font-black tabular-nums", tone)}>{value}</p>
      <p className="mt-0.5 text-[11px] text-muted">{hint}</p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
  href,
  cta,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-inset p-8 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-line bg-card text-muted">
        {icon}
      </span>
      <p className="mt-3 text-sm font-extrabold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted">{body}</p>
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
      >
        {cta}
        <ArrowRight size={13} aria-hidden />
      </Link>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2" aria-hidden>
      {[0, 1, 2, 3].map((row) => (
        <div
          key={row}
          className="flex animate-pulse items-center gap-3 rounded-xl border border-line bg-inset p-3"
        >
          <span className="h-8 w-8 rounded-full bg-chip" />
          <span className="h-3 flex-1 rounded bg-chip" />
          <span className="h-3 w-14 rounded bg-chip" />
        </div>
      ))}
    </div>
  );
}

function RankedRow({
  entry,
  userId,
}: {
  entry: RankedHistoryEntry;
  userId: string | null;
}) {
  const opponent = entry.match.participants.find((p) => p.userId !== userId);
  const result = entry.result;
  const settled =
    entry.match.status === "COMPLETED" || entry.match.status === "ABANDONED";
  const when = entry.match.endedAt ?? entry.match.startedAt ?? entry.joinedAt;
  const delta =
    entry.ratingAfter !== null ? entry.ratingAfter - entry.ratingBefore : null;

  const badge = result ? (
    <span
      className={cn(
        "inline-flex min-w-14 items-center justify-center rounded-md border px-2 py-1 text-[10px] font-extrabold tracking-wide",
        RESULT_TONE[result]
      )}
    >
      {result}
    </span>
  ) : (
    <span className="inline-flex min-w-14 items-center justify-center rounded-md border border-line bg-chip px-2 py-1 text-[10px] font-extrabold tracking-wide text-muted">
      {entry.match.status === "ACTIVE" ? "LIVE" : "QUEUED"}
    </span>
  );

  return (
    <Link
      href={`/battles/${entry.match.id}`}
      className="group grid gap-3 rounded-xl border border-line bg-inset p-3 transition hover:border-accent/40 hover:bg-chip/40 sm:grid-cols-[auto_1fr_auto]"
    >
      <div className="flex items-center gap-2 sm:flex-col sm:items-start">
        {badge}
        <span className="text-[10px] font-semibold text-faint">
          {formatRunWhen(when)}
        </span>
      </div>

      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold">
          vs {opponent?.user.name ?? "Opponent"}
          {opponent?.result && (
            <span className="ml-1.5 text-[10px] font-semibold text-faint">
              ({opponent.result})
            </span>
          )}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">
          {entry.match.paragraph.content}
        </p>
        <p className="mt-0.5 text-[10px] text-faint">
          {entry.match.paragraph.difficulty ?? "Ranked"} ·{" "}
          {entry.match.duration}s
          {settled ? "" : " · in progress"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-right sm:w-44">
        <div>
          <p className="text-sm font-extrabold tabular-nums">{entry.wpm ?? "–"}</p>
          <p className="text-[9px] font-semibold tracking-wide text-faint">WPM</p>
        </div>
        <div>
          <p className="text-sm font-extrabold tabular-nums">
            {entry.accuracy !== null ? `${entry.accuracy}%` : "–"}
          </p>
          <p className="text-[9px] font-semibold tracking-wide text-faint">ACC</p>
        </div>
        <div>
          <p
            className={cn(
              "text-sm font-extrabold tabular-nums",
              delta === null
                ? "text-faint"
                : delta > 0
                  ? "text-emerald-500"
                  : delta < 0
                    ? "text-rose-500"
                    : "text-muted"
            )}
          >
            {delta === null ? "–" : `${delta > 0 ? "+" : ""}${delta}`}
          </p>
          <p className="text-[9px] font-semibold tracking-wide text-faint">ELO</p>
        </div>
      </div>
    </Link>
  );
}

function InviteRow({
  entry,
  direction,
}: {
  entry: InviteHistoryEntry;
  direction: "sent" | "received";
}) {
  const other =
    direction === "sent" ? entry.invitee?.name : entry.inviter?.name;
  const when = entry.respondedAt ?? entry.createdAt;

  return (
    <div className="grid gap-3 rounded-xl border border-line bg-inset p-3 transition hover:border-accent/40 sm:grid-cols-[auto_1fr_auto]">
      <div className="flex items-center gap-2 sm:flex-col sm:items-start">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-extrabold tracking-wide",
            direction === "sent"
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-violet-500/30 bg-violet-500/10 text-violet-400"
          )}
        >
          {direction === "sent" ? <Send size={10} aria-hidden /> : <UserPlus size={10} aria-hidden />}
          {direction === "sent" ? "SENT" : "RECEIVED"}
        </span>
        <span className="text-[10px] font-semibold text-faint">
          {formatRunWhen(when)}
        </span>
      </div>

      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold">
          {direction === "sent" ? "To" : "From"} {other ?? "a fellow typist"}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">
          {entry.paragraph.content}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-faint">
          <span className="font-mono tracking-wider">{entry.code}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={9} aria-hidden />
            {entry.duration}s
          </span>
          <span aria-hidden>·</span>
          <span>{entry.paragraph.difficulty ?? "Custom"}</span>
        </p>
      </div>

      <div className="flex items-center justify-end gap-2">
        <span
          className={cn(
            "inline-flex min-w-16 items-center justify-center rounded-md border px-2 py-1 text-[10px] font-extrabold tracking-wide",
            INVITE_TONE[entry.status]
          )}
        >
          {INVITE_LABEL[entry.status]}
        </span>
        {entry.matchId && (
          <Link
            href={`/battles/${entry.matchId}`}
            className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-bold text-muted transition hover:bg-chip hover:text-ink"
          >
            Open
            <ArrowRight size={11} aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}

function ErrorBlock({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6 text-center">
      <p className="text-sm font-bold text-rose-500">Could not load history</p>
      <p className="mt-1 text-xs text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-chip"
      >
        <RefreshCcw size={12} aria-hidden />
        Retry
      </button>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold transition",
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-line text-muted hover:bg-chip hover:text-ink"
      )}
    >
      {children}
      {typeof count === "number" && (
        <span className="text-[10px] opacity-70">{count}</span>
      )}
    </button>
  );
}

export function BattleHistory() {
  const { user } = useAuth();
  const userId = typeof user?.id === "string" ? user.id : null;

  const [tab, setTab] = useState<Tab>("ranked");
  const [rankedFilter, setRankedFilter] = useState<RankedFilter>("all");
  const [inviteFilter, setInviteFilter] = useState<InviteFilter>("all");

  const {
    data: ranked,
    isLoading: rankedLoading,
    isError: rankedError,
    error: rankedErr,
    refetch: refetchRanked,
  } = useGetMatchHistoryQuery({ limit: 50 });

  const {
    data: invites,
    isLoading: invitesLoading,
    isError: invitesError,
    error: invitesErr,
    refetch: refetchInvites,
  } = useGetInviteHistoryQuery({ limit: 50 });

  const rankedRows = useMemo(() => ranked ?? [], [ranked]);
  const sentRows = useMemo(() => invites?.sent ?? [], [invites]);
  const receivedRows = useMemo(() => invites?.received ?? [], [invites]);

  const rankedStats = useMemo(() => {
    const settled = rankedRows.filter(
      (r) => r.result === "WIN" || r.result === "LOSS" || r.result === "DRAW"
    );
    const wins = settled.filter((r) => r.result === "WIN").length;
    const losses = settled.filter((r) => r.result === "LOSS").length;
    const draws = settled.filter((r) => r.result === "DRAW").length;
    const bestWpm = rankedRows.reduce((best, r) => Math.max(best, r.wpm ?? 0), 0);
    const withAccuracy = rankedRows.filter((r) => typeof r.accuracy === "number");
    const avgAccuracy =
      withAccuracy.length > 0
        ? Math.round(
            withAccuracy.reduce((sum, r) => sum + (r.accuracy ?? 0), 0) /
              withAccuracy.length
          )
        : 0;
    return {
      total: rankedRows.length,
      wins,
      losses,
      draws,
      winRate: percent(wins, settled.length),
      bestWpm,
      avgAccuracy,
    };
  }, [rankedRows]);

  const inviteStats = useMemo(() => {
    const all = [...sentRows, ...receivedRows];
    const accepted = all.filter((i) => i.status === "MATCHED").length;
    const pending = all.filter((i) => i.status === "PENDING").length;
    return {
      total: all.length,
      sent: sentRows.length,
      received: receivedRows.length,
      accepted,
      pending,
      acceptRate: percent(accepted, all.filter((i) => i.status !== "PENDING").length),
    };
  }, [sentRows, receivedRows]);

  const visibleRanked = useMemo(() => {
    if (rankedFilter === "all") return rankedRows;
    return rankedRows.filter((r) => r.result === rankedFilter);
  }, [rankedRows, rankedFilter]);

  const visibleInvites = useMemo(() => {
    const merged = [
      ...sentRows.map((entry) => ({ entry, direction: "sent" as const })),
      ...receivedRows.map((entry) => ({ entry, direction: "received" as const })),
    ].sort(
      (a, b) =>
        new Date(b.entry.createdAt).getTime() -
        new Date(a.entry.createdAt).getTime()
    );
    if (inviteFilter === "all") return merged;
    return merged.filter((item) => item.direction === inviteFilter);
  }, [sentRows, receivedRows, inviteFilter]);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
          Your record
        </p>
        <h1 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">
          History
        </h1>
        <p className="mt-1 text-sm text-muted">
          Every ranked queue race and private invite, with the numbers behind each
          rating change.
        </p>
      </div>

      <div className="inline-flex rounded-lg border border-line bg-card p-1">
        {(
          [
            { id: "ranked" as const, label: "Ranked", Icon: Swords },
            { id: "private" as const, label: "Invites", Icon: UserPlus },
          ]
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-[12px] font-bold transition",
              tab === id
                ? "bg-accent/15 text-accent"
                : "text-muted hover:text-ink"
            )}
          >
            <Icon size={13} aria-hidden />
            {label}
            <span className="text-[10px] opacity-70">
              {id === "ranked" ? rankedStats.total : inviteStats.total}
            </span>
          </button>
        ))}
      </div>

      {tab === "ranked" ? (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatTile
              label="Battles"
              value={rankedStats.total}
              hint={`${rankedStats.wins}W · ${rankedStats.losses}L · ${rankedStats.draws}D`}
            />
            <StatTile
              label="Win rate"
              value={`${rankedStats.winRate}%`}
              hint="of settled races"
              tone="text-accent"
            />
            <StatTile
              label="Best WPM"
              value={rankedStats.bestWpm}
              hint="personal record"
              tone="text-emerald-500"
            />
            <StatTile
              label="Avg accuracy"
              value={`${rankedStats.avgAccuracy}%`}
              hint="across these races"
              tone="text-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <FilterChip
              active={rankedFilter === "all"}
              onClick={() => setRankedFilter("all")}
              count={rankedStats.total}
            >
              All
            </FilterChip>
            <FilterChip
              active={rankedFilter === "WIN"}
              onClick={() => setRankedFilter("WIN")}
              count={rankedStats.wins}
            >
              Wins
            </FilterChip>
            <FilterChip
              active={rankedFilter === "LOSS"}
              onClick={() => setRankedFilter("LOSS")}
              count={rankedStats.losses}
            >
              Losses
            </FilterChip>
            <FilterChip
              active={rankedFilter === "DRAW"}
              onClick={() => setRankedFilter("DRAW")}
              count={rankedStats.draws}
            >
              Draws
            </FilterChip>
          </div>

          {rankedLoading ? (
            <SkeletonRows />
          ) : rankedError ? (
            <ErrorBlock
              message={getApiError(rankedErr)}
              onRetry={() => void refetchRanked()}
            />
          ) : visibleRanked.length === 0 ? (
            <EmptyState
              icon={<Swords size={18} aria-hidden />}
              title={
                rankedStats.total === 0
                  ? "No ranked battles yet"
                  : "Nothing in this filter"
              }
              body={
                rankedStats.total === 0
                  ? "Join the global queue and your races, WPM, accuracy and rating changes will appear here."
                  : "Try a different result filter to see the rest of your record."
              }
              href="/battles"
              cta="Find a match"
            />
          ) : (
            <div className="space-y-2">
              {visibleRanked.map((entry) => (
                <RankedRow
                  key={entry.match.id}
                  entry={entry}
                  userId={userId}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatTile
              label="Invites"
              value={inviteStats.total}
              hint={`${inviteStats.sent} sent · ${inviteStats.received} received`}
            />
            <StatTile
              label="Played"
              value={inviteStats.accepted}
              hint="accepted invites"
              tone="text-emerald-500"
            />
            <StatTile
              label="Pending"
              value={inviteStats.pending}
              hint="still waiting"
              tone="text-amber-500"
            />
            <StatTile
              label="Accept rate"
              value={`${inviteStats.acceptRate}%`}
              hint="of answered invites"
              tone="text-accent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <FilterChip
              active={inviteFilter === "all"}
              onClick={() => setInviteFilter("all")}
              count={inviteStats.total}
            >
              All
            </FilterChip>
            <FilterChip
              active={inviteFilter === "sent"}
              onClick={() => setInviteFilter("sent")}
              count={inviteStats.sent}
            >
              Sent
            </FilterChip>
            <FilterChip
              active={inviteFilter === "received"}
              onClick={() => setInviteFilter("received")}
              count={inviteStats.received}
            >
              Received
            </FilterChip>
          </div>

          {invitesLoading ? (
            <SkeletonRows />
          ) : invitesError ? (
            <ErrorBlock
              message={getApiError(invitesErr)}
              onRetry={() => void refetchInvites()}
            />
          ) : visibleInvites.length === 0 ? (
            <EmptyState
              icon={<UserPlus size={18} aria-hidden />}
              title={
                inviteStats.total === 0
                  ? "No private invites yet"
                  : "Nothing in this filter"
              }
              body={
                inviteStats.total === 0
                  ? "Create a 5-minute code, share it with a friend, and the match lands here once they accept."
                  : "Switch the filter to see the invites you sent or received."
              }
              href="/battles/invite"
              cta="Invite a friend"
            />
          ) : (
            <div className="space-y-2">
              {visibleInvites.map(({ entry, direction }) => (
                <InviteRow
                  key={`${entry.code}-${direction}`}
                  entry={entry}
                  direction={direction}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Card className="flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
          <Trophy size={16} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold">Keep the streak going</p>
          <p className="text-[11px] text-muted">
            Jump back into the queue or send another private code.
          </p>
        </div>
        <Link
          href="/battles"
          className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-3.5 py-2 text-xs font-extrabold text-black transition hover:brightness-110"
        >
          <Swords size={13} aria-hidden />
          Battle
        </Link>
        <Link
          href="/battles/invite"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-xs font-bold text-ink transition hover:bg-chip"
        >
          <UserPlus size={13} aria-hidden />
          Play a friend
        </Link>
      </Card>

      {rankedLoading || invitesLoading ? (
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-faint">
          <Loader2 size={12} className="animate-spin" aria-hidden />
          Syncing your record…
        </p>
      ) : null}
    </div>
  );
}
