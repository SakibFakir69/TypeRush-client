"use client";

import { useState } from "react";
import { ChevronDown, Timer } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import {
  useGetLeaderboardQuery,
  useLazyGetLeaderboardQuery,
  type LeaderboardEntry,
} from "@/lib/features/practice/features.practice";
import { cn } from "@/lib/cn";

const MEDALS = [
  "border-amber-500/50 bg-amber-500/10 text-amber-500",
  "border-sky-500/50 bg-sky-500/10 text-sky-500",
  "border-orange-500/50 bg-orange-500/10 text-orange-500",
];

/** Rows per request; "Load more" walks the server's offset paging. */
const PAGE = 10;

/** Time categories match the practice presets (custom lengths are unranked). */
const CATEGORIES: { label: string; seconds?: number }[] = [
  { label: "All", seconds: undefined },
  { label: "15s", seconds: 15 },
  { label: "30s", seconds: 30 },
  { label: "60s", seconds: 60 },
];

/**
 * Per-duration leaderboards: pick a time category and only runs of that length
 * are ranked. Offset pagination via `?limit=&offset=&duration=`.
 */
export function LiveBoard() {
  const { user } = useAuth();
  const [category, setCategory] = useState<number | undefined>(undefined);
  // Extra pages accumulated by "Load more", tagged with the category they
  // belong to (so switching tabs can never mix two boards). `null` is the
  // "All" board and also the untouched initial state.
  const [extra, setExtra] = useState<{
    key: number | null;
    rows: LeaderboardEntry[];
    nextOffset: number | null;
    touched: boolean;
  }>({ key: null, rows: [], nextOffset: null, touched: false });

  const first = useGetLeaderboardQuery({
    duration: category,
    limit: PAGE,
    offset: 0,
  });
  const [loadMore, { isFetching: loadingMore }] = useLazyGetLeaderboardQuery();

  const mineLoaded = extra.touched && extra.key === (category ?? null);
  const rows = [...(first.data?.rows ?? []), ...(mineLoaded ? extra.rows : [])];
  const nextOffset = mineLoaded ? extra.nextOffset : (first.data?.nextOffset ?? null);
  const total = first.data?.total ?? 0;

  const myId = typeof user?.id === "string" ? user.id : "";
  const myEmail = typeof user?.email === "string" ? user.email : "";
  const myRank = rows.findIndex(
    (r) =>
      (myId !== "" && r.userId === myId) ||
      (myEmail !== "" && r.userName === myEmail)
  );

  const onLoadMore = async () => {
    if (nextOffset === null) return;
    try {
      const res = await loadMore({
        duration: category,
        limit: PAGE,
        offset: nextOffset,
      }).unwrap();
      setExtra({
        key: category ?? null,
        rows: [...(mineLoaded ? extra.rows : []), ...res.rows],
        nextOffset: res.nextOffset,
        touched: true,
      });
    } catch {
      // Keep the current page; the button stays for a retry.
    }
  };

  const label = CATEGORIES.find((c) => c.seconds === category)?.label ?? "All";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="flex gap-1 rounded-lg bg-inset p-1 text-[11px] font-bold"
          role="tablist"
          aria-label="Time category"
        >
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              type="button"
              role="tab"
              aria-selected={category === c.seconds}
              onClick={() => setCategory(c.seconds)}
              className={cn(
                "rounded-md px-3 py-1.5 transition",
                category === c.seconds
                  ? "bg-mint text-black"
                  : "text-muted hover:text-ink"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] tabular-nums text-faint">
          <Timer size={11} aria-hidden />
          {total} {total === 1 ? "run" : "runs"}
          {category ? ` · ${label} only` : ""}
        </span>
      </div>

      {first.isLoading || first.isFetching ? (
        <div className="space-y-2" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl border border-line bg-card" />
          ))}
        </div>
      ) : first.isError ? (
        <Card className="p-8 text-center">
          <p className="text-base font-extrabold">Couldn&apos;t load the board</p>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted">
            Check your connection and retry.
          </p>
          <button
            type="button"
            onClick={() => first.refetch()}
            className="mt-4 rounded-lg border border-line px-4 py-2 text-sm font-bold transition hover:bg-chip"
          >
            Retry
          </button>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-base font-extrabold">
            {category ? `No ${label} runs yet` : "No ranks yet"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted">
            {category
              ? `Set the timer to ${label} and finish a test to open this board.`
              : "Be the first: finish a test and your score lands here."}
          </p>
        </Card>
      ) : (
        <>
          <ul className="space-y-2">
            {rows.map((r, i) => {
              const mine =
                (myId !== "" && r.userId === myId) ||
                (myEmail !== "" && r.userName === myEmail);
              const rank = r.rank || i + 1;
              const seconds = r.duration ?? r.timeTaken;
              return (
                <li
                  key={`${rank}-${r.userId}-${i}`}
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
                      MEDALS[rank - 1] ?? "border-line bg-inset text-muted"
                    )}
                  >
                    {rank}
                  </span>
                  <Avatar
                    src={`https://i.pravatar.cc/56?img=${(rank * 13) % 60 + 1}`}
                    alt={mine ? "You" : `Rank ${rank} typist`}
                    width={28}
                    height={28}
                    className="h-7 w-7 shrink-0 rounded-full border border-line object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-sm",
                        mine ? "font-extrabold text-accent" : "font-medium"
                      )}
                    >
                      {mine
                        ? "You"
                        : (r.userName ?? `Typist ${r.userId.slice(0, 6) || "—"}`)}
                    </span>
                    {typeof seconds === "number" && (
                      <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] tabular-nums text-faint">
                        <Timer size={11} aria-hidden /> {seconds}s run
                        {typeof r.timeTaken === "number" && r.timeTaken !== seconds
                          ? ` · finished in ${r.timeTaken}s`
                          : ""}
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

          {myRank >= PAGE && (
            <p className="text-center text-[11px] text-faint">
              Your position: #{myRank + 1} · keep loading to see the rows around you
            </p>
          )}

          {nextOffset !== null && (
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-[13px] font-bold text-muted transition hover:bg-chip hover:text-ink disabled:cursor-wait disabled:opacity-60"
            >
              <ChevronDown size={14} aria-hidden />
              {loadingMore ? "Loading…" : `Load more (${total - rows.length} left)`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
