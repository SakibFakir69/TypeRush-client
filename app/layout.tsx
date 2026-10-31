import type { Metadata } from "next";
import { Ubuntu, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import StoreProvider from "./StoreProvider";
import { AudioUnlock } from "@/components/ui/AudioUnlock";
import { ThemedToaster } from "@/components/ui/ThemedToaster";
import { MotionProvider } from "@/components/ui/MotionProvider";
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
  metadataBase: new URL("https://YOUR-DOMAIN.com"),

  title: {
    default: "TypeRush — Free Online Typing Test & Competition",
    template: "%s | TypeRush",
  },

  description:
    "Improve your typing speed with TypeRush. Take free typing tests, measure WPM and accuracy, practice daily, join typing competitions, and climb global leaderboards.",

  applicationName: "TypeRush",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: "/",
    siteName: "TypeRush",
    title: "TypeRush — Practice. Compete. Improve.",
    description:
      "Test your typing speed, improve your accuracy, and compete with typists worldwide.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TypeRush typing test and competition platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "TypeRush — Practice. Compete. Improve.",
    description:
      "Improve your typing speed, compete with others, and climb the leaderboard.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
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
      </body>
    </html>
  );
}
