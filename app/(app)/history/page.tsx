import type { Metadata } from "next";
import { BattleHistory } from "@/components/battle/BattleHistory";

export const metadata: Metadata = {
  title: "History — TypeRush",
  description:
    "Your ranked battle record and private invite history, with WPM, accuracy and rating changes.",
};

export default function HistoryPage() {
  return <BattleHistory />;
}
