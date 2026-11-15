import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TITLE_TEMPLATE } from "@/lib/seo/site";

/** The practice hub — its own title instead of the root default. */
export const metadata: Metadata = {
  title: { default: "Practice", template: TITLE_TEMPLATE },
  description:
    "Pick a passage and drill your typing: paragraphs, quotes and your own pasted text in English, Bangla and Hindi.",
  alternates: { canonical: "/practice" },
};

export default function PracticeLayout({ children }: { children: ReactNode }) {
  return children;
}
