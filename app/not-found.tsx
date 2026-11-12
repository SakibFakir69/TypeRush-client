import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * A 404 that helps: it points at the pages people usually wanted instead of
 * the default Next page (which is a dead end for both users and crawlers).
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-5 px-4 text-center">
      <p className="font-mono text-sm font-bold text-accent">404</p>
      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
        This page took a wrong turn
      </h1>
      <p className="text-sm leading-6 text-muted">
        The link is broken or the page has moved. Nothing is lost — your runs
        and badges are still exactly where you left them.
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href="/"
          className="rounded-lg bg-mint px-4 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
        >
          Take the typing test
        </Link>
        <Link
          href="/typing-speed-test"
          className="rounded-lg border border-line px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-chip"
        >
          Typing speed guide
        </Link>
        <Link
          href="/wpm-test"
          className="rounded-lg border border-line px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-chip"
        >
          WPM test
        </Link>
        <Link
          href="/type-practice"
          className="rounded-lg border border-line px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-chip"
        >
          Practice drills
        </Link>
      </div>
    </main>
  );
}
