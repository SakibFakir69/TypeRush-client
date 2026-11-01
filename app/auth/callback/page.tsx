"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useExchangeGoogleCodeMutation,
  useLazyGetSessionQuery,
} from "@/lib/features/auth/features.auth";
import { AuthShell, FormError, InlineLink } from "@/components/auth/ui";

/**
 * Google OAuth landing.
 *
 * The callback runs on the API origin, so it redirects here with a
 * short-lived, single-use `?code=`. We redeem that code through the
 * same-origin `/backend` proxy (which stores the session cookies on *this*
 * origin), strip the code from the URL, then confirm the session via /users.
 */
function CallbackRunner() {
  const router = useRouter();
  const params = useSearchParams();
  const [trigger] = useLazyGetSessionQuery();
  const [exchange] = useExchangeGoogleCodeMutation();
  const [error, setError] = useState("");
  // StrictMode runs effects twice in dev; the handoff code is single-use.
  const started = useRef(false);

  const failed = params.get("error");
  const code = params.get("code");
  const preError = failed
    ? "Google sign-in was rejected. Try again or use email login."
    : "";

  useEffect(() => {
    if (preError || started.current) return;
    started.current = true;

    (async () => {
      if (code) {
        try {
          await exchange({ code }).unwrap();
        } catch {
          setError("This sign-in link expired. Please try Google again.");
          return;
        }
        // Single-use code — keep it out of the address bar and history.
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", "/auth/callback");
        }
      }

      const res = await trigger(undefined, false);
      if (res.data) {
        router.replace("/home");
        return;
      }

      setError(
        code
          ? "Google signed you in, but the session still could not be read. Reload and try once more."
          : "Google redirected back but no session was created. Use email login for now."
      );
    })();
  }, [preError, code, exchange, trigger, router]);

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
