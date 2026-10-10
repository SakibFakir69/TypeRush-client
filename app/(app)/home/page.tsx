import type { Metadata } from "next";
import { DashboardHero } from "@/components/app/Hero";
import { StatCards } from "@/components/app/Stats";
import { QuickPractice } from "@/components/app/QuickPractice";
import { ProgressChart } from "@/components/app/ProgressChart";
import { UpcomingContests } from "@/components/app/Contests";
import {
  AchievementsRow,
  ActivityFeed,
  FriendsCard,
  MiniLeaderboard,
  ProfileCard,
} from "@/components/app/Rail";
import { getSessionUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Home — TypeRush",
  description: "Your TypeRush dashboard: practice, battles, contests, and ranks.",
};

/** Member dashboard. The (app) layout already enforced the session. */
export default async function DashboardPage() {
  const user = await getSessionUser();
  const raw =
    (typeof user?.name === "string" && user.name) ||
    (typeof user?.fullName === "string" && user.fullName) ||
    "typist";
  const name = raw.trim().split(/\s+/)[0] || "typist";

  return (
    <div className="space-y-4">
      <DashboardHero name={name} />
      <StatCards />
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <QuickPractice />
            <ProgressChart />
          </div>
          <UpcomingContests />
        </div>
        <div className="min-w-0 space-y-4">
          <ProfileCard name={name} />
          <MiniLeaderboard />
          <ActivityFeed />
          <AchievementsRow />
          <FriendsCard />
        </div>
      </div>
    </div>
  );
}
