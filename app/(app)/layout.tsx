import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClientAuthGate } from "@/components/app/ClientAuthGate";

/**
 * The member area is behind a session: every page here answers with a
 * redirect to /login for anyone who is not signed in, so it must never be
 * indexed. The public guides live outside this group.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ClientAuthGate>{children}</ClientAuthGate>;
}