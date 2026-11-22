import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
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
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}