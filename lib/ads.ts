/**
 * Ad configuration — Adsterra only.
 *
 * Two rules, and they are not negotiable:
 *
 *  1. **An ad never touches a typing surface.** `/test`, `/practice/session`
 *     and the live battle/contest screens are timed, keyboard-driven
 *     screens. An ad beside the text is an accidental click. Units only
 *     exist on the landing page and the member lobby screens
 *     (`MEMBER_AD_ROUTES`).
 *  2. **An ad never interrupts.** Only Adsterra's native widget and a fixed
 *     728×90 banner are used — never a popunder, a social bar or an
 *     interstitial. Ads are on by default for everyone; a visitor can turn
 *     them off from the cookie policy and that choice is remembered.
 */

/**
 * The countries where ad consent would normally be asked for: the
 * EU/EEA, the UK, Switzerland, Brazil (LGPD) and South Korea (PIPA).
 *
 * The flag is still written by the middleware so the jurisdiction is
 * known to the client, but ads no longer wait for an answer — there is no
 * consent wall anywhere.
 */
export const CONSENT_COUNTRIES = new Set([
  // EU
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR",
  "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO",
  "SE", "SI", "SK",
  // EEA + others
  "IS", "LI", "NO", "GB", "CH", "BR", "KR",
]);

/**
 * Does this country fall in the "consent required" bucket?
 *
 * An unknown country is treated as "required" — the safe default, and the
 * reason the flag is still set in local development (Vercel only sends the
 * country header in production).
 */
export function countryNeedsConsent(country: string | undefined | null) {
  const code = (country ?? "").trim().toUpperCase();
  if (!code) return true;
  return CONSENT_COUNTRIES.has(code);
}

/** The cookie the middleware writes with the jurisdiction flag. */
export const CONSENT_COOKIE = "tp-ad-consent";

/**
 * The member pages that carry the right-rail unit.
 *
 * These are the LOBBY screens only — the practice hub, the battle queue and
 * the contest list. They match exactly, on purpose: `/practice/session`,
 * `/battles/<id>`, `/battles/invite` and `/contests/<id>` are typing
 * surfaces and must never inherit a rail from a prefix match.
 */
export const MEMBER_AD_ROUTES = ["/practice", "/battles", "/contests"] as const;

export function isMemberAdRoute(pathname: string): boolean {
  return (MEMBER_AD_ROUTES as readonly string[]).includes(pathname);
}

/* ------------------------------------------------------------------------ *
 * Adsterra
 *
 * Only the two calm formats are implemented: a native widget that sits in
 * the copy and a fixed 728×90 banner. The loud Adsterra formats (popunder,
 * social bar, interstitial) are deliberately absent — they are hostile on a
 * site people come to for a precise, timed activity.
 * ------------------------------------------------------------------------ */

/** The native-banner slot key Adsterra handed out for this site. */
export const ADSTERRA_NATIVE_KEY = "b340ba717df22b1e2b82b6f7e08eef4d";

/** The 728×90 slot key. */
export const ADSTERRA_BANNER_KEY = "4501a6dddda3b6360853867a7f5e5d20";

/** The creative host Adsterra handed out for this site (their docs call it "the domain in your snippet"). */
export const ADSTERRA_HOST = "https://bauval.org";

/** `<script src>` for the native banner widget. */
export const ADSTERRA_NATIVE_SRC = `${ADSTERRA_HOST}/21/${ADSTERRA_NATIVE_KEY}`;

/** `<script src>` for the 728×90 banner. */
export const ADSTERRA_BANNER_SRC = `${ADSTERRA_HOST}/22/${ADSTERRA_BANNER_KEY}`;

/**
 * The div the native loader looks for. It has to be in the DOM before the
 * script runs — that is the whole integration.
 */
export const ADSTERRA_NATIVE_CONTAINER_ID = `container-${ADSTERRA_NATIVE_KEY}`;

/** The one banner size we use. Fixed size = a container that never jumps. */
export const ADSTERRA_BANNER_SIZE = { width: 728, height: 90 } as const;

/**
 * The publisher id for `ads.txt` (`Adsterra → Sites → ads.txt`).
 *
 * Adsterra will not serve reliably until the line is in the file, but the
 * id is not in the snippets — set `NEXT_PUBLIC_ADSTERRA_PUBLISHER` in the
 * environment and `/ads.txt` adds it. Empty means the line is simply left
 * out.
 */
export const ADSTERRA_PUBLISHER = (
  process.env.NEXT_PUBLIC_ADSTERRA_PUBLISHER ?? ""
).trim();

export type AdsterraKind = "native" | "banner";

/** Is this format configured? A missing key means no markup and no request. */
export function adsterraEnabled(kind: AdsterraKind): boolean {
  return kind === "native"
    ? Boolean(ADSTERRA_NATIVE_KEY)
    : Boolean(ADSTERRA_BANNER_KEY);
}

/* ------------------------------------------------------------------------ *
 * Advertising consent
 * ------------------------------------------------------------------------ */

/** Where our own consent answer (granted/denied) is stored. */
export const AD_CONSENT_KEY = "typerush-ads-consent";

export type StoredAdConsent = "unknown" | "granted" | "denied";

/** The answer the visitor gave to our dialog, if any. */
export function storedAdConsent(): StoredAdConsent {
  if (typeof window === "undefined") return "unknown";
  try {
    const value = window.localStorage.getItem(AD_CONSENT_KEY);
    if (value === "granted" || value === "denied") return value;
  } catch {
    /* storage blocked — treat as "not answered yet" */
  }
  return "unknown";
}

/** The jurisdiction flag the middleware wrote ("required" | "auto"). */
export function adConsentJurisdiction(): "required" | "auto" {
  if (typeof window === "undefined") return "required";
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE}=([^;]+)`)
  );
  return match?.[1] === "auto" ? "auto" : "required";
}

/**
 * Did the visitor explicitly accept our own dialog?
 *
 * Ads no longer wait for this — they are on by default. It is kept for the
 * cookie-policy path, where an answer has to survive the reload, and it is
 * the only signal that can distinguish "never asked" from "clicked yes".
 */
export function thirdPartyAdConsent(): boolean {
  if (typeof window === "undefined") return false;
  const stored = storedAdConsent();
  if (stored !== "unknown") return stored === "granted";
  return adConsentJurisdiction() === "auto";
}
