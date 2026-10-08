"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const DEMO_TEXT = "The quick brown fox jumps over the lazy dog.";
/** Char index → wrong key typed there (then backspaced + fixed). */
const MISTAKES: Record<number, string> = { 12: "x", 33: "q" };

type Frame = {
  text: string;
  bad: boolean;
  errors: number;
  keys: number;
  correct: number;
  elapsed: number;
  delay: number;
};

/**
 * Precompute the loop as frames so playback is a simple timer.
 * `seed` (the loop cycle) varies the rhythm so no two loops feel
 * identical — humans pause on spaces and punctuation.
 */
function buildFrames(seed: number): Frame[] {
  const frames: Frame[] = [];
  let errors = 0;
  let keys = 0;
  let correct = 0;
  let elapsed = 0;
  const push = (f: Omit<Frame, "errors" | "keys" | "correct" | "elapsed">) => {
    elapsed += f.delay / 1000; // delays are ms, elapsed is seconds
    frames.push({ ...f, errors, keys, correct, elapsed });
  };

  for (let i = 0; i < DEMO_TEXT.length; i++) {
    const ch = DEMO_TEXT[i];
    const jitter = ((i * 37 + seed * 53) % 5) * 10;
    const pause = ch === " " ? 60 : ch === "." ? 320 : 0;
    const wrong = MISTAKES[i];
    if (wrong) {
      // Type the wrong key, pause on the error…
      keys += 1;
      errors += 1;
      push({ text: DEMO_TEXT.slice(0, i) + wrong, bad: true, delay: 420 });
      // …backspace and retype correctly.
      push({ text: DEMO_TEXT.slice(0, i), bad: false, delay: 150 });
    }
    keys += 1;
    correct += 1;
    push({
      text: DEMO_TEXT.slice(0, i + 1),
      bad: false,
      delay: 92 + jitter + pause,
    });
  }
  // Hold the finished state (battle CTA) before looping.
  const last = frames[frames.length - 1];
  frames.push({ ...last, delay: 2600 });
  return frames;
}

function statsFor(f: Frame) {
  const minutes = Math.max(f.elapsed / 60, 1 / 60);
  const wpm = Math.min(140, Math.round(f.correct / 5 / minutes));
  const accuracy = f.keys === 0 ? 100 : Math.round((f.correct / f.keys) * 100);
  return { wpm, accuracy, errors: f.errors };
}

const STAT_STYLE = [
  { label: "WPM", icon: "bg-accent/10 text-accent", value: "text-accent" },
  { label: "ACCURACY", icon: "bg-amber-500/15 text-amber-500", value: "text-amber-500" },
  { label: "ERRORS", icon: "bg-rose-500/15 text-rose-500", value: "text-rose-500" },
] as const;

export function DemoTyping() {
  const [cycle, setCycle] = useState(0);
  const frames = useMemo(() => buildFrames(cycle), [cycle]);
  const reduce = useReducedMotion();
  const [frameIdx, setFrameIdx] = useState(0);

  const isLast = frameIdx === frames.length - 1;

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => {
      if (isLast) {
        setFrameIdx(0);
        setCycle((c) => c + 1);
      } else {
        setFrameIdx(frameIdx + 1);
      }
    }, frames[frameIdx].delay);
    return () => clearTimeout(t);
  }, [frames, frameIdx, isLast, reduce]);

  const last = frames[frames.length - 1];
  const f = reduce ? last : frames[frameIdx];
  const done = reduce || isLast;
  const { wpm, accuracy, errors } = statsFor(f);
  const remaining = DEMO_TEXT.slice(f.text.length - (f.bad ? 1 : 0));
  const values = [String(wpm), `${accuracy}%`, String(errors)];

  return (
    <div className="group flex h-full flex-col rounded-2xl border border-line bg-card p-5 transition-colors hover:border-accent/50">
      <div className="flex items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 font-bold text-green-500">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-green-500" />
          LIVE DEMO
        </span>
        <span className="ml-auto text-[11px] text-faint">auto-loops</span>
      </div>

      <Link
        href="/test"
        aria-label="Try the live typing test"
        className="mt-3 block rounded-xl border border-line bg-inset p-5"
      >
        <div className="relative min-h-[118px]">
          <motion.p
            key={cycle}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-[16px] leading-8"
            aria-label={DEMO_TEXT}
          >
            {f.text.split("").map((ch, i) => {
              const isBad = f.bad && i === f.text.length - 1;
              return (
                <span
                  key={`${cycle}-${i}`}
                  className={
                    isBad
                      ? "rounded bg-rose-500/15 text-rose-500"
                      : "text-ink"
                  }
                >
                  {ch}
                </span>
              );
            })}
            {!done && <span className="typing-caret border-l-2 border-accent pl-px" />}
            {remaining && <span className="text-faint">{remaining}</span>}
          </motion.p>

          <AnimatePresence>
            {done && !reduce && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute inset-0 -m-5 grid place-items-center rounded-xl bg-black/55 p-5 backdrop-blur-[1px]"
              >
                <div className="text-center">
                  <p className="text-[11px] font-bold tabular-nums text-white/70">
                    ✓ {wpm} WPM · {accuracy}% accuracy
                  </p>
                  <p className="mt-1 text-xl font-extrabold tracking-tight text-white">
                    Are you ready for battle?
                  </p>
                  <p className="mx-auto mt-2.5 w-fit rounded-full bg-mint px-4 py-1.5 text-sm font-extrabold text-black">
                    Start test →
                  </p>
                  <p className="mt-2 text-[11px] text-white/50">replaying demo…</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>

      <div className="mt-3 grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-inset">
        {STAT_STYLE.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2.5 p-3.5">
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs",
                s.icon
              )}
            >
              ◉
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-muted">
                {s.label}
              </p>
              <p className={cn("text-xl font-extrabold tabular-nums", s.value)}>
                {values[i]}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[13px] font-semibold text-accent opacity-80 transition-opacity group-hover:opacity-100">
        Click anywhere to try it yourself →
      </p>
    </div>
  );
}
