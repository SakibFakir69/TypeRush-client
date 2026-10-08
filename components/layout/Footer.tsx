const COLS: Array<[string, string[]]> = [
  ["Product", ["Practice", "Challenges", "1v1 Battle", "Leaderboard", "Contests"]],
  ["Resources", ["Help Center", "Guides", "Blog", "API"]],
  ["Company", ["About", "Careers", "Contact"]],
  ["Legal", ["Privacy Policy", "Terms of Service", "Cookie Policy"]],
];

export function Footer() {
  return (
    <footer id="about" className="mt-4 scroll-mt-20 border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-[13px] sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <p className="text-base font-extrabold">
            ⚡ Type<span className="text-accent">Rush</span>
          </p>
          <p className="mt-2 max-w-[220px] text-xs leading-5 text-muted">
            The modern way to practice typing and compete. Free to start, no credit card required.
          </p>
        </div>
        {COLS.map(([h, links]) => (
          <div key={h}>
            <p className="font-bold text-ink">{h}</p>
            <ul className="mt-3 space-y-2 text-muted">
              {links.map((l) => (
                <li key={l}>
                  <a href="#" className="transition hover:text-ink">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
            <p className="font-bold text-ink">Join the community</p>
            <div className="mt-3 flex gap-2 text-muted">
              {["𝔻", "𝕏", "▶", "◎"].map((s) => (
                <span
                  key={s}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line transition hover:border-accent/40 hover:text-accent"
                >
                {s}
              </span>
            ))}
          </div>
            <p className="mt-4 text-[11px] text-faint">© 2026 TypeRush. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
