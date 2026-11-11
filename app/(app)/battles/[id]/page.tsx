import type { Metadata } from "next";
import { BattleRoom } from "@/components/battle/BattleRoom";

export const metadata: Metadata = {
  title: "Battle — TypePotijogita",
  description: "Race another typist on the same paragraph in real time.",
};

export default async function BattleRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BattleRoom matchId={id} />;
}
