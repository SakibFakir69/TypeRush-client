import Link from "next/link";
import { Check, Zap } from "lucide-react";

const TRUST = ["Free to start", "No credit card required", "Start in seconds"];

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-violet-400/25 bg-[#12082b] px-6 py-12 text-center text-white">
      {/* Ambient color: mint aura left, violet aura right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "rgba(46, 242, 200, 0.12)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "rgba(168, 85, 247, 0.22)" }}
      />

      <div className="relative mx-auto max-w-2xl">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-mint/40 bg-mint/10 text-mint shadow-[0_0_36px_rgba(46,242,200,0.35)]">
          <Zap size={26} strokeWidth={2.2} aria-hidden />
        </span>
        <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
          Ready to test your typing speed?
        </h2>
        <p className="mx-auto mt-2.5 max-w-md text-sm leading-6 text-white/65">
          Join thousands of typists and start your journey today. Practice.
          Improve. Compete. Win.
        </p>
        <div className="mt-6">
          <Link
            href="/test"
            title="Start typing now (press S)"
            className="inline-block rounded-xl bg-mint px-7 py-3.5 text-base font-extrabold text-black shadow-[0_8px_32px_rgba(46,242,200,0.35)] transition hover:brightness-110 active:brightness-95"
          >
            Start Typing Now
            <kbd
              aria-hidden
              className="ml-2 rounded-md border border-black/20 bg-black/10 px-1.5 py-0.5 align-middle text-[11px] tabular-nums text-black/60"
            >
              S
            </kbd>{" "}
            →
          </Link>
        </div>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-white/60">
          {TRUST.map((t) => (
            <li key={t} className="inline-flex items-center gap-1.5">
              <Check size={13} strokeWidth={3} aria-hidden className="text-mint" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
