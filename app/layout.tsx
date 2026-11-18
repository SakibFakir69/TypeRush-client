import type { Metadata } from "next";
import { Ubuntu, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import StoreProvider from "./StoreProvider";
import { AudioUnlock } from "@/components/ui/AudioUnlock";
import { ThemedToaster } from "@/components/ui/ThemedToaster";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AdConsentProvider } from "@/components/ads/AdConsentProvider";
import { ADSENSE_CLIENT } from "@/lib/ads";
import { SITE_URL, TITLE_TEMPLATE } from "@/lib/seo/site";
import "./globals.css";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // The one place the public origin lives. Every relative canonical, og:url
  // and image is resolved against it — a placeholder here silently points
  // the whole site at a domain nobody owns.
  metadataBase: new URL(SITE_URL),

  title: {
    default: "TypePotijogita — Free Online Typing Test & Competition",
    template: TITLE_TEMPLATE,
  },

  description:
    "Improve your typing speed with TypePotijogita. Take free typing tests, measure WPM and accuracy, practice daily, join typing competitions, and climb global leaderboards.",

  applicationName: "TypePotijogita",

  keywords: [
    "typing test",
    "typing speed test",
    "wpm test",
    "typing practice",
    "typing leaderboard",
    "typing contest",
    "test de frappe",
    "keyboard speed test",
  ],

  // No `alternates.canonical` here on purpose: a canonical set in the root
  // layout is inherited by every page that does not override it, which would
  // canonicalise /login, /signup and /test to the homepage. Each page that
  // should be indexed sets its own.

  openGraph: {
    type: "website",
    siteName: "TypePotijogita",
    title: "TypePotijogita — Practice. Compete. Improve.",
    description:
      "Test your typing speed, improve your accuracy, and compete with typists worldwide.",
    locale: "en_US",
    // No `url` here on purpose: it would be inherited by every page that
    // does not override `openGraph`, and a shared link to /login would then
    // claim to be the homepage. Each indexable page sets its own.
    // The image itself comes from `app/opengraph-image.tsx`, which Next
    // renders into the right absolute URL for this site.
  },

  twitter: {
    card: "summary_large_image",
    title: "TypePotijogita — Practice. Compete. Improve.",
    description:
      "Improve your typing speed, compete with others, and climb the leaderboard.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ubuntu.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AdConsentProvider>
          <ThemeProvider>
            <StoreProvider>
              <AudioUnlock />
              <MotionProvider>{children}</MotionProvider>
              <ThemedToaster />
            </StoreProvider>
          </ThemeProvider>
        </AdConsentProvider>
        <Analytics/>
        <SpeedInsights/>
        {/*
          The AdSense snippet, exactly as Google asks for it: a real
          <script> tag in the <head>, server-rendered, on every page.

          Two things are load-bearing here:

          - It has to be a REAL script tag in the initial HTML. The
            AdSense crawler reads the page source and never sees a script
            that is injected by hand after the visitor answered a consent
            banner — that is what made the site fail verification with
            "Couldn't verify your site". `next/script` is no good either:
            with `beforeInteractive` it only emits a <link rel="preload">,
            which the crawler does not accept. React hoists a plain
            <script async src> into the <head> and renders it server-side.
          - Consent is Google's job: their CMP (Funding Choices, or the
            European Regulations message they serve by default) blocks the
            ad request until the visitor has answered. The ad UNITS still
            only exist on the four ad routes.
        */}
        {ADSENSE_CLIENT ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </body>
    </html>
  );
}
