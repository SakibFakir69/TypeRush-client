import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Free Online Typing Test`,
    short_name: SITE_NAME,
    description:
      "Free online typing speed test with live WPM and accuracy, daily practice, typing contests and global leaderboards.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#04090d",
    theme_color: "#04090d",
    categories: ["education", "productivity", "utilities"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
