import type { Metadata } from "next";
import { DashboardHero } from "@/components/app/Hero";
import { StatCards } from "@/components/app/Stats";
import { QuickPractice } from "@/components/app/QuickPractice";
import { ProgressChart } from "@/components/app/ProgressChart";
import { UpcomingContests } from "@/components/app/Contests";
import { RecentBattles } from "@/components/app/RecentBattles";
import {
  AchievementsRow,
  ActivityFeed,
  MiniLeaderboard,
  ProfileCard,
} from "@/components/app/Rail";
import { getSessionUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Home — TypePotijogita",
  description: "Your TypePotijogita dashboard: practice, battles, contests, and ranks.",
};

/** Member dashboard. The (app) layout already enforced the session. */
export default async function DashboardPage() {
  const user = await getSessionUser();
  const raw =
    (typeof user?.name === "string" && user.name) ||
    (typeof user?.fullName === "string" && user.fullName) ||
    "typist";
  const name = raw.trim().split(/\s+/)[0] || "typist";
  // Server-computed day key: keeps the client chart render pure (no Date.now()).
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <DashboardHero name={name} />
      <StatCards today={today} />
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <QuickPractice />
            <ProgressChart today={today} />
          </div>
          <UpcomingContests />
        </div>
        <div className="min-w-0 space-y-4">
          <ProfileCard name={name} today={today} />
          <RecentBattles />
          <MiniLeaderboard />
          <ActivityFeed />
          <AchievementsRow today={today} />
        </div>
      </div>
    </div>
  );
}
