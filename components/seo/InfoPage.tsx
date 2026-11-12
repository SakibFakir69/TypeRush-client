import type { ReactNode } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * The plain-page shell: a navigation bar, one column of copy and the
 * footer. Used by the about / contact / legal pages so they look like part
 * of the site instead of a stray document.
 */
export function InfoPage({
  title,
  intro,
  children,
  updated,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
  /** "Last updated" line — expected on the legal pages. */
  updated?: string;
}) {
  return (
    <div className="min-h-screen bg-app text-ink antialiased">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <header className="border-b border-line pb-6">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {title}
          </h1>
          {intro ? (
            <p className="mt-3 text-sm leading-6 text-muted">{intro}</p>
          ) : null}
          {updated ? (
            <p className="mt-2 text-[11px] text-faint">{updated}</p>
          ) : null}
        </header>

        <div className="space-y-6 py-8 text-sm leading-7 text-muted [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-extrabold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-bold [&_strong]:text-ink">
          {children}
        </div>

        <nav
          aria-label="More about TypePotijogita"
          className="flex flex-wrap gap-2 border-t border-line pt-6"
        >
          {[
            { href: "/test", label: "Take the typing test" },
            { href: "/typing-speed-test", label: "Typing speed guide" },
            { href: "/wpm-test", label: "WPM test" },
            { href: "/type-practice", label: "Practice drills" },
            { href: "/contact", label: "Contact us" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold text-muted transition hover:bg-chip hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </main>
      <Footer />
    </div>
  );
}
