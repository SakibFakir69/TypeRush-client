"use client";

import { useEffect, useState } from "react";
import { getApiError } from "@/helper/error-helper";
import {
  useForgotPasswordMutation,
  useResendVerifyOtpMutation,
} from "@/lib/features/auth/features.auth";
import { cn } from "@/lib/cn";

/** Mirrors the server cooldown (typerush-server src/const/auth.const.ts). */
const COOLDOWN_SEC = 60;

/**
 * Resend with a visible countdown lock. Starts locked (callers render
 * this right after a code was sent); the button shows the exact wait —
 * "Resend code in 47s" — and can't fire until zero. 429s re-lock too.
 */
export function ResendButton({
  getEmail,
  kind,
}: {
  getEmail: () => string;
  kind: "signup" | "forgot";
}) {
  const [sendSignup, { isLoading: sendingA }] = useResendVerifyOtpMutation();
  const [sendForgot, { isLoading: sendingB }] = useForgotPasswordMutation();
  const [left, setLeft] = useState(COOLDOWN_SEC);
  const [notice, setNotice] = useState("");
  const sending = sendingA || sendingB;

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const resend = async () => {
    if (left > 0 || sending) return;
    const email = getEmail().trim().toLowerCase();
    if (!email) {
      setNotice("Enter your email above first.");
      return;
    }
    setNotice("");
    try {
      if (kind === "signup") await sendSignup({ email }).unwrap();
      else await sendForgot({ email }).unwrap();
      setNotice("Fresh code sent — check your inbox.");
      setLeft(COOLDOWN_SEC);
    } catch (e) {
      setNotice(getApiError(e));
      const status =
        e && typeof e === "object" && "status" in e
          ? (e as { status?: unknown }).status
          : undefined;
      if (status === 429) setLeft(COOLDOWN_SEC);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={resend}
        disabled={left > 0 || sending}
        aria-live="polite"
        className={cn(
          "w-full rounded-lg border px-4 py-2 text-[13px] font-bold transition",
          left > 0 || sending
            ? "cursor-not-allowed border-line text-faint"
            : "border-accent/40 text-accent hover:bg-accent/10"
        )}
      >
        {sending
          ? "Sending…"
          : left > 0
            ? `Resend code in ${left}s`
            : "Resend code"}
      </button>
      {notice && (
        <p role="status" className="mt-1.5 text-center text-xs text-muted">
          {notice}
        </p>
      )}
    </div>
  );
}
