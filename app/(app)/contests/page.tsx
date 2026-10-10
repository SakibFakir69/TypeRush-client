import type { Metadata } from "next";
import { ContestsSection } from "@/components/landing/ContestsSection";

export const metadata: Metadata = {
  title: "Contests — TypeRush",
  description: "Weekly and monthly typing contests. Climb on points.",
};

export default function ContestsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <ContestsSection />
    </div>
  );
}
