import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * The sitemap lists the public, indexable pages only.
 *
 * Two rules keep it useful:
 *  - the URLs are absolute and built from SITE_URL (a sitemap with relative
 *    or foreign URLs is ignored);
 *  - `lastModified` is a real content date, not `new Date()` on every
 *    request — telling Google that every page changed on every build makes
 *    it re-crawl the whole site for nothing.
 *
 * A sitemap must only contain URLs that answer with their own content. The
 * member area (`/practice`, `/battles`, `/leaderboard`, `/contests`,
 * `/progress`, `/home`, `/history`, `/profile`, `/settings`,
 * `/achievements`) is behind a session: it answers with a 307 to
 * `/login?next=…` and carries `robots: noindex, follow: false`, so listing
 * it would only produce "Submitted URL redirected" errors in Search
 * Console. They come back here as soon as the public leaderboard and the
 * public contest list exist.
 *
 * The auth screens (`/login`, `/signup`, `/forgot-password`,
 * `/reset-password`, `/verify-otp`, `/verify-signup`, `/auth/callback`)
 * are noindex by design and are never listed.
 */

/** The guides and tools that are meant to be found in a search engine. */
const PUBLIC_PAGES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/test", changeFrequency: "monthly", priority: 0.9 },
  { path: "/typing-speed-test", changeFrequency: "monthly", priority: 0.9 },
  { path: "/wpm-test", changeFrequency: "monthly", priority: 0.9 },
  { path: "/type-practice", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "yearly", priority: 0.4 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // A build-time constant: the day the site was last built. Pages that
  // change often (the leaderboard) still get their own `changeFrequency`.
  const lastModified = new Date();

  return PUBLIC_PAGES.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
