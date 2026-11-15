import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TITLE_TEMPLATE } from "@/lib/seo/site";

/** The "choose a new password" screen. */
export const metadata: Metadata = {
  title: { default: "Choose a new password", template: TITLE_TEMPLATE },
  description:
    "Set a new password for your TypePotijogita account with the code you were sent.",
  alternates: { canonical: "/reset-password" },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
