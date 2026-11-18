"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import {
  ADSENSE_CMP,
  ADSTERRA_BANNER_KEY,
  ADSTERRA_BANNER_SIZE,
  ADSTERRA_BANNER_SRC,
  ADSTERRA_NATIVE_CONTAINER_ID,
  ADSTERRA_NATIVE_SRC,
  adsterraEnabled,
  thirdPartyAdConsent,
  type AdsterraKind,
} from "@/lib/ads";
import { useAdConsent } from "./AdConsentProvider";

/**
 * Adsterra units.
 *
 * Two formats only, and both are calm by design: a native widget that sits
 * in the copy, and a fixed 728×90 banner. The loud Adsterra formats
 * (popunder, social bar, interstitial) are deliberately not implemented —
 * they are hostile on a site people come to for a precise, timed activity,
 * and a popunder firing under an AdSense unit is an AdSense policy risk.
 *
 * Rules, same as `AdSlot`:
 *
 *  1. Never on a typing surface. These components are only mounted on the
 *     four ad routes, and nothing here runs on `/test`, `/practice/session`
 *     or `/battles`.
 *  2. Nothing loads before consent. No key means no markup, and no consent
 *     means no script, no iframe, no request to `bauval.org`.
 *  3. The box keeps its height whether the ad fills it or not, so accepting
 *     consent does not shove the article down the page.
 */

/** The native loader appends into this div — it must exist before the script runs. */
function NativeUnit() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = container.current;
    if (!host) return;

    // A client-side return to the page mounts a fresh div, but the script
    // from the last visit is still in the document and has already run —
    // it would never adopt the new container. Drop the old one first.
    document
      .querySelectorAll("script[data-adsterra-native]")
      .forEach((node) => node.remove());

    const script = document.createElement("script");
    script.async = true;
    script.dataset.cfasync = "false";
    script.dataset.adsterraNative = "true";
    script.src = ADSTERRA_NATIVE_SRC;

    // Same order as Adsterra's snippet: the loader, then the container it
    // fills. Inserted as a sibling so React never sees it.
    host.parentNode?.insertBefore(script, host);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div
      id={ADSTERRA_NATIVE_CONTAINER_ID}
      ref={container}
      className="w-full"
    />
  );
}

const WIDE_QUERY = "(min-width: 768px)";

function subscribeWide(onChange: () => void) {
  const mql = window.matchMedia(WIDE_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * The banner snippet, verbatim, wrapped in its own document. `atOptions`
 * stays scoped to the iframe instead of leaking onto `window`.
 */
const BANNER_DOC = [
  '<!doctype html><html><head><meta charset="utf-8">',
  "<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style>",
  "</head><body>",
  `<script>atOptions = ${JSON.stringify({
    key: ADSTERRA_BANNER_KEY,
    format: "iframe",
    height: ADSTERRA_BANNER_SIZE.height,
    width: ADSTERRA_BANNER_SIZE.width,
    params: {},
  })};<\/script>`,
  `<script src="${ADSTERRA_BANNER_SRC}"><\/script>`,
  "</body></html>",
].join("");

/**
 * The 728×90 banner, mounted only on a viewport wide enough to hold it.
 *
 * Adsterra's classic banner uses `document.write` when it runs, which is
 * why it must be placed inline in the HTML where it should render. This
 * app is a client-side route: injecting that script into the live
 * document would wipe the page. Rendering it inside a same-origin
 * `srcdoc` iframe gives the script its own document — the exact behaviour
 * of an inline placement, with no way to touch ours.
 */
function BannerUnit() {
  const wide = useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false
  );

  if (!wide) return null;

  return (
    <iframe
      title="Advertisement"
      width={ADSTERRA_BANNER_SIZE.width}
      height={ADSTERRA_BANNER_SIZE.height}
      scrolling="no"
      frameBorder={0}
      srcDoc={BANNER_DOC}
      className="block max-w-full"
    />
  );
}

export function AdsterraSlot({
  kind,
  className,
  label = "Advertisement",
}: {
  kind: AdsterraKind;
  className?: string;
  label?: string;
}) {
  const { consent } = useAdConsent();
  const enabled = adsterraEnabled(kind);

  // Google's CMP does not answer for Adsterra, so its "granted" only counts
  // when our own banner (or the "no consent required" jurisdiction) did.
  const mayShow =
    consent === "granted" &&
    (ADSENSE_CMP === "google" ? thirdPartyAdConsent() : true);

  // Nothing configured: render nothing at all, not an empty box.
  if (!enabled) return null;

  // A visitor who said no gets no gap either.
  if (consent === "denied") return null;

  return (
    <aside
      className={cn("my-8 overflow-hidden", className)}
      aria-label={label}
      data-ad-network="adsterra"
      data-ad-kind={kind}
    >
      <p className="mb-1 text-center text-[10px] uppercase tracking-[0.14em] text-faint">
        {label}
      </p>
      <div
        className={cn(
          "flex w-full justify-center",
          kind === "native"
            ? "min-h-[120px] sm:min-h-[200px]"
            : "min-h-[90px]"
        )}
      >
        {mayShow ? kind === "native" ? <NativeUnit /> : <BannerUnit /> : null}
      </div>
    </aside>
  );
}

/** Native widget — responsive, so it is the one that runs on the guides. */
export function AdsterraNative({ className }: { className?: string }) {
  return <AdsterraSlot kind="native" className={className} />;
}

/** 728×90 leaderboard — desktop only, above the footer. */
export function AdsterraBanner({ className }: { className?: string }) {
  return <AdsterraSlot kind="banner" className={className} />;
}
