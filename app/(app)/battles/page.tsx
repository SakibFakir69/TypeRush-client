import type { Metadata } from "next";
import { BattleSection } from "@/components/landing/BattleSection";

export const metadata: Metadata = {
  title: "1v1 Battles — TypeRush",
  description: "Real-time typing battles against live challengers.",
};

export default function BattlesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <BattleSection />
    </div>
  );
}
