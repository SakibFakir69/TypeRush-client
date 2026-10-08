"use client";

import Link from "next/link";
import { TypingCard } from "@/components/landing/TypingCard";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  ["1", "Pick a duration", "60s for warm-up, 15s for sprints."],
  ["2", "Just start typing", "The timer begins on your first keystroke."],
  ["3", "Read your score", "WPM, accuracy and errors update live."],
] as const;

const TIPS = [
  "WPM = (correct characters ÷ 5) ÷ minutes.",
  "Accuracy counts every keystroke against the text.",
  "Slow down on unfamiliar words — errors cost more than speed gains.",
] as const;

/**
 * Focused test-taking experience: one job per screen,
 * guided steps, zero landing-page clutter.
 */
export function TestExperience() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <Reveal>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[13px] text-muted transition hover:text-accent"
        >
          ← Back to home
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Typing test
        </h1>
        <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
          Pick a duration, click the text box, and type. Your score appears automatically —
          nothing to submit, nothing to configure.
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <ol className="mt-5 grid gap-2 sm:grid-cols-3">
          {STEPS.map(([n, title, desc]) => (
            <li
              key={n}
              className="rounded-xl border border-line bg-card p-4"
            >
              <p className="grid h-7 w-7 place-items-center rounded-full bg-accent/15 text-xs font-extrabold text-accent">
                {n}
              </p>
              <p className="mt-2 text-sm font-bold">{title}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted">{desc}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={0.12} className="mt-4">
        <TypingCard />
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-4 rounded-xl border border-line bg-card p-5">
          <p className="text-sm font-bold">How scoring works</p>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-5 text-muted">
            {TIPS.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="text-accent">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}
