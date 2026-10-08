export function CtaBanner() {
  return (
    <section className="flex flex-col items-center gap-5 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-fuchsia-950/60 via-violet-950/40 to-indigo-950/60 p-8 text-center text-white lg:flex-row lg:text-left">
      <div className="flex-1">
        <p className="text-lg font-extrabold tracking-tight">Ready to test your typing speed?</p>
        <p className="mt-1 text-xs text-slate-300">Join thousands of typists and start your journey today.</p>
      </div>
      <div className="text-4xl" aria-hidden>
        ⚡
      </div>
      <div className="flex-1">
        <p className="font-bold">Practice. Improve. Compete. Win.</p>
        <p className="mt-1 text-[11px] text-slate-300">✓ Free to start • No credit card required • Start in seconds</p>
      </div>
      <a
        href="#practice"
        className="rounded-lg bg-mint px-5 py-3 text-sm font-bold text-black transition hover:brightness-110"
      >
        Start Typing Now →
      </a>
    </section>
  );
}
