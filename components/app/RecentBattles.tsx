"use client";

import Link from "next/link";
import { ArrowRight, Swords, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { formatRunWhen } from "@/lib/stats-helpers";
import { cn } from "@/lib/cn";
import {
  useGetInviteHistoryQuery,
  useGetMatchHistoryQuery,
  type BattleResult,
} from "@/lib/features/battle/features.battle";

type RecentItem = {
  key: string;
  kind: "ranked" | "invite";
  at: string;
  opponent: string;
  wpm: number | null;
  result: BattleResult | null;
  href: string;
  pending?: boolean;
};

const RESULT_TAG: Record<BattleResult, string> = {
  WIN: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  LOSS: "border-rose-500/40 bg-rose-500/10 text-rose-500",
  DRAW: "border-amber-500/40 bg-amber-500/10 text-amber-500",
  ABANDONED: "border-line bg-chip text-muted",
};

function timeOf(value: string | null | undefined, fallback: string) {
  return value ?? fallback;
}

export function RecentBattles() {
  const { user } = useAuth();
  const userId = typeof user?.id === "string" ? user.id : null;

  const { data: ranked, isLoading: rankedLoading } =
    useGetMatchHistoryQuery({ limit: 8 });
  const { data: invites, isLoading: invitesLoading } =
    useGetInviteHistoryQuery({ limit: 8 });

  const loading = rankedLoading || invitesLoading;

  const items: RecentItem[] = [];

  for (const entry of ranked ?? []) {
    const opponent = entry.match.participants.find((p) => p.userId !== userId);
    items.push({
      key: `ranked-${entry.match.id}`,
      kind: "ranked",
      at: timeOf(
        entry.match.endedAt ?? entry.match.startedAt,
        entry.joinedAt
      ),
      opponent: opponent?.user.name ?? "Opponent",
      wpm: entry.wpm,
      result: entry.result,
      href: `/battles/${entry.match.id}`,
      pending: entry.match.status === "ACTIVE",
    });
  }

  const inviteEntries = [
    ...(invites?.sent ?? []).map((entry) => ({
      entry,
      direction: "sent" as const,
    })),
    ...(invites?.received ?? []).map((entry) => ({
      entry,
      direction: "received" as const,
    })),
  ];

  for (const { entry, direction } of inviteEntries) {
    if (entry.status !== "MATCHED" || !entry.matchId) continue;
    const opponent =
      direction === "sent" ? entry.invitee?.name : entry.inviter?.name;
    const me = entry.match?.participants[0] ?? null;
    items.push({
      key: `invite-${entry.code}`,
      kind: "invite",
      at: entry.respondedAt ?? entry.createdAt,
      opponent: opponent ?? "a friend",
      wpm: me?.wpm ?? null,
      result: me?.result ?? null,
      href: `/battles/${entry.matchId}`,
      pending: entry.match?.status === "ACTIVE",
    });
  }

  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const latest = items.slice(0, 5);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-extrabold">Latest battles</p>
        <Link
          href="/history"
          className="ml-auto inline-flex items-center gap-0.5 text-xs font-semibold text-accent hover:underline"
        >
          View all
          <ArrowRight size={11} aria-hidden />
        </Link>
      </div>

      {loading ? (
        <div className="mt-3 space-y-2" aria-hidden>
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="flex animate-pulse items-center gap-2 rounded-lg border border-line bg-inset p-2"
            >
              <span className="h-7 w-7 rounded-full bg-chip" />
              <span className="h-3 flex-1 rounded bg-chip" />
              <span className="h-3 w-8 rounded bg-chip" />
            </div>
          ))}
        </div>
      ) : latest.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-line bg-inset p-4 text-center">
          <p className="text-xs font-bold">No battles yet</p>
          <p className="mt-0.5 text-[11px] leading-4 text-muted">
            Queue up or send a friend a code — your latest matches will show here.
          </p>
          <Link
            href="/battles"
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-mint px-3 py-1.5 text-[11px] font-extrabold text-black transition hover:brightness-110"
          >
            <Swords size={12} aria-hidden />
            Find a match
          </Link>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {latest.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg border border-line bg-inset p-2 transition hover:border-accent/40 hover:bg-chip/40"
            >
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                  item.kind === "ranked"
                    ? "bg-accent/10 text-accent"
                    : "bg-violet-500/10 text-violet-400"
                )}
              >
                {item.kind === "ranked" ? (
                  <Swords size={13} aria-hidden />
                ) : (
                  <UserPlus size={13} aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold">
                  vs {item.opponent}
                </p>
                <p className="text-[10px] text-faint">
                  {item.kind === "ranked" ? "Ranked" : "Private"}
                  {item.wpm !== null ? ` · ${item.wpm} WPM` : ""} ·{" "}
                  {formatRunWhen(item.at)}
                </p>
              </div>
              {item.pending ? (
                <span className="rounded-md border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[9px] font-extrabold text-accent">
                  LIVE
                </span>
              ) : item.result ? (
                <span
                  className={cn(
                    "rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold",
                    RESULT_TAG[item.result]
                  )}
                >
                  {item.result === "WIN"
                    ? "W"
                    : item.result === "LOSS"
                      ? "L"
                      : item.result === "DRAW"
                        ? "D"
                        : "—"}
                </span>
              ) : (
                <span className="rounded-md border border-line bg-chip px-1.5 py-0.5 text-[9px] font-extrabold text-muted">
                  INVITE
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
