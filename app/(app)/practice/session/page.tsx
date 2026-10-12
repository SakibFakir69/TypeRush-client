"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TypingCard } from "@/components/landing/TypingCard";
import { TestExperience } from "@/components/test/TestExperience";
import { useGetParagraphQuery } from "@/lib/features/practice/features.practice";

function ParagraphSession({ id }: { id: string }) {
  const { data, isLoading, isError, error, refetch } = useGetParagraphQuery(id);

  // Surface the real failure reason (status code / network) so a
  // "Passage unavailable" is diagnosable instead of a dead end.
  const errorDetail = (() => {
    if (!error || typeof error !== "object") return "";
    const e = error as { status?: unknown; message?: unknown };
    if (typeof e.status === "number") {
      if (e.status === 404) return "Server says: passage not found (404).";
      return `Server answered with status ${e.status}.`;
    }
    if (typeof e.status === "string") return `Request failed (${e.status}).`;
    if (typeof e.message === "string") return e.message;
    return "Network or server unreachable.";
  })();

  const content =
    data && typeof (data as Record<string, unknown>).content === "string"
      ? ((data as Record<string, unknown>).content as string)
      : "";
  const title =
    data && typeof (data as Record<string, unknown>).title === "string"
      ? ((data as Record<string, unknown>).title as string)
      : "Practice passage";

  if (isLoading) {
    return (
      <div
        aria-hidden
        className="h-72 animate-pulse rounded-2xl border border-line bg-card"
      />
    );
  }

  if (isError || !content) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-line p-10 text-center">
        <div>
          <p className="text-base font-extrabold">Passage unavailable</p>
          <p className="mt-1 text-sm text-muted">
            {errorDetail || "It may have been removed. Pick another one."}
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
              href="/practice"
              className="rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
            >
              ← All practice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1 text-[13px] text-muted transition hover:text-accent"
        >
          ← All practice
        </Link>
        <h1 className="w-full text-xl font-black tracking-tight sm:text-2xl">
          {title}
        </h1>
      </div>
      <TypingCard key={id} target={content} paragraphId={id} />
    </div>
  );
}

function SessionRouter() {
  const params = useSearchParams();
  const id = params.get("id");
  if (id) return <ParagraphSession id={id} />;
  // Legacy training modes (words / quotes / custom / paragraphs bank).
  return <TestExperience />;
}

export default function PracticeSessionPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <Suspense
        fallback={
          <div className="animate-pulse rounded-2xl border border-line bg-card p-10 text-center text-sm text-muted">
            Loading practice arena…
          </div>
        }
      >
        <SessionRouter />
      </Suspense>
    </div>
  );
}
