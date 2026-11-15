import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TITLE_TEMPLATE } from "@/lib/seo/site";

/** The code-entry screen used during the login flow. */
export const metadata: Metadata = {
  title: { default: "Verify your email", template: TITLE_TEMPLATE },
  description:
    "Enter the one-time code we emailed you to finish signing in to TypePotijogita.",
  alternates: { canonical: "/verify-otp" },
};

export default function VerifyOtpLayout({ children }: { children: ReactNode }) {
  return children;
}
