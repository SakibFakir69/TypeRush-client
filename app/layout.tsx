import type { Metadata } from "next";
import { Ubuntu, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import StoreProvider from "./StoreProvider";
import { AudioUnlock } from "@/components/ui/AudioUnlock";
import { ThemedToaster } from "@/components/ui/ThemedToaster";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { SITE_URL } from "@/lib/seo/site";
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
    template: "%s | TypePotijogita",
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
    url: SITE_URL,
    siteName: "TypePotijogita",
    title: "TypePotijogita — Practice. Compete. Improve.",
    description:
      "Test your typing speed, improve your accuracy, and compete with typists worldwide.",
    locale: "en_US",
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
        <ThemeProvider>
          <StoreProvider>
            <AudioUnlock />
            <MotionProvider>{children}</MotionProvider>
            <ThemedToaster />
          </StoreProvider>
        </ThemeProvider>
        <Analytics/>
        <SpeedInsights/>
      </body>
    </html>
  );
}
