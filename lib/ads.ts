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
