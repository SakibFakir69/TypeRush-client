import type { Metadata } from "next";
import { ComingSoon } from "@/components/app/ComingSoon";

export const metadata: Metadata = {
  title: "Contests — TypeRush",
  description: "Weekly and monthly typing contests. Coming soon.",
};

export default function ContestsPage() {
  return (
    <ComingSoon
      title="Contests"
      desc="Weekly and monthly point races are being set up. Keep training."
    />
  );
}
