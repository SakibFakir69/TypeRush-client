import Link from "next/link";
import { TextQuote, Timer, WholeWord } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { SectionShell } from "@/components/ui/SectionShell";

const DURATIONS = ["15s", "30s", "60s", "120s"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const THEMES = ["Motivation", "Wisdom", "Fun"];
const WORDS = ["focus", "speed", "improve", "consistent"];

function CardHead({
  Icon,
  title,
  desc,
}: {
  Icon: typeof Timer;
  title: string;
  desc: string;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
          <Icon size={17} strokeWidth={2.2} aria-hidden />
        </span>
        <p className="text-sm font-bold">{title}</p>
      </div>
      <p className="mt-1.5 text-xs leading-5 text-muted">{desc}</p>
    </>
  );
}

function Pills({ items, active }: { items: string[]; active: string }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5 text-xs" aria-hidden>
      {items.map((x) => (
        <span
          key={x}
          className={
            x === active
              ? "rounded-full border border-accent bg-accent/15 px-3 py-1 font-semibold text-accent"
              : "rounded-full border border-line px-3 py-1 text-muted"
          }
        >
          {x}
          {x === "60s" && (
            <span className="ml-1.5 rounded-full bg-accent px-1.5 py-px text-[9px] font-extrabold text-black">
              POPULAR
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

function ModeLink({ children }: { children: string }) {
  return (
    <Link
      href="/test"
      className="mt-4 inline-block text-xs font-semibold text-accent opacity-80 transition-opacity hover:opacity-100"
    >
      {children} →
    </Link>
  );
}

export function PracticeSection() {
  return (
    <SectionShell
      id="practice"
      index="03"
      title={
        <>
          Practice
          <br />
          your way
        </>
      }
      desc="Choose a mode that matches your goal. Short sprints, word lists, or real quotes."
      action={
        <Link
          href="/test"
          className="inline-block rounded-lg border border-accent/30 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/10"
        >
          Explore Practice →
        </Link>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {/* TIME */}
        <Card className="flex flex-col p-5">
          <CardHead Icon={Timer} title="Time" desc="Race the clock and push your limits." />
          <Pills items={DURATIONS} active="60s" />
          <div className="relative mx-auto mt-5 h-28 w-28" aria-hidden>
            <span className="absolute inset-0 rounded-full border border-line" />
            <span className="absolute inset-2.5 rounded-full border border-line opacity-60" />
            <span className="dial-hand absolute bottom-1/2 left-1/2 -ml-[1px] h-11 w-[2px] rounded-full bg-accent" />
            <span className="absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="mt-8 text-[11px] font-extrabold tabular-nums text-ink">
                60<span className="text-faint">s</span>
              </span>
            </span>
          </div>
          <p className="mt-3 text-center text-[11px] text-faint">
            4 durations · endless retries
          </p>
          <div className="mt-auto">
            <ModeLink>Race a 60s sprint</ModeLink>
          </div>
        </Card>

        {/* WORDS */}
        <Card className="flex flex-col p-5">
          <CardHead Icon={WholeWord} title="Words" desc="Build speed with curated word lists." />
          <Pills items={DIFFICULTIES} active="Medium" />
          <div className="mt-4 space-y-1 font-mono text-sm" aria-hidden>
            {WORDS.map((w, i) => (
              <p
                key={w}
                className="word-cycle rounded px-1.5 py-0.5"
                style={{ animationDelay: `${(i * 1.2).toFixed(1)}s` }}
              >
                {w}
              </p>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-faint">240 words · adaptive order</p>
          <div className="mt-auto">
            <ModeLink>Drill medium words</ModeLink>
          </div>
        </Card>

        {/* QUOTES */}
        <Card className="flex flex-col p-5">
          <CardHead Icon={TextQuote} title="Quotes" desc="Real sentences and themes." />
          <Pills items={THEMES} active="Motivation" />
          <div className="relative mt-4 rounded-lg bg-inset p-3.5">
            <TextQuote
              size={22}
              aria-hidden
              className="absolute -top-2 left-3 rounded-full border border-line bg-card p-0.5 text-accent"
            />
            <p className="font-serif text-sm italic leading-6 text-ink">
              “The secret of getting ahead is getting started.”
            </p>
            <p className="mt-1.5 text-xs text-faint">— Mark Twain</p>
          </div>
          <p className="mt-3 text-[11px] text-faint">18 words · new quote daily</p>
          <div className="mt-auto">
            <ModeLink>Type this quote</ModeLink>
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}
