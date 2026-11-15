import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TITLE_TEMPLATE } from "@/lib/seo/site";

/** The 1v1 battle queue — its own title instead of the root default. */
export const metadata: Metadata = {
  title: { default: "Battles", template: TITLE_TEMPLATE },
  description:
    "Race another typist in real time on the same paragraph: find an opponent, or invite a friend with a private code.",
  alternates: { canonical: "/battles" },
};

export default function BattlesLayout({ children }: { children: ReactNode }) {
  return children;
}
