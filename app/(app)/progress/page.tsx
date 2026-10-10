import type { Metadata } from "next";
import { ProgressSection } from "@/components/landing/ProgressSection";

export const metadata: Metadata = {
  title: "Progress — TypeRush",
  description: "Your typing stats, curves, and achievements.",
};

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <ProgressSection />
    </div>
  );
}
