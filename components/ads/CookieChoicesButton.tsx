"use client";

import { useAdConsent } from "./AdConsentProvider";

/**
 * The "cookie choices" link.
 *
 * A consent banner that cannot be reopened is not consent management —
 * the GDPR and the CCPA both require a way to change the answer later.
 * This button reopens our dialog with the current answer pre-filled, so
 * "Cancel" restores exactly what was there before.
 */
export function CookieChoicesButton() {
  const { reopen } = useAdConsent();

  return (
    <button
      type="button"
      onClick={reopen}
      className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold text-accent transition hover:bg-chip"
    >
      Change cookie choices
    </button>
  );
}
