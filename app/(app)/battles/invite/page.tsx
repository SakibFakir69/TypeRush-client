import { Suspense } from "react";
import { InvitePanel } from "@/components/battle/InvitePanel";

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
