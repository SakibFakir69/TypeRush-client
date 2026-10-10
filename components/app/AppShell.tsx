"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { APP_NAV, Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { cn } from "@/lib/cn";

/** Post-login shell: sidebar + topbar + content + mobile nav. */
export function AppShell({
  userName,
  children,
}: {
  userName: string;
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-app text-ink antialiased">
      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar userName={userName} filter={query} />
        <div className="min-w-0 flex-1">
          <Topbar userName={userName} query={query} onQuery={setQuery} />
          {/* Mobile nav */}
          <nav
            aria-label="App"
            className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2 lg:hidden"
          >
            {APP_NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 text-xs text-muted"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <main className="px-4 py-5">{children}</main>
          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-4 text-[11px] text-faint">
            <p className="flex gap-3">
              <Link href="/#about" className="hover:text-muted">About</Link>
              <Link href="#" className="hover:text-muted">Privacy</Link>
              <Link href="#" className="hover:text-muted">Terms</Link>
              <Link href="#" className="hover:text-muted">Help</Link>
            </p>
            <p>© 2026 TypeRush</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
