import type { Metadata } from "next";
import { Award, Crosshair, Flame, Swords, Zap } from "lucide-react";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Achievements — TypeRush",
  description: "Badges you have earned and ones to chase.",
};

const ALL = [
  { Icon: Zap, name: "Speed Demon", desc: "Hit 100 WPM in any test", xp: "+50 XP", won: true },
  { Icon: Crosshair, name: "Accuracy Master", desc: "Hold 98%+ across 10 tests", xp: "+40 XP", won: true },
  { Icon: Flame, name: "Consistent Typist", desc: "Practice 7 days in a row", xp: "+30 XP", won: true },
  { Icon: Swords, name: "Battle Ready", desc: "Win your first 1v1 battle", xp: "+50 XP", won: true },
  { Icon: Award, name: "Contest Champion", desc: "Win a weekly contest", xp: "+100 XP", won: false },
  { Icon: Zap, name: "Lightning Fingers", desc: "Hit 150 WPM in any test", xp: "+80 XP", won: false },
];

export default function AchievementsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Achievements</h1>
        <p className="mt-1 text-sm text-muted">4 of 6 unlocked — keep typing.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ALL.map(({ Icon, name, desc, xp, won }) => (
          <Card key={name} className="flex items-center gap-3 p-4">
            <span
              className={
                won
                  ? "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-400"
                  : "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-inset text-faint"
              }
            >
              <Icon size={19} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold">{name}</span>
              <span className="block text-xs text-muted">{desc}</span>
              <span className="mt-0.5 block text-[11px] font-bold tabular-nums text-accent">
                {won ? xp : "Locked"}
              </span>
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
