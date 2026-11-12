import { ImageResponse } from "next/og";

/**
 * The social card for the whole site.
 *
 * Next renders this to a PNG and injects the right `og:image` /
 * `twitter:image` tags (with absolute URLs) into every page that does not
 * define its own image. A static file was never added, so every share used
 * to point at a 404.
 */

export const alt = "TypePotijogita — free online typing speed test and competition";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "radial-gradient(120% 120% at 10% 0%, #0d1a23 0%, #04090d 60%)",
          color: "#f1f5f9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 64,
              height: 64,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(46, 242, 200, 0.14)",
              color: "#2ef2c8",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            ⚡
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            Type<span style={{ color: "#2ef2c8" }}>Potijogita</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            Type faster. Go further.
          </div>
          <div style={{ fontSize: 30, color: "#94a3b8", maxWidth: 820 }}>
            Free typing speed test, daily practice, 1v1 battles, contests and
            global leaderboards.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {["Live WPM", "Accuracy", "Progress curve"].map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                padding: "12px 24px",
                borderRadius: 999,
                border: "1px solid rgba(46, 242, 200, 0.35)",
                background: "rgba(46, 242, 200, 0.08)",
                color: "#2ef2c8",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
