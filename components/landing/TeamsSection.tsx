import { Card } from "@/components/ui/primitives";
import { SectionShell } from "@/components/ui/SectionShell";

const COLS: Array<[string, string, string[]]> = [
  [
    "Create Contest",
    "Set rules, duration, and participants.",
    ["Paragraph Competition", "3 Minutes", "All Participants"],
  ],
  [
    "Invite Participants",
    "Share a link and invite anyone to join.",
    ["Alex Johnson ✓", "Maria Garcia ✓", "James Lee ✓"],
  ],
  [
    "Track Results",
    "Live rankings and detailed performance.",
    ["🥈 2nd — Alex", "🥇 1st — Sakib", "🥉 3rd — Mia"],
  ],
];

export function TeamsSection() {
  return (
    <SectionShell
      id="teams"
      index="07"
      title={
        <>
          Built for teams
          <br />& organizations
        </>
      }
      desc="Create contests, invite participants, and track results in real time."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {COLS.map(([title, desc, items]) => (
          <Card key={title} className="p-5">
            <p className="text-sm font-bold text-accent">◈ {title}</p>
            <p className="mt-1 text-xs leading-5 text-muted">{desc}</p>
            <ul className="mt-3 space-y-1.5 text-xs">
              {items.map((it) => (
                <li
                  key={it}
                  className="rounded-lg border border-line bg-inset px-3 py-2 text-muted"
                >
                  {it}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}
