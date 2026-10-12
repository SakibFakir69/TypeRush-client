import type { Metadata } from "next";
import { ComingSoon } from "@/components/app/ComingSoon";

export const metadata: Metadata = {
  title: "Achievements — TypeRush",
  description: "Badges and milestones. Coming soon.",
};

export default function AchievementsPage() {
  return (
    <ComingSoon
      title="Achievements"
      desc="Badges, streaks, and XP are being minted. Stay with us."
    />
  );
}
