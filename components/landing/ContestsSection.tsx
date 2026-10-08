import { Card } from "@/components/ui/primitives";
import { SectionShell } from "@/components/ui/SectionShell";

export function ContestsSection() {
  return (
    <SectionShell
      id="contests"
      index="05 — B"
      title="Weekly TypeRush contest"
      desc="Compete with typists around the world and win exciting rewards."
      action={
        <a
          href="#contests"
          className="inline-block rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
        >
          Join Weekly Contest →
        </a>
      }
    >
      <Card className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold">Weekly TypeRush</p>
            <span className="rounded-full bg-inset px-2.5 py-1 text-[10px] tabular-nums text-muted">
              Ends in 3d 14h 22m
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
            {[
              ["Top 100", "Get rewards"],
              ["7 Days", "Competition"],
              ["No Entry Fee", "Just type & win"],
            ].map(([a, b]) => (
              <div key={a} className="rounded-lg bg-inset p-3">
                <p className="font-bold text-ink">{a}</p>
                <p className="mt-0.5 text-muted">{b}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid h-32 w-full place-items-center rounded-xl bg-gradient-to-b from-accent/15 to-transparent text-6xl sm:w-40">
          🏆
        </div>
      </Card>
    </SectionShell>
  );
}
