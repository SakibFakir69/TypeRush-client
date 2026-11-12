import type { Metadata } from "next";
import { ProgressDashboard } from "@/components/app/ProgressDashboard";

export const metadata: Metadata = {
  title: "Progress — TypePotijogita",
  description:
    "Your typing curve, lifetime numbers, unlocks and every run you have logged.",
};

export default function ProgressPage() {
  // Server-computed day key: the streak calculation stays pure (no Date.now()).
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Your <span className="text-accent">Progress</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Every run you finish, measured — the curve, your records, the
          unlocks you earned and the history behind them.
        </p>
      </div>

      <ProgressDashboard today={today} />
    </div>
  );
}
