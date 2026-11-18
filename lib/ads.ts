/**
 * Ad configuration.
 *
 * Three rules, and they are not negotiable:
 *
 *  1. **An ad never touches a typing surface.** `/test`, `/practice/session`
 *     and `/battles` are timed, keyboard-driven screens. An ad next to the
 *     text is an accidental click, and accidental clicks are the fastest
 *     way to get an AdSense policy strike (and the fastest way to lose a
 *     typist forever). Ads only ever go on the reading pages.
 *  2. **Nothing loads before consent.** The loader is injected only after
 *     the visitor accepts, so a rejected visitor never makes a request to
 *     Google at all.
 *  3. **The feature is inert until it is configured.** No client id and no
 *     real slot id means no markup, no script, no cookie. The site behaves
 *     exactly as it does today.
 */

/** The AdSense publisher id (`ca-pub-...`). Set it in the environment. */
export const ADSENSE_CLIENT = (
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? ""
).trim();

/**
 * `"google"` hands the consent UI to Google's Funding Choices CMP (the
 * free, TCF-certified one). Leave it empty to use our own banner.
 */
export const ADSENSE_CMP = (
  process.env.NEXT_PUBLIC_ADSENSE_CMP ?? ""
).trim();

/**
 * The routes that may carry an ad.
 *
 * The AdSense loader is only injected on these routes, so Google's code
 * never even reaches the browser on a typing surface — `/test`,
 * `/practice/session` and `/battles` make no request to Google at all.
 * This also constrains AdSense *auto ads* (which are injected by the
 * loader wherever it runs) to the same four pages.
 */
export const AD_ROUTES = [
  "/",
  "/typing-speed-test",
  "/wpm-test",
  "/type-practice",
] as const;

/**
 * The countries where ad consent has to be asked for before anything
 * loads: the EU/EEA, the UK, Switzerland, Brazil (LGPD) and South Korea
 * (PIPA).
 *
 * Everywhere else — the US, India, Bangladesh, Canada, most of Asia and
 * Africa — no consent gate is required for ad cookies, so those visitors
 * get the ads straight away with no banner and no "skip". That is the
 * difference between a banner on every page and ads that simply show up.
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
 * Does this country have to ask for consent first?
 *
 * An unknown country is treated as "ask" — the safe default, and the
 * reason the banner still shows in local development (Vercel only sends
 * the country header in production).
 */
export function countryNeedsConsent(country: string | undefined | null) {
  const code = (country ?? "").trim().toUpperCase();
  if (!code) return true;
  return CONSENT_COUNTRIES.has(code);
}

/** The cookie the middleware writes with the jurisdiction flag. */
export const CONSENT_COOKIE = "tp-ad-consent";

/** Is this path one of the routes that may carry an ad? */
export function isAdRoute(pathname: string): boolean {
  return AD_ROUTES.some(
    (route) => route === "/" ? pathname === "/" : pathname.startsWith(route)
  );
}

/**
 * The ad units, keyed by where they are rendered.
 *
 * Replace every `REPLACE_WITH_SLOT_ID` with the unit id from the AdSense
 * dashboard (AdSense → Ad units → the `ca-pub-...` slot id, the digits
 * only). A slot still holding the placeholder is not rendered at all, so a
 * half-configured account cannot show a broken unit.
 *
 * Without any slot id the site still works: the loader is loaded on the
 * ad routes and AdSense's own auto ads (if they are switched on in the
 * dashboard) fill those pages. The units below are the precise,
 * hand-placed version of the same thing.
 */
export const AD_SLOTS = {
  /** Landing page, below the hero. */
  home: "REPLACE_WITH_SLOT_ID",
  /** /typing-speed-test, after the first section. */
  "typing-speed-test": "REPLACE_WITH_SLOT_ID",
  /** /wpm-test, after the first section. */
  "wpm-test": "REPLACE_WITH_SLOT_ID",
  /** /type-practice, after the first section. */
  "type-practice": "REPLACE_WITH_SLOT_ID",
} as const;

export type AdSlotKey = keyof typeof AD_SLOTS;

/** A slot id that was never filled in. */
export function isPlaceholderSlot(slot: string) {
  return slot.startsWith("REPLACE_WITH");
}

/** The real slot id for a placement, or null when it is not configured. */
export function slotId(key: AdSlotKey): string | null {
  const id = AD_SLOTS[key];
  if (!id || isPlaceholderSlot(id)) return null;
  return id;
}

/** Ads render only when a publisher id and a real slot id are present. */
export function adsEnabled(key: AdSlotKey): boolean {
  return Boolean(ADSENSE_CLIENT) && slotId(key) !== null;
}

/* ------------------------------------------------------------------------ *
 * Adsterra (second network)
 *
 * AdSense is the primary: it is approved, it is stable and it pays the
 * bills where the traffic is tier-1. Adsterra is the fallback for the
 * traffic AdSense underpays (South Asia, South-East Asia) — but only its
 * two calm formats, never popunder / social bar / interstitial.
 *
 * Same rule as AdSense, and it is not negotiable: an Adsterra unit never
 * touches a typing surface (`/test`, `/practice/session`, `/battles`) and
 * never loads before the visitor said yes. Adsterra is not a Google
 * vendor, so Google's own CMP does not answer for it — see
 * `thirdPartyAdConsent()`.
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

/** The answer the visitor gave to OUR banner, if any. */
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
 * May a network that is NOT covered by Google's CMP load anything?
 *
 * Google's Funding Choices consent is TCF-scoped: it covers Google's own
 * vendors, not Adsterra. So with `NEXT_PUBLIC_ADSENSE_CMP=google` the
 * provider resolves to "granted" for everyone, and Adsterra must not read
 * that as permission. It loads only when the visitor accepted OUR banner,
 * or where no consent is required at all (the middleware's "auto"
 * jurisdiction). In the EEA/UK that means Adsterra simply stays off, which
 * is the safe direction to be wrong in.
 */
export function thirdPartyAdConsent(): boolean {
  if (typeof window === "undefined") return false;
  const stored = storedAdConsent();
  if (stored !== "unknown") return stored === "granted";
  return adConsentJurisdiction() === "auto";
}
