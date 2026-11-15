import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TITLE_TEMPLATE } from "@/lib/seo/site";

/** The code-entry screen used right after signing up. */
export const metadata: Metadata = {
  title: { default: "Confirm your email", template: TITLE_TEMPLATE },
  description:
    "Enter the one-time code we emailed you to activate your TypePotijogita account.",
  alternates: { canonical: "/verify-signup" },
};

export default function VerifySignupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
