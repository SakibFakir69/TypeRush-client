import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WPM Test — Typing Speed Benchmarks",
  description:
    "Run a free WPM test and compare your typing speed with the average typist. See typical WPM ranges, how accuracy is scored, and how to improve.",
  alternates: { canonical: "/wpm-test" },
};

const BENCHMARKS = [
  { level: "Beginner", wpm: "0 – 25", note: "Still learning the keyboard layout" },
  { level: "Average", wpm: "40", note: "Typical adult typing speed" },
  { level: "Fast", wpm: "60 – 80", note: "Comfortable for office and study work" },
  { level: "Professional", wpm: "80 – 100+", note: "Transcription and competitive typists" },
];

export default function WpmTestPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          WPM test: how fast do you type?
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          WPM stands for words per minute. TypeRush counts one word as five
          characters, so the number reflects raw typing throughput rather than
          the length of the words in a particular passage.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/test"
            className="rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
          >
            Check my WPM →
          </Link>
          <Link
            href="/practice"
            className="rounded-lg border border-line px-4 py-2 text-sm font-bold transition hover:bg-chip"
          >
            Practise instead
          </Link>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">Typical WPM ranges</h2>
        <div className="overflow-hidden rounded-xl border border-line">
          {BENCHMARKS.map((b, i) => (
            <div
              key={b.level}
              className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 ${
                i % 2 ? "bg-inset" : "bg-card"
              }`}
            >
              <span className="w-24 text-sm font-extrabold">{b.level}</span>
              <span className="font-mono text-sm font-bold tabular-nums text-accent">
                {b.wpm} WPM
              </span>
              <span className="text-[12px] text-muted">{b.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">Why accuracy matters as much as speed</h2>
        <p className="text-sm leading-6 text-muted">
          A 100 WPM run at 80% accuracy costs you a correction every fifth
          character, so the real-world speed is lower than the headline number.
          TypeRush ranks runs by WPM first and accuracy second, and every run
          records its errors so you can see both sides of the score.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">Frequently asked questions</h2>
        <details className="rounded-xl border border-line bg-card p-4">
          <summary className="cursor-pointer text-sm font-bold">
            What is a good WPM?
          </summary>
          <p className="mt-2 text-[13px] leading-6 text-muted">
            40 WPM is average, 60 WPM is fast, and above 80 WPM is professional.
            The number that matters most is your own trend over time.
          </p>
        </details>
        <details className="rounded-xl border border-line bg-card p-4">
          <summary className="cursor-pointer text-sm font-bold">
            Does the test include spaces and punctuation?
          </summary>
          <p className="mt-2 text-[13px] leading-6 text-muted">
            Yes. The passage is typed exactly as written, spaces and punctuation
            included, and every mismatch counts as an error.
          </p>
        </details>
        <details className="rounded-xl border border-line bg-card p-4">
          <summary className="cursor-pointer text-sm font-bold">
            Are short runs comparable to 60-second runs?
          </summary>
          <p className="mt-2 text-[13px] leading-6 text-muted">
            Not directly, which is why TypeRush keeps a separate leaderboard for
            each run length. Your 15-second score is ranked with other
            15-second runs only.
          </p>
        </details>
      </section>
    </main>
  );
}
