/**
 * The public origin of the site, written down exactly once.
 *
 * Every absolute URL — canonical tags, `og:url`, the sitemap, the robots
 * file, the JSON-LD and the Open Graph image — is built from `SITE_URL`, so
 * moving the domain is a one-line change (set `NEXT_PUBLIC_SITE_URL`).
 *
 * The default is the production Vercel host; the admin app lives on a
 * different domain and must never be canonicalised here.
 */
const raw = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://typerush-client.vercel.app"
).replace(/\/+$/, "");

export const SITE_URL = raw;

/** The brand name used in titles, schema and the manifest. */
export const SITE_NAME = "TypePotijogita";

/** `absoluteUrl("/progress")` → `https://typerush-client.vercel.app/progress`. */
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
