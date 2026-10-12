import type { Metadata } from "next";
import { ComingSoon } from "@/components/app/ComingSoon";

export const metadata: Metadata = {
  title: "1v1 Battles — TypeRush",
  description: "Real-time typing battles. Coming soon.",
};

export default function BattlesPage() {
  return (
    <ComingSoon
      title="1v1 Battles"
      desc="Live matchmaking is warming up. Practice meanwhile — your speed carries over."
    />
  );
}
