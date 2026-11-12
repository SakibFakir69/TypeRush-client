import { OgImage } from "@/components/seo/OgImage";

export const alt = "WPM test — typing speed benchmarks from 25 to 100+ WPM";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return OgImage({
    eyebrow: "WPM TEST",
    title: "How fast do you type?",
    subtitle:
      "Typical typing speed ranges, how accuracy is scored, and what to aim for next.",
  });
}
