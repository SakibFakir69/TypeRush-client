"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AD_CONSENT_KEY,
  adsterraEnabled,
} from "@/lib/ads";

/**
 * Advertising consent.
 *
 * Ads are ON by default: nothing asks the visitor to "accept" before the
 * site works, and no ad wall stands between them and the typing test.
 *
 * The answer still matters — a visitor who turns ads off from the cookie
 * policy stays opted out (localStorage), and the dialog is available at
 * any time from that page. It never appears on its own.
 */

const KEY = AD_CONSENT_KEY;

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

/**
 * The answer we act on.
 *
 * Ads are ON by default — nobody has to click "accept" to see the site
 * with its ads. An explicit choice (from the cookie policy) always wins:
 * "denied" keeps them off until the visitor turns them back on.
 */
function resolveConsent(): AdConsent {
  const stored = readStored();
  if (stored !== "unknown") return stored;
  return "granted";
}

export function AdConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<AdConsent>("unknown");
  const [answered, setAnswered] = useState(false);
  const [forced, setForced] = useState(false);
  const previous = useRef<AdConsent>("unknown");

  useEffect(() => {
    // The same shape as `lib/theme.tsx`: the read happens after the paint,
    // so the stored answer never differs between the server render and the
    // first client render (a returning visitor never sees the banner
    // flash), and no state is set synchronously in the effect.
    //
    // The timeout is a fallback for a hidden tab: `requestAnimationFrame`
    // does not fire there, and a tab that is never focused would sit
    // without a resolved consent state (and therefore without ads) until
    // it is opened.
    let done = false;
    const apply = () => {
      if (done) return;
      done = true;
      const resolved = resolveConsent();
      previous.current = resolved;
      setConsent(resolved);
      setAnswered(true);
    };
    const frame = requestAnimationFrame(apply);
    const timer = window.setTimeout(apply, 100);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);
  const grant = useCallback(() => {
    setConsent("granted");
    setForced(false);
    try {
      window.localStorage.setItem(KEY, "granted");
    } catch {
      /* storage blocked — the choice lasts for this page view only */
    }
  }, []);

  const deny = useCallback(() => {
    setConsent("denied");
    setForced(false);
    try {
      window.localStorage.setItem(KEY, "denied");
    } catch {
      /* storage blocked — the choice lasts for this page view only */
    }
  }, []);

  const reopen = useCallback(() => {
    // The previous answer is kept until the visitor picks again, so a
    // "cancel" can put it back exactly as it was — including the automatic
    // "granted" that applies where no consent is required.
    previous.current = resolveConsent();
    setForced(true);
    setConsent("unknown");
  }, []);

  const cancel = useCallback(() => {
    setForced(false);
    setConsent(previous.current);
  }, []);

  return (
    <AdConsentContext.Provider value={{ consent, grant, deny, reopen }}>
      {children}
      {answered ? <ConsentBanner forced={forced} onCancel={cancel} /> : null}
    </AdConsentContext.Provider>
  );
}

export function useAdConsent() {
  return useContext(AdConsentContext);
}

/**
 * The cookie-choices dialog.
 *
 * It only ever opens on purpose — from the cookie policy — never on its
 * own. Deliberately keyboard-friendly but NOT wired into the site's
 * shortcut map: a dialog that a stray key press dismisses (or accepts) is
 * a consent bug, and the site has a lot of typing.
 */
function ConsentBanner({
  forced,
  onCancel,
}: {
  forced: boolean;
  onCancel: () => void;
}) {
  const { consent, grant, deny } = useAdConsent();

  // Nothing to consent to when no ad network is configured.
  if (!adsterraEnabled("native") && !adsterraEnabled("banner")) {
    return null;
  }
  if (consent !== "unknown") return null;
  // Never a gate: the dialog exists only when the visitor asked for it.
  if (!forced) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-card/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-6 text-muted">
          We show ads from Adsterra to keep this site free. Adsterra may use
          cookies to personalise them. Ads are on by default — turn them off
          here whenever you like, the typing test works either way.
        </p>
        <div className="flex shrink-0 gap-2">
          {forced ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-chip"
            >
              Cancel
            </button>
          ) : null}
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
