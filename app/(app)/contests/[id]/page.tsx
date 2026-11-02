import type { Metadata } from "next";
import { ContestDetail } from "@/components/app/ContestDetail";

export const metadata: Metadata = {
  title: "Contest — TypeRush",
  description: "Contest details, participants and entry.",
};

export default async function ContestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl">
      <ContestDetail id={id} />
    </div>
  );
}
