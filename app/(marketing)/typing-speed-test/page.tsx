import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Typing Speed Test",
  description:
    "Take a free typing speed test and measure your WPM and accuracy in 15, 30 or 60 seconds. See where you rank on the TypePotijogita leaderboard.",
  alternates: { canonical: "/typing-speed-test" },
};

const STEPS = [
  {
    title: "Pick a length",
    body: "15, 30 or 60 seconds. Each length keeps its own leaderboard, so a 60-second score is only compared with other 60-second runs.",
  },
  {
    title: "Type the passage",
    body: "The timer starts on your first keystroke. Mistakes are highlighted live, and backspace works the way it does in any editor.",
  },
  {
    title: "Submit your score",
    body: "Finish the run and save it to see your WPM, accuracy and progress curve on your dashboard.",
  },
];

export default function TypingSpeedTestPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Free typing speed test
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Measure how fast and how accurately you type. TypePotijogita scores every
          run in words per minute (WPM) and accuracy, then keeps a 90-day record
          of your progress so you can see the improvement instead of guessing.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/test"
            className="rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
          >
            Start the test →
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-lg border border-line px-4 py-2 text-sm font-bold transition hover:bg-chip"
          >
            See the leaderboard
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-extrabold">How the test works</h2>
        {STEPS.map((s) => (
          <div key={s.title} className="rounded-xl border border-line bg-card p-4">
            <p className="text-sm font-extrabold">{s.title}</p>
            <p className="mt-1 text-[13px] leading-6 text-muted">{s.body}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">How WPM is calculated</h2>
        <p className="text-sm leading-6 text-muted">
          One word is five characters, including spaces. WPM = (correct
          characters ÷ 5) ÷ minutes elapsed. Accuracy is the share of typed
          characters that matched the passage, so a fast run with many errors
          cannot outrank a clean one on the same board.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">Frequently asked questions</h2>
        <details className="rounded-xl border border-line bg-card p-4">
          <summary className="cursor-pointer text-sm font-bold">
            Is the typing speed test free?
          </summary>
          <p className="mt-2 text-[13px] leading-6 text-muted">
            Yes. The test, the practice modes and the leaderboards are free. An
            account is only needed to save scores and join contests.
          </p>
        </details>
        <details className="rounded-xl border border-line bg-card p-4">
          <summary className="cursor-pointer text-sm font-bold">
            What is a good typing speed?
          </summary>
          <p className="mt-2 text-[13px] leading-6 text-muted">
            40 WPM is the average adult typing speed. 60 WPM is considered fast
            and 80–100 WPM is professional level.
          </p>
        </details>
        <details className="rounded-xl border border-line bg-card p-4">
          <summary className="cursor-pointer text-sm font-bold">
            Should I practise 15, 30 or 60 seconds?
          </summary>
          <p className="mt-2 text-[13px] leading-6 text-muted">
            Short runs measure bursts of speed; 60 seconds is closer to real
            sustained typing. Try all three and compare your own boards.
          </p>
        </details>
      </section>
    </main>
  );
}
