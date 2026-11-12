import type { ReactNode } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

/**
 * The footer is the site's link graph: it is how a crawler (and a reader)
 * reaches every public page. Every entry points at a real destination —
 * a dead `href="#"` is a wasted crawl and a broken promise to the reader.
 */
const COLS: Array<[string, { label: string; href: string }[]]> = [
  [
    "Product",
    [
      { label: "Typing Test", href: "/test" },
      { label: "Practice", href: "/practice" },
      { label: "1v1 Battle", href: "/battles" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "Contests", href: "/contests" },
    ],
  ],
  [
    "Learn",
    [
      { label: "Typing Speed Test", href: "/typing-speed-test" },
      { label: "WPM Test", href: "/wpm-test" },
      { label: "Practice Drills", href: "/type-practice" },
      { label: "Your Progress", href: "/progress" },
    ],
  ],
  [
    "Company",
    [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  ],
  [
    "Legal",
    [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  ],
];

function BrandIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function XIcon() {
  return (
    <BrandIcon>
      <path d="M4 4l16 16" />
      <path d="M20 4L4 20" />
    </BrandIcon>
  );
}

function YouTubeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <BrandIcon>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
    </BrandIcon>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.15c0 .3.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

/**
 * Social destinations. The accounts we do not own yet point at the contact
 * page rather than at a dead `#` — drop the real handle in here when it
 * exists and the icon becomes a real profile link.
 */
const SOCIALS = [
  { Icon: XIcon, label: "TypePotijogita on X", href: "/contact" },
  { Icon: YouTubeIcon, label: "TypePotijogita on YouTube", href: "/contact" },
  { Icon: InstagramIcon, label: "TypePotijogita on Instagram", href: "/contact" },
  {
    Icon: GitHubIcon,
    label: "TypePotijogita on GitHub",
    href: "https://github.com/SakibFakir69/TypeRush-client",
  },
];

const BUILDER_URL =
  "https://www.linkedin.com/company/seven-venture-labs/?viewAsMember=true";

export function Footer() {
  return (
    <footer id="about" className="mt-4 scroll-mt-20 border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-6 pt-10 text-[13px] sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <p className="inline-flex items-center gap-1.5 text-base font-extrabold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/15 text-accent">
              <Zap size={15} strokeWidth={2.5} aria-hidden />
            </span>
            Type<span className="-ml-1.5 text-accent">Potijogita</span>
          </p>
          <p className="mt-3 max-w-[230px] text-xs leading-5 text-muted">
            The modern way to practice typing and compete. Free to start, no
            credit card required.
          </p>
        </div>
        {COLS.map(([h, links]) => (
          <div key={h}>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-faint">
              {h}
            </p>
            <ul className="mt-3 space-y-2 text-muted">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="transition hover:text-accent"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-faint">
            Join the community
          </p>
          <div className="mt-3 flex gap-2 text-muted">
            {SOCIALS.map(({ Icon, label, href }) => {
              const external = href.startsWith("http");
              const cls =
                "grid h-8 w-8 place-items-center rounded-lg border border-line transition hover:border-accent/40 hover:text-accent";
              return external ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={cls}
                >
                  <Icon />
                </a>
              ) : (
                <Link key={label} href={href} aria-label={label} className={cls}>
                  <Icon />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-[11px] text-faint sm:flex-row">
          <p>© 2026 TypePotijogita. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            Built by
            <a
              href={BUILDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-muted transition hover:text-accent"
            >
              Seven Ventures Labs
              <LinkedInIcon />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
