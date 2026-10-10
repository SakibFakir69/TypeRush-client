import type { Metadata } from "next";
import { LeaderboardSection } from "@/components/landing/LeaderboardSection";

export const metadata: Metadata = {
  title: "Leaderboard — TypeRush",
  description: "Top typists by day, week, month, and all time.",
};

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <LeaderboardSection />
    </div>
  );
}
