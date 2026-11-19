"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import {
  ADSTERRA_BANNER_KEY,
  ADSTERRA_BANNER_SIZE,
  ADSTERRA_BANNER_SRC,
  ADSTERRA_NATIVE_CONTAINER_ID,
  ADSTERRA_NATIVE_SRC,
  adsterraEnabled,
  type AdsterraKind,
} from "@/lib/ads";
import { useAdConsent } from "./AdConsentProvider";

/**
 * Adsterra units.
 *
 * Two formats only, and both are calm by design: a native widget that sits
 * in the copy, and a fixed 728×90 banner. The loud Adsterra formats
 * (popunder, social bar, interstitial) are deliberately not implemented —
 * they are hostile on a site people come to for a precise, timed activity.
 *
 * Rules:
 *
 *  1. Never on a typing surface. These components are only mounted on the
 *     landing page and the member lobbies, and nothing here runs on `/test`,
 *     `/practice/session` or a live battle/contest.
 *  2. No consent wall. Ads load for everyone, first visit included. A
 *     visitor who explicitly turned them off from the cookie policy gets no
 *     markup at all.
 *  3. The box keeps its height while the ad loads, so nothing jumps.
 */

/**
 * The native loader replaces `#container-<key>` with the creative, so React
 * must never own that node — a re-render would have nothing to reconcile.
 * The host div below is React's; everything inside it is created by the
 * effect and thrown away on unmount.
 */
function NativeUnit() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = host.current;
    if (!node) return;

    // A client-side return mounts a fresh host, but the previous loader
    // script may still be in the document and has already run — it would
    // never adopt the new container. Start from a clean subtree.
    node.innerHTML = "";

    const container = document.createElement("div");
    container.id = ADSTERRA_NATIVE_CONTAINER_ID;
    container.style.width = "100%";

    const script = document.createElement("script");
    script.async = true;
    script.dataset.cfasync = "false";
    script.dataset.adsterraNative = "true";
    script.src = ADSTERRA_NATIVE_SRC;

    // Same order as Adsterra's snippet: the loader, then the container it
    // fills.
    node.appendChild(script);
    node.appendChild(container);

    return () => {
      script.remove();
      node.innerHTML = "";
    };
  }, []);

  return <div ref={host} className="w-full" />;
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

  // Nothing configured: render nothing at all, not an empty box.
  if (!adsterraEnabled(kind)) return null;

  // A visitor who said no gets no gap either.
  if (consent === "denied") return null;

  // "unknown" lasts one frame while the stored answer is read; reserve the
  // box but do not start the network request until the answer is in. That is
  // what makes a stored "denied" actually prevent the request.
  const ready = consent === "granted";

  return (
    <aside
      className={cn("overflow-hidden", className)}
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
        {ready ? (kind === "native" ? <NativeUnit /> : <BannerUnit />) : null}
      </div>
    </aside>
  );
}

/** Native widget — responsive, the one used on the landing page and the rail. */
export function AdsterraNative({ className }: { className?: string }) {
  return <AdsterraSlot kind="native" className={className} />;
}

/** 728×90 leaderboard — desktop only, above the footer. */
export function AdsterraBanner({ className }: { className?: string }) {
  return <AdsterraSlot kind="banner" className={className} />;
}
