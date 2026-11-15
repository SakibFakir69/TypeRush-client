"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ADSENSE_CLIENT, ADSENSE_CMP, isAdRoute } from "@/lib/ads";
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
 *
 * It is also injected ONLY on the ad routes. That keeps Google's code
 * away from the typing surfaces entirely (no request at all on `/test`,
 * `/practice/session` or `/battles`) and it confines AdSense's auto ads
 * to the same four pages.
 */
export function AdScript() {
  const { consent } = useAdConsent();
  const pathname = usePathname();

  const googleOwnsConsent = ADSENSE_CMP === "google";
  const mayLoad =
    Boolean(ADSENSE_CLIENT) &&
    (googleOwnsConsent || consent === "granted") &&
    isAdRoute(pathname);

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
