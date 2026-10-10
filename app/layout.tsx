import type { Metadata } from "next";
import { Ubuntu, Geist_Mono } from "next/font/google";
import { ThemeProvider, ThemeScript } from "@/lib/theme";
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
  title: "TypeRush — Type faster. Go further.",
  description:
    "Improve your speed, accuracy, and consistency with focused practice, 1v1 battles, contests, and leaderboards.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ubuntu.variable} ${geistMono.variable} h-full antialiased`}
    >
      <ThemeScript />
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
