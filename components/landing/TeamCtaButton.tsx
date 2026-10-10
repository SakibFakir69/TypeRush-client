"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

/**
 * Team contests need an account: logged-out users go to log in,
 * logged-in users go straight to the test arena.
 */
export function TeamCtaButton() {
  const { user, loading } = useAuth();
  const href = !loading && user ? "/test" : "/login";

  return (
    <Link
      href={href}
      title="Start a Team Contest (press G)"
      className="inline-block rounded-lg bg-mint px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
    >
      Start a Team Contest
      <kbd
        aria-hidden
        className="ml-1.5 rounded border border-black/20 bg-black/10 px-1 text-[10px] tabular-nums text-black/60"
      >
        G
      </kbd>{" "}
      →
    </Link>
  );
}
