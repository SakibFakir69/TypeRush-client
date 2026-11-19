import type { Metadata } from "next";
import { Card } from "@/components/ui/primitives";
import { AdsterraNative } from "@/components/ads/AdsterraSlot";
import { ContestBoard } from "@/components/app/ContestBoard";

export const metadata: Metadata = {
  title: "Contests",
  description: "Weekly and monthly typing contests. Join a race and climb the board.",
  alternates: { canonical: "/contests" },
};

export default function ContestsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Contests
        </h1>
        <p className="mt-1 text-sm text-muted">
          Weekly and monthly races — join while entries are open, type when the
          clock starts.
        </p>
      </div>

      <Card className="p-4 sm:p-5">
        <ContestBoard />
      </Card>

      {/* Adsterra native at the page bottom — the only unit on this lobby. */}
      <AdsterraNative />
    </div>
  );
}
