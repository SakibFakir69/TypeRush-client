"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth";
import { NAV_ITEMS } from "@/lib/landing";
import { CONTEST_TAB_EVENT } from "@/components/landing/ContestsSection";
import { LEADERBOARD_TAB_EVENT } from "@/components/landing/LeaderboardSection";
import { playLoginKey, playNavKey, playStartKey, playThemeToggle } from "@/lib/keySound";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/cn";

/**
 * Navbar with two interactive layers that share one glow language:
 * - Scrollspy: the section in view glows mint (desktop + mobile).
 * - Keyboard: 1–5 jump to sections, T toggles theme, L goes to
 *   Log in, F signs up free, S starts the test, B finds an
 *   opponent, C joins the contest, G starts a team contest,
 *   R jumps to the ranks, P jumps to progress, D/W/M/A switch
 *   leaderboard periods, E/O switch contests — each with its
 *   own sound. Ignored while typing.
 */
export function Navbar() {
  const active = useActiveSection(NAV_ITEMS.map((n) => n.sectionId));
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [pressedAction, setPressedAction] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Keyboard effect for the keycap scrollbar: flash the thumb mint
  // while a shortcut press pulse is active (~450ms, matches glow).
  useEffect(() => {
    if (!pressedKey && !pressedAction) return;
    document.documentElement.classList.add("kb-hit");
    const t = setTimeout(
      () => document.documentElement.classList.remove("kb-hit"),
      450
    );
    return () => {
      clearTimeout(t);
      document.documentElement.classList.remove("kb-hit");
    };
  }, [pressedKey, pressedAction]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const pulse = (kind: string, fn: () => void) => {
        fn();
        setPressedAction(kind);
        setTimeout(() => setPressedAction(null), 450);
      };
      const idx = ["1", "2", "3", "4", "5"].indexOf(e.key);
      if (idx >= 0 && idx < NAV_ITEMS.length) {
        e.preventDefault();
        playNavKey(idx);
        setPressedKey(e.key);
        document
          .getElementById(NAV_ITEMS[idx].sectionId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => setPressedKey(null), 450);
        return;
      }
      switch (e.key.toLowerCase()) {
        case "t": {
          const toLight = resolvedTheme !== "light";
          playThemeToggle(toLight);
          pulse("theme", () => setTheme(toLight ? "light" : "dark"));
          break;
        }
        case "l":
          playLoginKey();
          pulse("login", () => router.push("/login"));
          break;
        case "r":
          playNavKey(2);
          document
            .getElementById("leaderboard")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
          break;
        case "p":
          playNavKey(4);
          document
            .getElementById("progress")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
          break;
        case "c":
          playNavKey(3);
          router.push("/test");
          break;
        case "g":
          playNavKey(1);
          router.push("/test");
          break;
        case "d":
        case "w":
        case "m":
        case "a": {
          const order = ["d", "w", "m", "a"];
          const names: Record<string, string> = {
            d: "Today",
            w: "This Week",
            m: "This Month",
            a: "All Time",
          };
          const key = e.key.toLowerCase();
          playNavKey(order.indexOf(key));
          window.dispatchEvent(
            new CustomEvent(LEADERBOARD_TAB_EVENT, { detail: names[key] })
          );
          document
            .getElementById("leaderboard")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
          break;
        }
        case "e":
        case "o": {
          const names: Record<string, string> = {
            e: "Weekly",
            o: "Monthly",
          };
          const key = e.key.toLowerCase();
          playNavKey(key === "e" ? 0 : 1);
          window.dispatchEvent(
            new CustomEvent(CONTEST_TAB_EVENT, { detail: names[key] })
          );
          document
            .getElementById("contests")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
          break;
        }
        case "s":
        case "b":
          playStartKey();
          pulse("start", () => {
            if (window.location.pathname === "/test") {
              document
                .querySelector<HTMLInputElement>('input[aria-label="Typing input"]')
                ?.focus();
            } else {
              router.push("/test");
            }
          });
          break;
        case "f":
          playNavKey(4);
          router.push("/signup");
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resolvedTheme, setTheme, router]);

  const isDark = !mounted || resolvedTheme !== "light";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-app/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[17px] font-extrabold tracking-tight"
        >
          <span className="text-accent">⚡</span>
          <span>
            Type<span className="text-accent">Rush</span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item, i) => {
            const isActive = active === item.sectionId;
            const isPressed = pressedKey === String(i + 1);
            const lit = isActive || isPressed;
            return (
              <a
                key={item.label}
                href={item.href}
                title={`${item.label} (press ${i + 1})`}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-[13px] transition-all duration-200",
                  lit
                    ? "scale-105 text-accent drop-shadow-[0_0_12px_rgba(46,242,200,0.55)]"
                    : "text-muted hover:text-ink"
                )}
              >
                {item.label}
                <kbd
                  aria-hidden
                  className={cn(
                    "ml-1.5 rounded border border-line bg-chip px-1 text-[10px] tabular-nums transition-colors",
                    lit ? "text-accent" : "text-faint"
                  )}
                >
                  {i + 1}
                </kbd>
                <span
                  className={cn(
                    "absolute -bottom-[1px] left-3 right-3 h-px bg-accent shadow-[0_0_10px_rgba(46,242,200,0.9)] transition-opacity",
                    lit ? "opacity-100" : "opacity-0"
                  )}
                />
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            aria-label={isDark ? "Switch to light mode (press t)" : "Switch to dark mode (press t)"}
            title="Toggle theme (T)"
            onClick={() => {
              playThemeToggle(isDark);
              setTheme(isDark ? "light" : "dark");
            }}
            className={cn(
              "relative grid h-8 w-8 place-items-center rounded-full border border-line text-sm text-muted transition-all duration-200 hover:text-ink",
              pressedAction === "theme" && "scale-110 border-accent text-accent"
            )}
          >
            {isDark ? "☾" : "☀"}
            <kbd
              aria-hidden
              className="absolute -bottom-1 -right-1 rounded border border-line bg-card px-0.5 text-[9px] font-bold tabular-nums text-faint"
            >
              T
            </kbd>
          </button>
          <Link
            href="/login"
            title="Log in (press L)"
            className={cn(
              "hidden rounded-md border border-line px-3 py-1.5 text-[13px] font-medium transition-all duration-200 hover:bg-chip sm:block",
              pressedAction === "login" && "scale-105 border-accent text-accent"
            )}
          >
            Log in
            <kbd
              aria-hidden
              className="ml-1.5 rounded border border-line bg-chip px-1 text-[10px] tabular-nums text-faint"
            >
              L
            </kbd>
          </Link>
          <Link
            href="/signup"
            title="Sign up free (press F)"
            className="hidden rounded-md px-3 py-1.5 text-[13px] font-medium text-muted transition-all duration-200 hover:text-ink md:block"
          >
            Sign up free
            <kbd
              aria-hidden
              className="ml-1.5 rounded border border-line bg-chip px-1 text-[10px] tabular-nums text-faint"
            >
              F
            </kbd>
          </Link>
          <Link
            href="/test"
            title="Start test (press S)"
            className={cn(
              "rounded-md bg-mint px-3 py-1.5 text-[13px] font-bold text-black transition-all duration-200 hover:brightness-110",
              pressedAction === "start" && "scale-105 brightness-125"
            )}
          >
            Start test
            <kbd
              aria-hidden
              className="ml-1.5 rounded border border-black/20 bg-black/10 px-1 text-[10px] tabular-nums text-black/60"
            >
              S
            </kbd>
          </Link>
          <SessionChip />
        </div>
      </div>

      {/* Mobile nav: horizontal scroll, same glow logic */}
      <nav
        className="flex gap-1 overflow-x-auto border-t border-line px-3 py-1.5 lg:hidden"
        aria-label="Mobile"
      >
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1 text-xs transition-colors",
              active === item.sectionId ? "bg-accent/15 text-accent" : "text-muted"
            )}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

/** Logged-in user chip with logout; hidden while logged out. */
function SessionChip() {
  const { user, loading, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  if (loading || !user) return null;
  const label =
    (typeof user.name === "string" && user.name) ||
    (typeof user.fullName === "string" && user.fullName) ||
    (typeof user.email === "string" && user.email) ||
    "Account";
  const initial = label.trim().charAt(0).toUpperCase() || "?";

  return (
    <span className="hidden items-center gap-1.5 sm:inline-flex">
      <span
        title={label}
        className="grid h-8 w-8 place-items-center rounded-full border border-accent/40 bg-accent/15 text-xs font-extrabold text-accent"
      >
        {initial}
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          logout().finally(() => setBusy(false));
        }}
        title="Log out"
        className="rounded-md px-2 py-1.5 text-[13px] font-medium text-muted transition hover:text-ink disabled:opacity-60"
      >
        {busy ? "…" : "Log out"}
      </button>
    </span>
  );
}
