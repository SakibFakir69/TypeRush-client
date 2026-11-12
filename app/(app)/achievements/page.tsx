import type { Metadata } from "next";
import { AchievementBoard } from "@/components/app/AchievementBoard";

export const metadata: Metadata = {
  title: "Achievements — TypePotijogita",
  description: "Badges and milestones — unlocked by your own runs.",
};

export default function AchievementsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Your <span className="text-accent">Achievements</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Badges, streaks and milestones — every one of them unlocked by your
          own runs.
        </p>
      </div>

      <AchievementBoard />
    </div>
  );
}
