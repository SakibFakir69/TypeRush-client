import { ImageResponse } from "next/og";

/**
 * The shared social card.
 *
 * Every guide page renders its own card through this component, so a shared
 * link looks like that page (not a generic homepage) and each one still
 * costs a single file.
 */
export function OgImage({
  eyebrow,
  title,
  subtitle,
}: {
  /** Small label above the title, e.g. "GUIDE". */
  eyebrow: string;
  /** The headline — keep it under ~40 characters. */
  title: string;
  /** One line of supporting copy. */
  subtitle: string;
}) {
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

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "10px 22px",
              borderRadius: 999,
              border: "1px solid rgba(46, 242, 200, 0.35)",
              background: "rgba(46, 242, 200, 0.08)",
              color: "#2ef2c8",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 940,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, color: "#94a3b8", maxWidth: 880 }}>
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 26,
            fontWeight: 700,
            color: "#2ef2c8",
          }}
        >
          <span>Free typing test</span>
          <span style={{ color: "#64748b" }}>·</span>
          <span style={{ color: "#94a3b8" }}>Live WPM &amp; accuracy</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
