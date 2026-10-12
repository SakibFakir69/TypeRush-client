import type { Metadata } from "next";
import { Card } from "@/components/ui/primitives";
import { LiveBoard } from "@/components/app/LiveBoard";

export const metadata: Metadata = {
  title: "Leaderboard — TypeRush",
  description: "Live ranks shaped by submitted test results.",
};

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Top <span className="text-accent">Typists</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Live board — every submitted test moves it.
        </p>
      </div>
      <Card className="p-4 sm:p-5">
        <LiveBoard />
      </Card>
    </div>
  );
}
