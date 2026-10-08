import { Card } from "@/components/ui/primitives";
import { SectionShell } from "@/components/ui/SectionShell";

const STATS = [
  ["Best WPM", "123"],
  ["Tests Taken", "56"],
  ["Accuracy", "96%"],
  ["Time Typed", "3h 24m"],
  ["Streak", "🔥 7d"],
];

const ACHIEVEMENTS = [
  ["Speed Demon", "Achieved 100 WPM", "2d ago", "◎"],
  ["Week Warrior", "7-day streak", "5d ago", "⚡"],
  ["Accuracy Master", "98%+ accuracy", "1w ago", "🎯"],
];

export function ProgressSection() {
  return (
    <SectionShell
      id="progress"
      index="06"
      title="Track your progress"
      desc="Detailed insights to help you improve every day."
      action={
        <a
          href="#progress"
          className="inline-block rounded-lg border border-accent/30 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/10"
        >
          View Dashboard →
        </a>
      }
    >
      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <p className="text-sm font-bold">Your Progress</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center sm:grid-cols-5">
            {STATS.map(([k, v]) => (
              <div key={k} className="rounded-lg bg-inset p-2.5">
                <p className="text-[10px] text-muted">{k}</p>
                <p className="mt-0.5 text-sm font-extrabold tabular-nums">{v}</p>
              </div>
            ))}
          </div>
          <svg viewBox="0 0 400 90" className="mt-4 h-24 w-full" aria-hidden>
            <polyline
              points="0,75 30,68 60,60 90,62 120,50 150,45 180,48 210,38 240,35 270,30 300,28 330,20 360,18 400,12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-accent"
            />
            {[[210, 38], [330, 20], [400, 12]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3.5" className="fill-accent" />
            ))}
          </svg>
          <div className="flex justify-between text-[10px] tabular-nums text-faint">
            <span>May 10</span>
            <span>May 24</span>
            <span>Jun 7</span>
            <span>Jun 21</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Recent Achievements</p>
            <a href="#" className="text-xs font-semibold text-accent">
              View All →
            </a>
          </div>
          <ul className="mt-3 space-y-2 text-[13px]">
            {ACHIEVEMENTS.map(([t1, t2, when, icon]) => (
              <li key={t1} className="flex items-center gap-3 rounded-lg bg-inset p-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-600">
                  {icon}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold">{t1}</p>
                  <p className="text-xs text-muted">{t2}</p>
                </div>
                <span className="ml-auto shrink-0 text-[11px] text-muted">{when}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </SectionShell>
  );
}
