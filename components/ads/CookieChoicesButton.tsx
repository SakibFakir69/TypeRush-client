"use client";

import { ADSENSE_CMP } from "@/lib/ads";
import { useAdConsent } from "./AdConsentProvider";

declare global {
  interface Window {
    googlefc?: {
      showRevocationMessage?: () => void;
    };
  }
}

/**
 * The "cookie choices" link.
 *
 * A consent banner that cannot be reopened is not consent management —
 * the GDPR and the CCPA both require a way to change the answer later.
 *
 * When Google's CMP owns the consent UI, the button reopens Google's own
 * revocation dialog; otherwise it reopens our banner.
 */
export function CookieChoicesButton() {
  const { reopen } = useAdConsent();

  const onClick = () => {
    if (ADSENSE_CMP === "google") {
      const show = window.googlefc?.showRevocationMessage;
      if (show) {
        show();
        return;
      }
    }
    reopen();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold text-accent transition hover:bg-chip"
    >
      Change cookie choices
    </button>
  );
}
