import type { Metadata } from "next";
import { ComingSoon } from "@/components/app/ComingSoon";

export const metadata: Metadata = {
  title: "Progress — TypeRush",
  description: "Your typing stats and curves. Coming soon.",
};

export default function ProgressPage() {
  return (
    <ComingSoon
      title="Progress"
      desc="Personal curves and insights are being wired to your results."
    />
  );
}
