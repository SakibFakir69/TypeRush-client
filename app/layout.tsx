import type { Metadata } from "next";
import { Ubuntu, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import StoreProvider from "./StoreProvider";
import { AudioUnlock } from "@/components/ui/AudioUnlock";
import { ThemedToaster } from "@/components/ui/ThemedToaster";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AdConsentProvider } from "@/components/ads/AdConsentProvider";
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
    "online typing competition",
    "host a typing contest",
  ],
  openGraph: {
    type: "website",
    siteName: "TypePotijogita",
    title: "TypePotijogita — Practice. Compete. Improve.",
    description:
      "Test your typing speed, improve your accuracy, and compete with typists worldwide.",
    locale: "en_US",
  },
  other: {
    "google-adsense-account": "ca-pub-6208140455870067",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/#website`,
      url: process.env.NEXT_PUBLIC_SITE_URL,
      name: "TypePotijogita",
      potentialAction: {
        "@type": "SearchAction",
        target: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "TypePotijogita",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free online typing test and typing competition platform — measure WPM, accuracy, and compete on global and organization leaderboards.",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ubuntu.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AdConsentProvider>
          <ThemeProvider>
            <StoreProvider>
              <AudioUnlock />
              <MotionProvider>{children}</MotionProvider>
              <ThemedToaster />
            </StoreProvider>
          </ThemeProvider>
        </AdConsentProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}