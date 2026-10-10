"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { Avatar } from "@/components/ui/Avatar";

export function Topbar({
  userName,
  query,
  onQuery,
}: {
  userName: string;
  query: string;
  onQuery: (v: string) => void;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = !mounted || resolvedTheme !== "light";

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape") {
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-app/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4">
        <label className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-line bg-inset px-3 py-1.5">
          <Search size={14} aria-hidden className="shrink-0 text-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search users, contests, or topics…"
            aria-label="Search"
            className="w-full bg-transparent text-[13px] text-ink placeholder:text-faint focus:outline-none"
          />
          <kbd
            aria-hidden
            className="hidden shrink-0 rounded border border-line bg-chip px-1.5 text-[10px] tabular-nums text-faint sm:block"
          >
            ⌘K
          </kbd>
        </label>

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
            <Avatar
              src="https://i.pravatar.cc/64?img=11"
              alt={userName}
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[13px] font-bold">{userName}</span>
              <span className="block text-[10px] text-faint">Level 12</span>
            </span>
            <ChevronDown size={13} aria-hidden className="text-faint" />
          </button>
        </div>
      </div>
    </header>
  );
}
