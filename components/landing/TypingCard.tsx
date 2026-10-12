"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Maximize, Minimize, Timer } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTypingTest } from "@/hooks/useTypingTest";
import { useAuth } from "@/lib/auth";
import { useSubmitPracticeResultMutation } from "@/lib/features/practice/features.practice";
import { playDemoError, playDemoTick } from "@/lib/keySound";
import { cn } from "@/lib/cn";

function CharView({ typed, target }: { typed: string; target: string }) {
  return (
    <p className="font-mono text-[16px] leading-8 tracking-wide">
      {target.split("").map((ch, i) => {
        let cls = "text-faint";
        if (i < typed.length) {
          cls = typed[i] === ch ? "text-ink" : "rounded bg-rose-500/15 text-rose-500";
        }
        if (i === typed.length) cls += " border-l-2 border-accent pl-px typing-caret";
        return (
          <span key={i} className={cls}>
            {ch}
          </span>
        );
      })}
    </p>
  );
}

export function TypingCard({
  target,
  paragraphId,
}: {
  target: string;
  /** Server passage id — results submit only for admin passages. */
  paragraphId?: string;
}) {
  const {
    typed,
    timeLeft,
    started,
    finished,
    errors,
    accuracy,
    wpm,
    duration,
    setDuration,
    reset,
    onChange,
  } = useTypingTest(target);
  const { user } = useAuth();
  const [submitResult] = useSubmitPracticeResultMutation();
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prevLen = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const reduceMotion = useReducedMotion();
  const focusInput = () => inputRef.current?.focus();

  // Mechanical feedback: tick per keystroke, deeper thock on backspace.
  const handleChange = (v: string) => {
    if (v.length > prevLen.current) playDemoTick(v.length);
    else if (v.length < prevLen.current) playDemoError();
    prevLen.current = v.length;
    onChange(v);
  };

  const resetAll = (d?: number) => {
    prevLen.current = 0;
    setSaved("idle");
    reset(d);
    focusInput();
  };

  // Explicit submit: only the button below calls the API.
  const doSubmit = () => {
    if (saved === "saving" || saved === "saved") return;
    setSaved("saving");

    submitResult({

      paragraphId: paragraphId ?? "",
      wpm,
      accuracy,
      errors,
      timeTaken: duration - timeLeft,
    })
      .unwrap()
      .then(() => setSaved("saved"))
      .catch(() => setSaved("error"));
      console.log("submited")
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    } else {
      cardRef.current?.requestFullscreen().catch(() => { });
    }
  };

  return (
    <div
      ref={cardRef}
      className="h-full rounded-2xl border border-line bg-card p-4"
      onClick={focusInput}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="flex rounded-lg border border-line bg-inset p-1 text-xs"
          role="tablist"
          aria-label="Duration"
        >
          {[60, 30, 15].map((d) => (
            <button
              key={d}
              onClick={(e) => {
                e.stopPropagation();
                setDuration(d);
                resetAll(d);
              }}
              className={cn(
                "rounded-md px-3 py-1.5 font-semibold transition",
                duration === d ? "bg-mint text-black" : "text-muted hover:text-ink"
              )}
            >
              {d}s
            </button>
          ))}
        </div>
        <p className="ml-auto text-[11px] tabular-nums text-faint">
          {typed.length}/{target.length}
        </p>
        <span
          title="Time left"
          aria-live="polite"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs font-extrabold tabular-nums",
            started && !finished && timeLeft <= 10
              ? "animate-pulse border-rose-500/50 text-rose-500"
              : "border-line text-ink"
          )}
        >
          <Timer size={12} aria-hidden />
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen test"}
          className="grid h-7 w-7 place-items-center rounded-md border border-line text-muted transition hover:text-ink"
        >
          {isFullscreen ? (
            <Minimize size={13} aria-hidden />
          ) : (
            <Maximize size={13} aria-hidden />
          )}
        </button>
      </div>

      <div className="relative mt-3 min-h-[148px] cursor-text rounded-xl border border-line bg-inset p-5">
        <CharView typed={typed} target={target} />
        {typed.length === 0 && (
          <p className="mt-4 text-center text-xs text-faint">
            Click anywhere and start typing…
          </p>
        )}
        <input
          ref={inputRef}
          value={typed}
          onChange={(e) => handleChange(e.target.value)}
          className="absolute inset-0 cursor-text opacity-0"
          aria-label="Typing input"
        />
        <AnimatePresence>
          {finished && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-0 grid place-items-center rounded-xl bg-black/70 backdrop-blur-sm"
            >
              <div className="text-center">
                <p className="text-lg font-extrabold text-accent">
                  Test complete — {wpm} WPM
                </p>
                <p className="mt-1 text-xs text-muted">
                  {accuracy}% accuracy · {errors} errors
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {paragraphId && user && saved !== "saved" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        doSubmit();
                      }}
                      disabled={saved === "saving"}
                      className="rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                    >
                      {saved === "error"
                        ? "Retry submit"
                        : saved === "saving"
                          ? "Saving…"
                          : "Submit result"}
                    </button>
                  )}
                  {paragraphId && user && saved === "saved" && (
                    <p className="mt-1.5 text-xs font-bold text-accent">
                      ✓ Result saved to the leaderboard
                    </p>
                  )}
                  {paragraphId && !user && (
                    <p className="mt-1.5 text-xs text-muted">
                      <Link
                        href="/login"
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-accent hover:underline"
                      >
                        Log in
                      </Link>{" "}
                      to save your result
                    </p>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetAll();
                    }}
                    className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink transition hover:bg-chip"
                  >
                    Try again ({duration}s)
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-inset">
        {[
          { label: "WPM", value: started || finished ? String(wpm) : "–", hint: started || finished ? `${duration - timeLeft}s in` : "ready", icon: "bg-accent/10 text-accent", valueCls: "text-accent" },
          { label: "ACCURACY", value: started || finished ? `${accuracy}%` : "–", hint: started || finished ? "live" : "ready", icon: "bg-amber-500/15 text-amber-500", valueCls: "text-amber-500" },
          { label: "ERRORS", value: started || finished ? String(errors) : "–", hint: finished ? "done" : started ? `${timeLeft}s left` : "ready", icon: "bg-rose-500/15 text-rose-500", valueCls: "text-rose-500" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 p-4">
            <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm", s.icon)}>
              ◉
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-muted">{s.label}</p>
              <p className={cn("text-2xl font-extrabold tabular-nums", s.valueCls)}>{s.value}</p>
            </div>
            <span className="ml-auto hidden text-[11px] text-faint sm:block">{s.hint}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
