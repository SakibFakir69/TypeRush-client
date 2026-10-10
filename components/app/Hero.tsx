"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Hand, Trophy } from "lucide-react";
import { Card } from "@/components/ui/primitives";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardHero({ name }: { name: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const f = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(f);
  }, []);

  return (
    <Card className="relative grid gap-5 overflow-hidden p-6 lg:grid-cols-[1.4fr_1fr]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 120% at 85% 20%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 60%)",
        }}
      />
      <div className="relative">
        <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight sm:text-[28px]">
          <Hand size={24} aria-hidden className="text-amber-500" />
          {mounted ? greeting() : "Welcome back"}, {name}!
        </h1>
        <p className="mt-1 text-sm text-muted">Type faster. Improve. Compete. Win.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/test"
            className="rounded-lg bg-mint px-4 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
          >
            Start Practice →
          </Link>
          <Link
            href="/contests"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2.5 text-sm font-bold transition hover:bg-chip"
          >
            <Trophy size={15} aria-hidden /> Join Contest
          </Link>
        </div>
      </div>
      <figure className="relative hidden items-center justify-end lg:flex">
        <blockquote className="max-w-[220px] border-l-2 border-accent/40 pl-4 font-serif text-sm italic leading-6 text-muted">
          “A little progress each day adds up to big results.”
          <figcaption className="mt-1 font-sans text-[11px] not-italic text-faint">
            — TypeRush
          </figcaption>
        </blockquote>
      </figure>
    </Card>
  );
}
