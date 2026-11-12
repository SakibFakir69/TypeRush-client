import { OgImage } from "@/components/seo/OgImage";

export const alt = "Typing practice — daily drills that show your progress";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return OgImage({
    eyebrow: "TYPING PRACTICE",
    title: "Practise typing and watch the curve",
    subtitle:
      "Timed drills, quotes and your own text — with a 7, 30 and 90-day progress chart.",
  });
}
