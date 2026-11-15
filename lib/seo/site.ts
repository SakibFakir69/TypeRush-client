/**
 * The public origin of the site, written down exactly once.
 *
 * Every absolute URL — canonical tags, `og:url`, the sitemap, the robots
 * file, the JSON-LD and the Open Graph image — is built from `SITE_URL`, so
 * moving the domain is a one-line change.
 *
 * The production origin is FIXED to the real domain. A preview deploy must
 * canonicalise to the production domain too (a preview URL must never be
 * the canonical one), and a stray `NEXT_PUBLIC_SITE_URL` left over from
 * another host must not be able to point the canonicals, the sitemap and
 * the social cards at the wrong domain. The env var is therefore only
 * honoured while developing.
 *
 * The admin app lives on a different domain and must never be
 * canonicalised here.
 */
const PROD_URL = "https://typepotijogita.com";

const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

const raw = (
  process.env.NODE_ENV === "production" ? PROD_URL : envUrl || PROD_URL
).replace(/\/+$/, "");

export const SITE_URL = raw;

/** The brand name used in titles, schema and the manifest. */
export const SITE_NAME = "TypePotijogita";

/**
 * The title suffix used on every page.
 *
 * Next applies a layout's `title.template` to its CHILD segments only, and
 * a layout that defines a title of its own RESETS the inherited template
 * for everything below it (see `resolve-metadata.js`: the template is
 * re-stashed from the segment's own title object). So any layout with a
 * title has to re-declare the template, and it has to be the same string —
 * which is why it lives here instead of being typed twice.
 */
export const TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

/** `absoluteUrl("/progress")` → `https://typepotijogita.com/progress`. */
export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The social card to attach to a page that defines its own `openGraph`.
 *
 * Next merges `openGraph` shallowly: a page that sets its own title and
 * description drops the images it inherited. Pages without their own card
 * use the site-wide one from `app/opengraph-image.tsx`.
 */
export function ogImages(alt: string) {
  return [
    {
      url: absoluteUrl("/opengraph-image"),
      width: 1200,
      height: 630,
      alt,
    },
  ];
}
