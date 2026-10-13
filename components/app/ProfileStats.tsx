"use client";

import Link from "next/link";
import { Crosshair, Gauge, Hash } from "lucide-react";
import { useGetLeaderboardQuery } from "@/lib/features/practice/features.practice";

/** Personal stats derived from your own leaderboard rows. */
export function ProfileStats({ email }: { email: string }) {
  const { data, isLoading } = useGetLeaderboardQuery();
  const mine = (data ?? []).filter((r) => r.userName === email);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2" aria-hidden>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[76px] animate-pulse rounded-xl border border-line bg-inset" />
        ))}
      </div>
    );
  }

  if (mine.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-5 text-center">
        <p className="text-sm font-extrabold">No tests yet</p>
        <p className="mt-1 text-xs text-muted">
          Finish an admin passage and your stats land here.
        </p>
        <Link
          href="/practice"
          className="mt-3 inline-block rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
        >
          Start practicing →
        </Link>
      </div>
    );
  }

  const best = Math.max(...mine.map((r) => r.wpm));
  const avg = Math.round(mine.reduce((s, r) => s + r.accuracy, 0) / mine.length);
  const tiles = [
    { Icon: Hash, label: "Tests taken", value: String(mine.length) },
    { Icon: Gauge, label: "Best WPM", value: String(best) },
    { Icon: Crosshair, label: "Avg accuracy", value: `${avg}%` },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {tiles.map(({ Icon, label, value }) => (
        <div key={label} className="rounded-xl border border-line bg-inset p-3 text-center">
          <span className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-accent/10 text-accent">
            <Icon size={15} strokeWidth={2.2} aria-hidden />
          </span>
          <p className="mt-1.5 text-lg font-black tabular-nums">{value}</p>
          <p className="text-[10px] text-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}
