import { OgImage } from "@/components/seo/OgImage";

export const alt = "Free typing speed test — measure your WPM and accuracy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return OgImage({
    eyebrow: "FREE TYPING TEST",
    title: "Measure your typing speed in 15, 30 or 60 seconds",
    subtitle:
      "Live words per minute, accuracy and error tracking — no account needed.",
  });
}
