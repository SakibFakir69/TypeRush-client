import Link from "next/link";

/**
 * The links every guide page ends with.
 *
 * The guide pages used to be orphans: nothing on the site linked to them,
 * and they linked to nothing but the test. These links are the internal
 * link graph that lets a crawler reach every page — and that spreads the
 * authority of the landing page over the whole cluster.
 */
const RELATED = [
  {
    href: "/typing-speed-test",
    label: "Typing speed test",
    hint: "Measure WPM and accuracy in 15, 30 or 60 seconds",
  },
  {
    href: "/wpm-test",
    label: "WPM test",
    hint: "What 40, 60 and 100 WPM actually feel like",
  },
  {
    href: "/type-practice",
    label: "Practice drills",
    hint: "Daily drills, quotes and your own text",
  },
  {
    href: "/test",
    label: "Take the test",
    hint: "No account needed",
  },
];

export function RelatedGuides() {
  return (
    <nav aria-labelledby="related-guides" className="space-y-3">
      <h2
        id="related-guides"
        className="text-xl font-extrabold"
      >
        Keep going
      </h2>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {RELATED.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-xl border border-line bg-card p-4 transition hover:border-accent/40 hover:bg-chip"
            >
              <span className="block text-sm font-extrabold text-ink">
                {item.label} →
              </span>
              <span className="mt-1 block text-[12px] leading-5 text-muted">
                {item.hint}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
