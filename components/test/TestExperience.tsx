"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlignLeft,
  ChevronLeft,
  ChevronRight,
  PenLine,
  Shuffle,
  TextQuote,
  WholeWord,
  type LucideIcon,
} from "lucide-react";
import {
  LANGS,
  PARAGRAPHS,
  QUOTES,
  WORDS,
  type Lang,
} from "@/lib/practice";
import { TypingCard } from "@/components/landing/TypingCard";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const KIND_META: Array<{ id: "Paragraphs" | "Words" | "Quotes" | "Custom"; Icon: LucideIcon }> = [
  { id: "Paragraphs", Icon: AlignLeft },
  { id: "Words", Icon: WholeWord },
  { id: "Quotes", Icon: TextQuote },
  { id: "Custom", Icon: PenLine },
];

const LANG_SUB: Record<Lang, string> = { en: "", bn: "Bangla", hi: "Hindi" };

const STEPS = [
  ["1", "Pick a duration", "60s for warm-up, 15s for sprints."],
  ["2", "Just start typing", "The timer begins on your first keystroke."],
  ["3", "Read your score", "WPM, accuracy and errors update live."],
] as const;

function shuffleWords(text: string, seed: number) {
  const words = text.split(" ").filter(Boolean);
  const out = [...words];
  let s = seed * 9973 + 7;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join(" ");
}

function Pager({
  label,
  onPrev,
  onNext,
  onShuffle,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
}) {
  const btn =
    "grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-ink";
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={onPrev} aria-label="Previous text" className={btn}>
        <ChevronLeft size={15} aria-hidden />
      </button>
      <button type="button" onClick={onNext} aria-label="Next text" className={btn}>
        <ChevronRight size={15} aria-hidden />
      </button>
      <button type="button" onClick={onShuffle} aria-label="Random text" className={btn}>
        <Shuffle size={14} aria-hidden />
      </button>
      <span className="ml-1 text-xs tabular-nums text-faint">{label}</span>
    </div>
  );
}

/**
 * Minimal practice page: pick a language, pick content, type.
 * English + Bangla + Hindi; paragraphs, words, quotes, custom.
 */
