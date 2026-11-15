import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TITLE_TEMPLATE } from "@/lib/seo/site";

/** A single practice run — its own title instead of the root default. */
export const metadata: Metadata = {
  title: { default: "Practice session", template: TITLE_TEMPLATE },
  description:
    "Type the passage and get live WPM, accuracy and error feedback as you go.",
  alternates: { canonical: "/practice/session" },
};

export default function PracticeSessionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
