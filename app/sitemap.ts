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
 * Member areas (/practice, /battles, /contests, /progress, …) are NOT
 * listed: they answer with a redirect to /login, and a sitemap should only
 * ever point at pages that can be read without an account. They come back
 * here once the public leaderboard and contest list exist.
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
