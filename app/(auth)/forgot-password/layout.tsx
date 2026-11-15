import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TITLE_TEMPLATE } from "@/lib/seo/site";

/** The "email me a reset code" screen. */
export const metadata: Metadata = {
  title: { default: "Forgot password", template: TITLE_TEMPLATE },
  description:
    "Request a one-time code to reset the password of your TypePotijogita account.",
  alternates: { canonical: "/forgot-password" },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
