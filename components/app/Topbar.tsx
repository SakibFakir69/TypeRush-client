"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronDown, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { UserAvatar } from "@/components/ui/Avatar";

export function Topbar({
  userName,
  avatarUrl = "",
}: {
  userName: string;
  avatarUrl?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = !mounted || resolvedTheme !== "light";

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-app/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications, 1 unread"
            title="Notifications"
            className="relative grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition hover:text-ink"
          >
            <Bell size={15} aria-hidden />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
          <button
            type="button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition hover:text-ink"
          >
            {isDark ? <Moon size={15} aria-hidden /> : <Sun size={15} aria-hidden />}
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-line py-1 pl-1 pr-2 transition hover:bg-chip"
            aria-label="Account menu"
          >
            <UserAvatar
              src={avatarUrl}
              name={userName}
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block py-0.5 text-[13px] font-bold">{userName}</span>
            </span>
            <ChevronDown size={13} aria-hidden className="text-faint" />
          </button>
        </div>
      </div>
    </header>
  );
}
