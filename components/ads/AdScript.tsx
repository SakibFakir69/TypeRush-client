"use client";

import { useEffect } from "react";
import { ADSENSE_CLIENT, ADSENSE_CMP } from "@/lib/ads";
import { useAdConsent } from "./AdConsentProvider";

const ID = "adsense-loader";

/**
 * The AdSense loader — the only request this site ever makes to Google.
 *
 * It is injected by hand rather than with `next/script`, because a consent
 * gate means the script appears AFTER hydration: `next/script` collects
 * its scripts during the server render, so a component that only renders
 * the script once the visitor has accepted never gets it injected. A
 * plain `<script>` element is also exactly what AdSense's own snippet
 * does, and it is idempotent — the loader is added once and never twice.
 */
export function AdScript() {
  const { consent } = useAdConsent();

  const googleOwnsConsent = ADSENSE_CMP === "google";
  const mayLoad =
    Boolean(ADSENSE_CLIENT) && (googleOwnsConsent || consent === "granted");

  useEffect(() => {
    if (!mayLoad) return;
    if (document.getElementById(ID)) return;

    const script = document.createElement("script");
    script.id = ID;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    document.head.appendChild(script);
  }, [mayLoad]);

  return null;
}
