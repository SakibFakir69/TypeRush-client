"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Maximize, Minimize, Timer } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { useTypingTest } from "@/hooks/useTypingTest";
import { useAuth } from "@/lib/auth";
import { useSubmitPracticeResultMutation } from "@/lib/features/practice/features.practice";
import { useSubmitContestResultMutation } from "@/lib/features/contest/features.contest";
import { getApiError } from "@/helper/error-helper";
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

/** Preset durations, in seconds. */
const PRESETS = [60, 30, 15] as const;
/** Custom runs are capped at 5 minutes. */
const MAX_CUSTOM_SECONDS = 300;
const MIN_CUSTOM_SECONDS = 5;

export function TypingCard({
  target,
  paragraphId,
  contest,
  unranked = false,
}: {
  target: string;
  /** Server passage id. Optional: arena runs also record a result. */
  paragraphId?: string;
  /**
   * Contest run: the length is fixed by the contest and the result posts to
   * `POST /contests/:id/submit` instead of the practice leaderboard.
   */
  contest?: {
    id: string;
    seconds: number;
    onSubmitted?: () => void;
  };
  /** Practice-only text (your own / pasted): never submitted anywhere. */
  unranked?: boolean;
}) {
  const contestSeconds =
    contest && contest.seconds > 0 ? Math.round(contest.seconds) : null;
  const isContest = contestSeconds !== null;
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
  } = useTypingTest(target, contestSeconds ?? 60);
  const { user } = useAuth();
  const [submitResult] = useSubmitPracticeResultMutation();
  const [submitContest] = useSubmitContestResultMutation();
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prevLen = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Custom duration: any 5 s – 5 min length. Runs at a custom length are
  // unranked, so they are never submitted to the leaderboard.
  const [customMode, setCustomMode] = useState(false);
  const [customDraft, setCustomDraft] = useState("120");
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

  /**
   * Custom length: clamped to 5 s – 5 min. Custom runs are practice-only,
   * so they never reach the leaderboard.
   */
  const applyCustom = (raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      // Bad input: fall back to the length that is actually running.
      setCustomDraft(String(duration));
      return;
    }
    const seconds = Math.min(
      MAX_CUSTOM_SECONDS,
      Math.max(MIN_CUSTOM_SECONDS, Math.round(n))
    );
    setCustomDraft(String(seconds));
    setCustomMode(true);
    resetAll(seconds);
  };

  const pickPreset = (d: number) => {
    setCustomMode(false);
    setDuration(d);
    resetAll(d);
  };

  // Explicit submit: only the button below calls the API.
  const doSubmit = () => {
    // Practice-only runs (own text, custom length) are never comparable, so
    // they never reach the leaderboard.
    if (customMode || unranked) return;
    if (saved === "saving" || saved === "saved") return;
    setSaved("saving");

    const body = {
      wpm,
      accuracy,
      errors,
      timeTaken: duration - timeLeft,
    };

    const request =
      contest && contestSeconds !== null
        ? submitContest({ id: contest.id, ...body })
        : submitResult({
            ...(paragraphId ? { paragraphId } : {}),
            ...body,
            // Run length — the leaderboard groups boards by this category.
            duration,
          });

    request
      .unwrap()
      .then(() => {
        setSaved("saved");
        toast.success(
          isContest
            ? "Sent to the contest leaderboard."
            : "Saved — it counts towards your progress."
        );
        // Let the contest page refresh its leaderboard.
        if (contest) contest.onSubmitted?.();
      })
      .catch((e: unknown) => {
        setSaved("error");
        toast.error(getApiError(e));
      });
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

  // Ranked = logged in at a preset length. A passage is not required:
  // arena runs (words / quotes / custom text) are recorded too, so the
  // dashboard has real data even before the practice bank is filled.
  const ranked = Boolean(user) && !customMode && !unranked;
  // A contest run submits for any signed-in participant — no passage needed.
  const canSubmit = isContest ? Boolean(user) : ranked;

  return (
    <div
      ref={cardRef}
      className="h-full rounded-2xl border border-line bg-card p-4"
      onClick={focusInput}
    >
      <div className="flex flex-wrap items-center gap-2">
        {isContest ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-bold text-emerald-500">
            <Timer size={12} aria-hidden />
            Contest run · {duration}s
          </span>
        ) : (
          <>
        <div
          className="flex items-center rounded-lg border border-line bg-inset p-1 text-xs"
          role="tablist"
          aria-label="Duration"
        >
          {PRESETS.map((d) => (
            <button
              key={d}
              onClick={(e) => {
                e.stopPropagation();
                pickPreset(d);
              }}
              aria-pressed={!customMode && duration === d}
              className={cn(
                "rounded-md px-3 py-1.5 font-semibold transition",
                !customMode && duration === d
                  ? "bg-mint text-black"
                  : "text-muted hover:text-ink"
              )}
            >
              {d}s
            </button>
          ))}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              applyCustom(customDraft);
            }}
            aria-pressed={customMode}
            aria-label="Custom duration"
            title="Custom length — up to 5 minutes (unranked)"
            className={cn(
              "rounded-md px-3 py-1.5 font-semibold transition",
              customMode ? "bg-mint text-black" : "text-muted hover:text-ink"
            )}
          >
            {customMode ? `${duration}s` : "Custom"}
          </button>
        </div>
        {customMode && (
          <label
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-inset px-2 py-1 text-[11px] text-muted"
          >
            <input
              type="number"
              inputMode="numeric"
              min={MIN_CUSTOM_SECONDS}
              max={MAX_CUSTOM_SECONDS}
              step={5}
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              onBlur={(e) => applyCustom(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  applyCustom(e.currentTarget.value);
                }
              }}
              aria-label="Custom duration in seconds (max 300)"
              className="w-14 bg-transparent text-center font-mono text-xs font-bold text-ink focus:outline-none"
            />
            s
            <span className="text-faint">· max 5 min</span>
          </label>
        )}
        {customMode && (
          <span
            title="Custom-length runs are practice only — they are not saved to the leaderboard."
            className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500"
          >
            Unranked
          </span>
        )}
          </>
        )}
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
                  {canSubmit && saved !== "saved" && (
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
                  {canSubmit && saved === "saved" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resetAll();
                      }}
                      className="rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
                    >
                      Try again ({duration}s)
                    </button>
                  )}
                  {!user && !customMode && !unranked && (
                    <p className="text-xs text-muted">
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
                  {!canSubmit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resetAll();
                      }}
                      className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink transition hover:bg-chip"
                    >
                      Try again ({duration}s)
                    </button>
                  )}
                </div>
                {canSubmit && saved === "saved" && (
                  <p className="mt-1.5 text-xs font-bold text-accent">
                    ✓ Result saved to the{" "}
                    {isContest ? "contest leaderboard" : "leaderboard"}
                  </p>
                )}
                {unranked && (
                  <p className="mt-1.5 max-w-xs text-xs text-muted">
                    Practice only — your own text isn&apos;t saved or ranked.
                  </p>
                )}
                {customMode && !unranked && (
                  <p className="mt-1.5 max-w-xs text-xs text-muted">
                    Custom length — practice only. Pick 15s, 30s or 60s to post
                    a ranked score.
                  </p>
                )}
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
