import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Maintenance — TypePotijogita",
  description: "TypePotijogita is temporarily under maintenance.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-app px-6 py-16 text-ink">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
          <Wrench size={26} aria-hidden />
        </span>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-accent">
          Scheduled maintenance
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          We&apos;ll be right back
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
          TypePotijogita is getting a quick tune-up. Your runs, ratings and battle
          history are safe — check back in a few minutes.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {/* Re-runs the middleware flag check; lands back here until it lifts. */}
          <Link
            href="/maintenance"
            className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-4 py-2.5 text-sm font-extrabold text-black transition hover:brightness-110"
          >
            <RefreshCw size={14} aria-hidden />
            Try again
          </Link>
        </div>

        <p className="mt-10 text-[11px] font-bold tracking-wide text-faint">
          ⚡ Type<span className="text-accent">Potijogita</span>
        </p>
      </div>
    </main>
  );
}
