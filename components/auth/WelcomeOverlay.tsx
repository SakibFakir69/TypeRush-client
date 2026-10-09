"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PartyPopper } from "lucide-react";

const FROM = 3;

/**
 * First-run welcome shown once right after successful registration.
 * Counts 3 → 2 → 1, then continues automatically. Close skips ahead.
 */
export function WelcomeOverlay({
  name,
  onDone,
}: {
  name: string;
  onDone: () => void;
}) {
  const [n, setN] = useState(FROM);

  useEffect(() => {
    if (n <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setN((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [n, onDone]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to TypeRush"
      className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl border border-line bg-card p-8 text-center shadow-[var(--card-shadow)]">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
          <PartyPopper size={26} strokeWidth={2} aria-hidden />
        </span>
        <h2 className="mt-4 text-2xl font-black tracking-tight">
          Welcome to our family{name ? `, ${name}` : ""}!
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Your account is ready. Practice daily, join contests, and climb the
          leaderboard.
        </p>
        <div className="mt-5 grid h-16 place-items-center" aria-hidden>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={n}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.25 }}
              className="font-mono text-5xl font-black tabular-nums text-accent"
            >
              {n}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="text-xs text-faint">Starting in a moment…</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onDone}
            className="flex-1 rounded-lg bg-mint px-4 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
          >
            Start typing →
          </button>
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-muted transition hover:bg-chip hover:text-ink"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
