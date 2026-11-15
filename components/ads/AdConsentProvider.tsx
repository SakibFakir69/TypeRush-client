"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ADSENSE_CLIENT, ADSENSE_CMP } from "@/lib/ads";

/**
 * Advertising consent.
 *
 * The visitor picks first, the ad script loads second. Nothing that talks
 * to Google is requested before the answer is "granted", which is what
 * GDPR/UK GDPR (and the US state laws) actually require — a banner that
 * only *says* "we use cookies" while the requests already happened is not
 * consent.
 *
 * Google's Funding Choices CMP (`NEXT_PUBLIC_ADSENSE_CMP=google`) is the
 * recommended path in the EEA: it is TCF-certified, it is free, and it
 * blocks the ad requests itself. When it is enabled our own banner steps
 * aside and lets Google draw it.
 */

const KEY = "typerush-ads-consent";

export type AdConsent = "unknown" | "granted" | "denied";

type AdConsentValue = {
  consent: AdConsent;
  grant: () => void;
  deny: () => void;
  /** Opens the banner again — the "privacy options" link. */
  reopen: () => void;
};

const AdConsentContext = createContext<AdConsentValue>({
  consent: "unknown",
  grant: () => {},
  deny: () => {},
  reopen: () => {},
});

function readStored(): AdConsent {
  try {
    const value = window.localStorage.getItem(KEY);
    if (value === "granted" || value === "denied") return value;
  } catch {
    /* storage blocked — treat as "not answered yet" */
  }
  return "unknown";
}

export function AdConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<AdConsent>("unknown");
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    // The same shape as `lib/theme.tsx`: the read happens after the paint,
    // so the stored answer never differs between the server render and the
    // first client render (a returning visitor never sees the banner
    // flash), and no state is set synchronously in the effect.
    const frame = requestAnimationFrame(() => {
      setConsent(readStored());
      setAnswered(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const grant = useCallback(() => {
    setConsent("granted");
    try {
      window.localStorage.setItem(KEY, "granted");
    } catch {
      /* storage blocked — the choice lasts for this page view only */
    }
  }, []);

  const deny = useCallback(() => {
    setConsent("denied");
    try {
      window.localStorage.setItem(KEY, "denied");
    } catch {
      /* storage blocked — the choice lasts for this page view only */
    }
  }, []);

  const reopen = useCallback(() => {
    setConsent("unknown");
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AdConsentContext.Provider value={{ consent, grant, deny, reopen }}>
      {children}
      {answered && <ConsentBanner />}
    </AdConsentContext.Provider>
  );
}

export function useAdConsent() {
  return useContext(AdConsentContext);
}

/**
 * The banner itself.
 *
 * Deliberately keyboard-friendly but NOT wired into the site's shortcut
 * map: a banner that a stray key press dismisses (or accepts) is a
 * consent bug, and the site has a lot of typing.
 */
function ConsentBanner() {
  const { consent, grant, deny } = useAdConsent();

  // Nothing to consent to when no ad client is configured, and nothing to
  // do when Google owns the consent UI.
  if (!ADSENSE_CLIENT || ADSENSE_CMP === "google") return null;
  if (consent !== "unknown") return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-card/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-6 text-muted">
          We use Google AdSense to show ads and keep this site free. Google
          may use cookies to personalise them. You can accept, or keep ads
          off — the typing test works either way.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={deny}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-chip"
          >
            No thanks
          </button>
          <button
            type="button"
            onClick={grant}
            className="rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
          >
            Accept ads
          </button>
        </div>
      </div>
    </div>
  );
}
