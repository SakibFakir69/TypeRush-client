"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV, Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { AdRail } from "@/components/ads/AdRail";
import { isMemberAdRoute, adsEnabled } from "@/lib/ads";
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
  // The gate already fetched the session; subscribing here keeps the navbar
  // name/photo in sync when the profile (or avatar) is edited.
  const { user } = useAuth();
  const pathname = usePathname();

  // The lobby pages gain a 300px right column at 2xl. Widen the shell by the
  // same 300px there, so the rail takes space that was empty margin instead
  // of squeezing the page the visitor came for.
  const withRail = isMemberAdRoute(pathname) && adsEnabled("rail");

  const liveName =
    (typeof user?.name === "string" && user.name.trim()) ||
    (typeof user?.fullName === "string" && user.fullName.trim()) ||
    "";
  const displayName = liveName ? liveName.split(/\s+/)[0] : userName;
  const displayAvatar =
    typeof user?.avatarUrl === "string" ? user.avatarUrl : avatarUrl;

  return (
    <div className="min-h-screen bg-app text-ink antialiased">
      <div
        className={cn(
          "mx-auto flex max-w-[1400px]",
          withRail && "min-[1740px]:max-w-[1740px]"
        )}
      >
        <Sidebar userName={displayName} avatarUrl={displayAvatar} filter="" />
        <div className="min-w-0 flex-1">
          <Topbar userName={displayName} avatarUrl={displayAvatar} />
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
        {/* The lobby rail: practice / battles / contests hubs, 2xl and up. */}
        <AdRail />
      </div>
    </div>
  );
}
