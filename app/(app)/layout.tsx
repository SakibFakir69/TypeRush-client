import type { ReactNode } from "react";
import { ClientAuthGate } from "@/components/app/ClientAuthGate";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ClientAuthGate>{children}</ClientAuthGate>;
}