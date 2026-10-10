import type { Metadata } from "next";
import Link from "next/link";
import { Swords } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Friends — TypeRush",
  description: "Race friends and answer their challenges.",
};

const FRIENDS = [
  { name: "Alex Carter", wpm: 182, img: 12 },
  { name: "Maria Garcia", wpm: 176, img: 32 },
  { name: "James Lee", wpm: 168, img: 53 },
  { name: "Sakib", wpm: 124, img: 11 },
  { name: "Tanvir Hasan", wpm: 102, img: 59 },
];

export default function FriendsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Friends</h1>
          <p className="mt-1 text-sm text-muted">12 friends · 3 racing now</p>
        </div>
        <Link
          href="/test"
          className="ml-auto rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
        >
          Find Friends →
        </Link>
      </div>
      <Card className="divide-y divide-line p-2">
        {FRIENDS.map((f) => (
          <div key={f.name} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-chip">
            <Avatar
              src={`https://i.pravatar.cc/64?img=${f.img}`}
              alt={f.name}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{f.name}</span>
              <span className="block font-mono text-[11px] tabular-nums text-accent">
                {f.wpm} WPM
              </span>
            </span>
            <Link
              href="/test"
              className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-bold transition hover:border-accent/50 hover:text-accent"
            >
              <Swords size={13} aria-hidden /> Challenge
            </Link>
          </div>
        ))}
      </Card>
    </div>
  );
}
