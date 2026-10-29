"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLazyGetSessionQuery } from "@/lib/features/auth/features.auth";
import { AppShell } from "@/components/app/AppShell";

type SessionUser = {
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
  authProvider?: string;
  emailVerified?: boolean;
};

export function ClientAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [trigger] = useLazyGetSessionQuery();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    let alive = true;

    trigger(undefined, false).then((res) => {
      if (!alive) return;

      if (!res.data) {
        router.replace("/login?next=/home");
        return;
      }

      const u = res.data as SessionUser;
      const isGoogle = u.authProvider === "google";
      const isVerified = u.emailVerified === true;

      if (!isGoogle && !isVerified) {
        const email = u.email ?? "";
        router.replace(`/verify-signup?email=${encodeURIComponent(email)}`);
        return;
      }

      setUser(u);
      setStatus("ready");
    });

    return () => {
      alive = false;
    };
  }, [trigger, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  const raw =
    (typeof user?.name === "string" && user.name) ||
    (typeof user?.fullName === "string" && user.fullName) ||
    "typist";
  const name = raw.trim().split(/\s+/)[0] || "typist";

  return <AppShell userName={name}>{children}</AppShell>;
}