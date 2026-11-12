import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * robots.txt
 *
 * The sitemap line must point at THIS site's own sitemap — a foreign domain
 * (or a 404) means crawlers never find the URL list at all.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Member areas answer with a redirect to /login; there is nothing
        // for a crawler to read there. The API proxy must never be indexed.
        disallow: [
          "/api/",
          "/backend/",
          "/home",
          "/practice",
          "/battles",
          "/contests",
          "/leaderboard",
          "/history",
          "/progress",
          "/achievements",
          "/profile",
          "/settings",
          "/maintenance",
          "/login",
          "/signup",
        ],
      },
      // AI crawlers: the guides are meant to be quoted.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
