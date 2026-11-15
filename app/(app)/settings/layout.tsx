import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TITLE_TEMPLATE } from "@/lib/seo/site";

/** The settings screen — its own title instead of the root default. */
export const metadata: Metadata = {
  title: { default: "Settings", template: TITLE_TEMPLATE },
  description:
    "Manage your TypePotijogita account: theme, sound, contest alerts and your weekly recap.",
  alternates: { canonical: "/settings" },
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
