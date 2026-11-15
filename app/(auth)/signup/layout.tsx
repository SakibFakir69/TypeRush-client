import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TITLE_TEMPLATE } from "@/lib/seo/site";

/** The signup screen — its own title instead of the root default. */
export const metadata: Metadata = {
  title: { default: "Create your free account", template: TITLE_TEMPLATE },
  description:
    "Create a free TypePotijogita account to save typing results, track your progress curve, and climb the global leaderboards.",
  alternates: { canonical: "/signup" },
};

export default function SignupLayout({ children }: { children: ReactNode }) {
  return children;
}
