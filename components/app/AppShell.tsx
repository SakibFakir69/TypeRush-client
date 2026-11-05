"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { APP_NAV, Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";

/** Post-login shell: sidebar + topbar + content + mobile nav. */
export function AppShell({
  userName,
  avatarUrl = "",
  children,
}: {
  userName: string;
  avatarUrl?: string;
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");
  // The gate already fetched the session; subscribing here keeps the navbar
  // name/photo in sync when the profile (or avatar) is edited.
  const { user } = useAuth();

  const liveName =
    (typeof user?.name === "string" && user.name.trim()) ||
    (typeof user?.fullName === "string" && user.fullName.trim()) ||
    "";
  const displayName = liveName ? liveName.split(/\s+/)[0] : userName;
  const displayAvatar =
    typeof user?.avatarUrl === "string" ? user.avatarUrl : avatarUrl;

  return (
    <div className="min-h-screen bg-app text-ink antialiased">
      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar userName={displayName} avatarUrl={displayAvatar} filter={query} />
        <div className="min-w-0 flex-1">
          <Topbar
            userName={displayName}
            avatarUrl={displayAvatar}
            query={query}
            onQuery={setQuery}
          />
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
        </div>
      </div>
    </div>
  );
}
