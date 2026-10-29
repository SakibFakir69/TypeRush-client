import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { getSessionUser, isAppAllowed, sendVerifyCode } from "@/lib/server/session";

/**
 * Guarded app area: signed-in AND verified members only (Google
 * accounts exempt — the IdP already verified them). Unverified local
 * accounts get a fresh code and land on verification.
 */
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();
  console.log(user , "user data");
  
  if (!user) redirect("/login?next=/home");
  const email = typeof user.email === "string" ? user.email : "";
  if (!isAppAllowed(user)) {
    if (email) await sendVerifyCode(email);
    redirect(`/verify-signup?email=${encodeURIComponent(email)}`);
  }

  const raw =
    (typeof user?.name === "string" && user.name) ||
    (typeof user?.fullName === "string" && user.fullName) ||
    "typist";
  const name = raw.trim().split(/\s+/)[0] || "typist";

  return <AppShell userName={name}>{children}</AppShell>;
}
