"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import {
  ADSENSE_CLIENT,
  ADSENSE_CMP,
  adsEnabled,
  slotId,
  type AdSlotKey,
} from "@/lib/ads";
import { useAdConsent } from "./AdConsentProvider";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * One ad unit.
 *
 * The unit is only rendered on the reading pages — never on a typing
 * surface — and only after consent. The box keeps its height whether the
 * ad shows or not, so accepting consent does not shove the article around
 * (a layout shift on a page the visitor is reading is a lost visitor).
 */
export function AdSlot({
  slot,
  className,
  label = "Advertisement",
}: {
  slot: AdSlotKey;
  className?: string;
  label?: string;
}) {
  const { consent } = useAdConsent();
  const pushed = useRef(false);

  const id = slotId(slot);
  const enabled = adsEnabled(slot);
  // With Google's CMP the consent decision is Google's, and the CMP is the
  // thing that blocks the ad request — so the unit itself is always
  // rendered. Without it, the unit waits for the visitor's answer.
  const mayShow =
    enabled && (ADSENSE_CMP === "google" || consent === "granted");

  useEffect(() => {
    if (!mayShow || pushed.current) return;
    pushed.current = true;
    // The loader picks the queue up when it runs, so pushing before it has
    // loaded is exactly how AdSense's own snippet behaves.
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* blocked or not loaded — the slot simply stays empty */
    }
  }, [mayShow]);

  // Ads are switched off: render nothing at all, not an empty box.
  if (!enabled) return null;

  // A visitor who said no gets no gap either — an empty "ADVERTISEMENT"
  // frame on a page they are reading looks broken.
  if (consent === "denied") return null;

  return (
    <aside
      className={cn("my-8 overflow-hidden", className)}
      aria-label={label}
      data-ad-slot-name={slot}
    >
      <p className="mb-1 text-center text-[10px] uppercase tracking-[0.14em] text-faint">
        {label}
      </p>
      {mayShow ? (
        <ins
          className="adsbygoogle block min-h-[100px] sm:min-h-[250px]"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={id ?? ""}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="min-h-[100px] w-full sm:min-h-[250px]" aria-hidden="true" />
      )}
    </aside>
  );
}
