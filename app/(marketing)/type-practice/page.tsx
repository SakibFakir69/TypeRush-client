import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Typing Practice — Daily Drills",
  description:
    "Practise typing daily with timed passages, real quotes and your own text. Track WPM and accuracy over 7, 30 and 90 days and build a streak.",
  alternates: { canonical: "/type-practice" },
};

const MODES = [
  {
    title: "Timed drills",
    body: "15, 30 or 60 seconds against the clock. Short runs sharpen bursts of speed, 60 seconds trains sustained typing.",
  },
  {
    title: "Quotes",
    body: "Real sentences instead of random words, so you practise punctuation, capitals and rhythm.",
  },
  {
    title: "Your own text",
    body: "Paste anything you actually need to type — code, notes, a document — and rehearse it.",
  },
];

const HABITS = [
  "Ten focused minutes beat an hour of distracted typing.",
  "Keep accuracy above 95% before pushing for more speed.",
  "Watch the slow keys, not the average: fix the weakest letters first.",
  "Practise a little every day — the streak counter keeps you honest.",
];

export default function TypePracticePage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Typing practice that shows its work
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Every run you finish is stored, so progress is a measured curve rather
          than a feeling: current WPM, personal best, accuracy and total tests
          on your dashboard, plus a 7/30/90-day chart.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/practice"
            className="rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
          >
            Start practising →
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-lg border border-line px-4 py-2 text-sm font-bold transition hover:bg-chip"
          >
            Compare with others
          </Link>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">Practice modes</h2>
        {MODES.map((m) => (
          <div key={m.title} className="rounded-xl border border-line bg-card p-4">
            <p className="text-sm font-extrabold">{m.title}</p>
            <p className="mt-1 text-[13px] leading-6 text-muted">{m.body}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">Habits that actually move WPM</h2>
        <ul className="space-y-2">
          {HABITS.map((h) => (
            <li
              key={h}
              className="flex gap-2 rounded-xl border border-line bg-inset px-4 py-3 text-[13px] leading-6 text-muted"
            >
              <span className="text-accent">▸</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">Frequently asked questions</h2>
        <details className="rounded-xl border border-line bg-card p-4">
          <summary className="cursor-pointer text-sm font-bold">
            Do practice runs count on the leaderboard?
          </summary>
          <p className="mt-2 text-[13px] leading-6 text-muted">
            Runs at a preset length (15, 30 or 60 seconds) are ranked. Custom
            lengths are practice-only and never posted, so experimenting with a
            different duration cannot pollute a board.
          </p>
        </details>
        <details className="rounded-xl border border-line bg-card p-4">
          <summary className="cursor-pointer text-sm font-bold">
            How often should I practise?
          </summary>
          <p className="mt-2 text-[13px] leading-6 text-muted">
            Daily, even briefly. Your streak and the 90-day curve on the
            dashboard make consistency visible.
          </p>
        </details>
        <details className="rounded-xl border border-line bg-card p-4">
          <summary className="cursor-pointer text-sm font-bold">
            Can I practise my own text?
          </summary>
          <p className="mt-2 text-[13px] leading-6 text-muted">
            Yes — the custom mode accepts any text you paste, up to five minutes
            per run.
          </p>
        </details>
      </section>
    </main>
  );
}
