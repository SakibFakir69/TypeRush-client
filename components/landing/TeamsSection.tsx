import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import {
  BarChart3,
  Check,
  ChevronRight,
  ClipboardList,
  UserPlus,
} from "lucide-react";
import { Card } from "@/components/ui/primitives";

const CREATE_CHIPS = ["Paragraph Competition", "3 Minutes", "All Participants"];

const INVITES = [
  { name: "Alex Johnson", img: 16 },
  { name: "Maria Garcia", img: 25 },
  { name: "James Lee", img: 41 },
];

const PODIUM = [
  { rank: "2nd", name: "Alex", cls: "border-sky-500/50 bg-sky-500/10 text-sky-500" },
  { rank: "1st", name: "Sakib", cls: "border-amber-500/50 bg-amber-500/10 text-amber-500" },
  { rank: "3rd", name: "Mia", cls: "border-orange-500/50 bg-orange-500/10 text-orange-500" },
];

export function TeamsSection() {
  return (
    <section id="teams" className="scroll-mt-20">
      <Card className="p-5 sm:p-8">
        <h2 className="text-center text-2xl font-black tracking-tight sm:text-3xl">
          Built for teams <span className="text-accent">& organizations</span>
        </h2>
        <p className="mt-1.5 text-center text-[13px] text-muted">
          Create contests, invite participants, and track results in real time.
        </p>

        <div className="mx-auto mt-6 grid max-w-4xl gap-2 sm:grid-cols-3">
          {/* CREATE */}
          <div className="relative rounded-xl border border-line bg-inset p-4">
            <span className="mx-auto grid h-10 w-10 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
              <ClipboardList size={18} strokeWidth={2.2} aria-hidden />
            </span>
            <p className="mt-2 text-center text-sm font-extrabold">Create Contest</p>
            <p className="mt-0.5 text-center text-[11px] leading-4 text-muted">
              Set rules, duration, and participants.
            </p>
            <ul className="mt-3 space-y-1.5 text-left text-xs">
              {CREATE_CHIPS.map((c) => (
                <li
                  key={c}
                  className="rounded-lg border border-line bg-card px-3 py-2 text-muted"
                >
                  {c}
                </li>
              ))}
            </ul>
            <span
              aria-hidden
              className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-line bg-card text-accent sm:grid"
            >
              <ChevronRight size={13} strokeWidth={2.5} />
            </span>
          </div>

          {/* INVITE */}
          <div className="relative rounded-xl border border-line bg-inset p-4">
            <span className="mx-auto grid h-10 w-10 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
              <UserPlus size={18} strokeWidth={2.2} aria-hidden />
            </span>
            <p className="mt-2 text-center text-sm font-extrabold">Invite Participants</p>
            <p className="mt-0.5 text-center text-[11px] leading-4 text-muted">
              Share a link and invite anyone to join.
            </p>
            <ul className="mt-3 space-y-1.5">
              {INVITES.map((p) => (
                <li
                  key={p.name}
                  className="flex items-center gap-2 rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs"
                >
                  <Avatar
                    src={`https://i.pravatar.cc/48?img=${p.img}`}
                    alt={p.name}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full border border-line object-cover"
                  />
                  <span className="truncate font-medium">{p.name}</span>
                  <span className="ml-auto grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                    <Check size={12} strokeWidth={3} aria-hidden />
                  </span>
                </li>
              ))}
            </ul>
            <span
              aria-hidden
              className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-line bg-card text-accent sm:grid"
            >
              <ChevronRight size={13} strokeWidth={2.5} />
            </span>
          </div>

          {/* TRACK */}
          <div className="rounded-xl border border-line bg-inset p-4">
            <span className="mx-auto grid h-10 w-10 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
              <BarChart3 size={18} strokeWidth={2.2} aria-hidden />
            </span>
            <p className="mt-2 text-center text-sm font-extrabold">Track Results</p>
            <p className="mt-0.5 text-center text-[11px] leading-4 text-muted">
              Live rankings and detailed performance.
            </p>
            <ul className="mt-3 space-y-1.5">
              {PODIUM.map((p) => (
                <li
                  key={p.rank}
                  className="flex items-center gap-2 rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs"
                >
                  <span
                    className={`rounded-md border px-1.5 py-0.5 text-[10px] font-black tabular-nums ${p.cls}`}
                  >
                    {p.rank}
                  </span>
                  <span className="font-medium">{p.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/test"
            title="Start a Team Contest (press G)"
            className="inline-block rounded-lg bg-mint px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
          >
            Start a Team Contest
            <kbd
              aria-hidden
              className="ml-1.5 rounded border border-black/20 bg-black/10 px-1 text-[10px] tabular-nums text-black/60"
            >
              G
            </kbd>{" "}
            →
          </Link>
        </div>
      </Card>
    </section>
  );
}
