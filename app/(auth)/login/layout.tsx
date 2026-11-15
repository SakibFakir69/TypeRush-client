import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TITLE_TEMPLATE } from "@/lib/seo/site";

/**
 * The login screen.
 *
 * The page itself is a client component, so its title lives here: without
 * it every auth screen fell back to the root layout's default title and
 * description — the same pair on six different routes.
 */
export const metadata: Metadata = {
  title: { default: "Sign in", template: TITLE_TEMPLATE },
  description:
    "Sign in to TypePotijogita to save your typing results, track your progress curve, and join leaderboards, contests and battles.",
  alternates: { canonical: "/login" },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
