import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TITLE_TEMPLATE } from "@/lib/seo/site";

/**
 * The Google OAuth landing page.
 *
 * It lives outside the `(auth)` group, so it used to inherit the root
 * layout's `index, follow` — a thin "Completing Google sign-in…" screen
 * that Google was invited to index. It now declares itself as noindex with
 * a self-referencing canonical, like every other hand-off screen.
 */
export const metadata: Metadata = {
  title: { default: "Signing you in", template: TITLE_TEMPLATE },
  description: "Finishing your Google sign-in for TypePotijogita.",
  alternates: { canonical: "/auth/callback" },
  robots: { index: false, follow: false },
};

export default function AuthCallbackLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