export function TestExperience() {
  const [lang, setLang] = useState<Lang>("en");
  const [kind, setKind] = useState<(typeof KIND_META)[number]["id"]>("Paragraphs");
  const [idx, setIdx] = useState(0);
  const [wordSeed, setWordSeed] = useState(1);
  const [draft, setDraft] = useState("");
  const [applied, setApplied] = useState("");
  const [applyCount, setApplyCount] = useState(0);
  // First-visit onboarding: the guide shows once, then stays hidden.
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        if (!window.localStorage.getItem("typerush-visited")) {
          setShowIntro(true);
          window.localStorage.setItem("typerush-visited", "1");
        }
      } catch {
        setShowIntro(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const paragraphs = PARAGRAPHS[lang];
  const quotes = QUOTES[lang];
  const wordsTarget = useMemo(
    () => shuffleWords(WORDS[lang], wordSeed),
    [lang, wordSeed]
  );

  const step = (dir: 1 | -1, len: number) =>
    setIdx((i) => (i + dir + len) % len);
  const random = (len: number) =>
    setIdx((i) => (i + 1 + Math.floor(Math.random() * (len - 1))) % len);

  const langMeta = LANGS.find((l) => l.id === lang);

  let target = "";
  let targetKey = "";
  let context: ReactNode = null;

  if (kind === "Paragraphs") {
    const i = idx % paragraphs.length;
    target = paragraphs[i];
    targetKey = `p-${lang}-${i}`;
    context = (
      <div>
        <Pager
          label={`Paragraph ${i + 1} of ${paragraphs.length}`}
          onPrev={() => step(-1, paragraphs.length)}
          onNext={() => step(1, paragraphs.length)}
          onShuffle={() => random(paragraphs.length)}
        />
        <div
          aria-hidden
          className="mt-2 h-1 w-44 overflow-hidden rounded-full bg-chip"
        >
          <div
            className="h-full rounded-full bg-accent/70"
            style={{ width: `${Math.round(((i + 1) / paragraphs.length) * 100)}%` }}
          />
        </div>
      </div>
    );
  } else if (kind === "Words") {
    target = wordsTarget;
    targetKey = `w-${lang}-${wordSeed}`;
    context = (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setWordSeed((s) => s + 1)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-ink"
        >
          <Shuffle size={13} aria-hidden /> Shuffle words
        </button>
        <span className="text-xs text-faint">40 common words</span>
      </div>
    );
  } else if (kind === "Quotes") {
    const i = idx % quotes.length;
    const q = quotes[i];
    target = q.text;
    targetKey = `q-${lang}-${i}`;
    context = (
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Pager
            label={`Quote ${i + 1} of ${quotes.length} — ${q.author}`}
            onPrev={() => step(-1, quotes.length)}
            onNext={() => step(1, quotes.length)}
            onShuffle={() => random(quotes.length)}
          />
        </div>
        <div
          aria-hidden
          className="mt-2 h-1 w-44 overflow-hidden rounded-full bg-chip"
        >
          <div
            className="h-full rounded-full bg-accent/70"
            style={{ width: `${Math.round(((i + 1) / quotes.length) * 100)}%` }}
          />
        </div>
      </div>
    );
  } else {
    target = applied;
    targetKey = `c-${applyCount}`;
    context = (
      <div className="flex flex-col gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Paste your own text here…"
          aria-label="Custom practice text"
          className="w-full resize-y rounded-xl border border-line bg-inset p-3 text-sm leading-6 text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none"
        />
        <div>
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={() => {
              setApplied(draft.trim());
              setApplyCount((c) => c + 1);
            }}
            className="rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Use this text
          </button>
        </div>
      </div>
    );
  }

  const langLabel = LANGS.find((l) => l.id === lang)?.label ?? lang;
  const summary =
    kind === "Paragraphs"
      ? `${langLabel} · Paragraph ${(idx % paragraphs.length) + 1} of ${paragraphs.length}`
      : kind === "Words"
        ? `${langLabel} · Words · set #${wordSeed}`
        : kind === "Quotes"
          ? `${langLabel} · Quote ${(idx % quotes.length) + 1} of ${quotes.length}`
          : applied
            ? `Custom text · ${applied.length} chars`
            : "Custom text · nothing applied yet";

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Reveal>
        <div className="flex items-center justify-between">
          <Link
            href="/"
            title="Back to home (press H)"
            className="inline-flex items-center gap-1 text-[13px] text-muted transition hover:text-accent"
          >
            ← Back to home
            <kbd
              aria-hidden
              className="rounded border border-line bg-chip px-1 text-[10px] tabular-nums text-faint"
            >
              H
            </kbd>
          </Link>
          {!showIntro && (
            <button
              type="button"
              onClick={() => setShowIntro(true)}
              className="text-xs font-semibold text-muted transition hover:text-accent"
            >
              How it works?
            </button>
          )}
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Typing test
        </h1>
        <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
          Pick a language, pick a text, start typing. The timer begins on
          your first keystroke.
        </p>
        {showIntro && (
          <div>
            <ol className="mt-4 grid gap-2 sm:grid-cols-3">
              {STEPS.map(([n, title, desc]) => (
                <li
                  key={n}
                  className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-3.5 py-2.5"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-[11px] font-extrabold text-accent">
                    {n}
                  </span>
                  <span>
                    <span className="block text-[13px] font-bold">{title}</span>
                    <span className="block text-[11px] leading-4 text-muted">{desc}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-1.5 text-right">
              <button
                type="button"
                onClick={() => setShowIntro(false)}
                className="text-[11px] font-semibold text-faint transition hover:text-muted"
              >
                Got it, hide guide
              </button>
            </div>
          </div>
        )}
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-5 rounded-2xl border border-line bg-card p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-faint">
              Language
            </span>
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLang(l.id)}
                aria-pressed={lang === l.id}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] transition",
                  lang === l.id
                    ? "bg-mint font-bold text-black"
                    : "text-muted hover:text-ink"
                )}
              >
                {l.label}
                {LANG_SUB[l.id] && (
                  <span
                    className={cn(
                      "ml-1 text-[11px]",
                      lang === l.id ? "text-black/60" : "text-faint"
                    )}
                  >
                    {LANG_SUB[l.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-line pt-2.5">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-faint">
              Content
            </span>
            {KIND_META.map(({ id, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setKind(id)}
                aria-pressed={kind === id}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] transition",
                  kind === id
                    ? "bg-chip font-bold text-ink"
                    : "text-muted hover:text-ink"
                )}
              >
                <Icon size={14} aria-hidden />
                {id}
              </button>
            ))}
          </div>
          <div className="mt-2.5 border-t border-line pt-2.5">{context}</div>
          <p className="mt-2.5 border-t border-line pt-2.5 text-xs text-muted">
            Practicing: <span className="font-bold text-ink">{summary}</span>
            {langMeta?.hint && (
              <span className="text-faint"> · {langMeta.hint}</span>
            )}
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="mt-4">
        {kind === "Custom" && !applied ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-line p-10 text-center">
            <p className="max-w-xs text-sm leading-6 text-muted">
              Paste any text above and press{" "}
              <span className="font-bold text-ink">Use this text</span> — up
              to 2000 characters, any language.
            </p>
          </div>
        ) : (
          <TypingCard key={targetKey} target={target} />
        )}
      </Reveal>

      <Reveal delay={0.05}>
        <details className="group mt-4 rounded-xl border border-line bg-card px-4 py-3">
          <summary className="cursor-pointer list-none text-[13px] font-bold text-muted transition group-hover:text-ink">
            How scoring works
          </summary>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-5 text-muted">
            <li className="flex gap-2">
              <span className="text-accent">✓</span> WPM = (correct characters
              ÷ 5) ÷ minutes.
            </li>
            <li className="flex gap-2">
              <span className="text-accent">✓</span> Accuracy counts every
              keystroke against the text.
            </li>
            <li className="flex gap-2">
              <span className="text-accent">✓</span> Slow down on unfamiliar
              words — errors cost more than speed gains.
            </li>
          </ul>
        </details>
      </Reveal>
    </div>
  );
}
