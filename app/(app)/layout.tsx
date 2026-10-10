import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { getSessionUser, hasRole } from "@/lib/server/session";

/**
 * Guarded app area: every page in here requires a signed-in member.
 * Name is resolved once, server-side, and handed to the shell.
 */
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();
  if (!hasRole(user, ["user", "admin"])) redirect("/login?next=/home");

  const raw =
    (typeof user?.name === "string" && user.name) ||
    (typeof user?.fullName === "string" && user.fullName) ||
    "typist";
  const name = raw.trim().split(/\s+/)[0] || "typist";

  return <AppShell userName={name}>{children}</AppShell>;
}
