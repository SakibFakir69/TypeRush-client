import { Crosshair, Flame, Trophy, Zap } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { DASH } from "@/lib/dashboard";

const CARDS = [
  {
    Icon: Zap,
    label: "Current WPM",
    value: String(DASH.stats.wpm),
    delta: `↑ ${DASH.stats.wpmDelta}%`,
    sub: `Your best: ${DASH.stats.best}`,
  },
  {
    Icon: Crosshair,
    label: "Accuracy",
    value: `${DASH.stats.accuracy}%`,
    delta: `↑ ${DASH.stats.accDelta}%`,
    sub: "Last 10 tests",
  },
  {
    Icon: Flame,
    label: "Current Streak",
    value: `${DASH.stats.streakDays} days`,
    delta: null,
    sub: "Keep it up!",
  },
  {
    Icon: Trophy,
    label: "Total Points",
    value: DASH.stats.points.toLocaleString(),
    delta: null,
    sub: `Rank #${DASH.stats.rank}`,
  },
];

export function StatCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map(({ Icon, label, value, delta, sub }) => (
        <Card key={label} className="flex items-center gap-3 p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
            <Icon size={20} strokeWidth={2.2} aria-hidden />
          </span>
          <span>
            <span className="block text-[11px] text-muted">{label}</span>
            <span className="block text-2xl font-black tabular-nums">
              {value}{" "}
              {delta && (
                <span className="align-middle text-[11px] font-bold text-accent">
                  {delta}
                </span>
              )}
            </span>
            <span className="block text-[11px] text-faint">{sub}</span>
          </span>
        </Card>
      ))}
    </div>
  );
}
