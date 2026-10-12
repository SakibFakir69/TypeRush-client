"use client";

import { Timer } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { useGetLeaderboardQuery } from "@/lib/features/practice/features.practice";
import { cn } from "@/lib/cn";

const MEDALS = [
  "border-amber-500/50 bg-amber-500/10 text-amber-500",
  "border-sky-500/50 bg-sky-500/10 text-sky-500",
  "border-orange-500/50 bg-orange-500/10 text-orange-500",
];

/**
 * Live leaderboard: server rows shaped by your own submissions.
 * Finish an admin passage and you climb this board.
 */
export function LiveBoard() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useGetLeaderboardQuery();
  const myId = typeof user?.id === "string" ? user.id : "";
  const myEmail = typeof user?.email === "string" ? user.email : "";

  // Highest WPM on top, always — ranked client-side regardless of server order.
  const rows = [...(data ?? [])]
    .sort((a, b) => b.wpm - a.wpm)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  if (isLoading) {
    return (
      <div className="space-y-2" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl border border-line bg-card" />
        ))}
      </div>
    );
  }

  console.log(data , " data")

  if (isError || !data || data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-base font-extrabold">No ranks yet</p>
        <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted">
          {isError
            ? "Couldn't reach the leaderboard — check your connection and retry."
            : "Be the first: finish an admin passage and your score lands here."}
        </p>
        {isError && (
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg border border-line px-4 py-2 text-sm font-bold transition hover:bg-chip"
          >
            Retry
          </button>
        )}
      </Card>
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map((r) => {
        const mine =
          (myId !== "" && r.userId === myId) ||
          (myEmail !== "" && r.userName === myEmail);
        return (
          <li
            key={`${r.rank}-${r.userId}`}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition",
              mine
                ? "border-accent/50 bg-accent/[0.07]"
                : "border-transparent bg-inset hover:border-line"
            )}
          >
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-sm font-black tabular-nums shadow-[0_2px_0_rgba(0,0,0,0.25)]",
                MEDALS[r.rank - 1] ?? "border-line bg-inset text-muted"
              )}
            >
              {r.rank}
            </span>
            <Avatar
              src={`https://i.pravatar.cc/56?img=${(r.rank * 13) % 60 + 1}`}
              alt={mine ? "You" : `Rank ${r.rank} typist`}
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-full border border-line object-cover"
            />
            <span className="min-w-0 flex-1">
              <span className={cn("block truncate text-sm", mine ? "font-extrabold text-accent" : "font-medium")}>
                {mine ? "You" : (r.userName ?? `Typist ${r.userId.slice(0, 6) || "—"}`)}
              </span>
              {typeof r.timeTaken === "number" && (
                <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] tabular-nums text-faint">
                  <Timer size={11} aria-hidden /> completed in {r.timeTaken}s
                </span>
              )}
            </span>
            <span className="ml-auto shrink-0 text-right">
              <span className="block font-mono text-sm font-extrabold tabular-nums text-accent">
                {r.wpm} <span className="text-[10px]">WPM</span>
              </span>
              <span className="block text-[11px] tabular-nums text-muted">
                {r.accuracy}% acc
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
