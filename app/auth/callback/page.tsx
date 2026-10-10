"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLazyGetSessionQuery } from "@/lib/features/auth/features.auth";
import { AuthShell, FormError, InlineLink } from "@/components/auth/ui";

/**
 * Google OAuth landing: the server redirects here with ?token=.
 * That token can't open an API session by itself, so we confirm
 * the session via /users — success goes to the app, otherwise
 * we say so honestly instead of stranding the user.
 */
function CallbackRunner() {
  const router = useRouter();
  const params = useSearchParams();
  const [trigger] = useLazyGetSessionQuery();
  const [error, setError] = useState("");

  const failed = params.get("error");
  const token = params.get("token");
  const preError = failed
    ? "Google sign-in was rejected. Try again or use email login."
    : !token
      ? "No sign-in token arrived. Try again or use email login."
      : "";

  useEffect(() => {
    if (preError) return;
    let alive = true;
    // The token alone isn't a session: force-confirm via /users.
    trigger(undefined, false).then((res) => {
      if (!alive) return;
      if (res.data) {
        router.replace("/home");
      } else {
        setError(
          "Google redirected back but no session was created. Use email login for now."
        );
      }
    });
    return () => {
      alive = false;
    };
  }, [preError, trigger, router]);

  const shown = error || preError;
  if (!shown) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted" role="status">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" />
        Completing Google sign-in…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <FormError message={shown} />
      <p className="text-center text-[13px] text-muted">
        <InlineLink href="/login">Back to log in</InlineLink>
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <AuthShell
      title="Signing you in"
      subtitle="Finishing up with Google — one moment."
    >
      <Suspense>
        <CallbackRunner />
      </Suspense>
    </AuthShell>
  );
}
