import type { Metadata } from "next";
import { Suspense } from "react";
import { InvitePanel } from "@/components/battle/InvitePanel";

/** The private-invite screen — its own title instead of the root default. */
export const metadata: Metadata = {
  title: "Play a friend",
  description:
    "Create a private typing battle link and race a friend on the same passage.",
  alternates: { canonical: "/battles/invite" },
};

export default function BattleInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg animate-pulse rounded-2xl border border-line bg-card p-10 text-center text-sm text-muted">
          Loading private room…
        </div>
      }
    >
      <InvitePanel />
    </Suspense>
  );
}
