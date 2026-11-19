"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { useGetParagraphsQuery } from "@/lib/features/practice/features.practice";
import { cn } from "@/lib/cn";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

const MODES = [
  { kind: "Words", label: "Word shuffle", desc: "40+ words · warm-ups" },
  { kind: "Quotes", label: "Quotes", desc: "Wisdom · accuracy" },
  { kind: "Custom", label: "Custom text", desc: "Paste anything" },
];

export default function PracticeHubPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const { data, isLoading, isError, refetch } = useGetParagraphsQuery({
    limit: 50,
  });

  const q = search.trim().toLowerCase();
  const items = (data?.items ?? []).filter((p) => {
    const okDiff = difficulty === "All" || p.difficulty === difficulty;
    const okText =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return okDiff && okText;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
          Train your way
        </p>
        <h1 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">
          Practice hub
        </h1>
        <p className="mt-1 text-sm text-muted">
          Fresh passages uploaded by admins
          {data ? ` · ${data.total} in the bank` : ""}. Every keystroke counts
          toward your curve.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-inset px-3 py-2">
          <Search size={14} aria-hidden className="shrink-0 text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search passages, topics…"
            aria-label="Search passages"
            className="w-full bg-transparent text-[13px] text-ink placeholder:text-faint focus:outline-none"
          />
        </label>
        <div className="flex gap-1.5" role="group" aria-label="Difficulty">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              aria-pressed={difficulty === d}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs transition",
                difficulty === d
                  ? "bg-chip font-bold text-ink"
                  : "text-muted hover:text-ink"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              aria-hidden
              className="h-36 animate-pulse rounded-2xl border border-line bg-card"
            />
          ))}
        </div>
      ) : isError || !data ? (
        <Card className="p-8 text-center">
          <p className="text-base font-extrabold">Practice bank unreachable</p>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted">
            Couldn&apos;t load admin passages. Check your connection — or warm up
            with the offline bank instead.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-line px-4 py-2 text-sm font-bold transition hover:bg-chip"
            >
              Retry
            </button>
            <Link
              href="/test"
              className="rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
            >
              Offline bank →
            </Link>
          </div>
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-base font-extrabold">Nothing matches</p>
          <p className="mt-1 text-[13px] text-muted">
            Try a different search or difficulty.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((p) => (
            <Card key={p.id} className="group flex flex-col p-5">
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-accent">
                  {p.category}
                </span>
                <span className="rounded-full bg-chip px-2 py-0.5 text-muted">
                  {p.difficulty}
                </span>
                <span className="ml-auto tabular-nums text-faint">
                  {p.wordCount} words
                </span>
              </div>
              <p className="mt-2.5 text-[15px] font-extrabold tracking-tight">
                {p.title}
              </p>
              <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-muted">
                {p.content}
              </p>
              <div className="mt-3 border-t border-line pt-3">
                <Link
                  href={`/practice/session?id=${encodeURIComponent(p.id)}`}
                  className="inline-flex items-center gap-1 text-[13px] font-bold text-accent opacity-80 transition-opacity hover:opacity-100"
                >
                  Start
                  <ArrowRight
                    size={14}
                    aria-hidden
                    className="transition group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
        <p className="text-[13px] font-bold">
          Training modes
          <span className="ml-2 font-medium text-faint">
            Words · Quotes · Custom live in the arena
          </span>
        </p>
        <div className="flex gap-2 sm:ml-auto">
          {MODES.map((m) => (
            <Link
              key={m.kind}
              href={`/practice/session?kind=${m.kind}`}
              title={m.desc}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-bold transition hover:border-accent/50 hover:text-accent"
            >
              {m.label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
