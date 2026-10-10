import type { Metadata } from "next";
import { Ubuntu, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import StoreProvider from "./StoreProvider";
import { AudioUnlock } from "@/components/ui/AudioUnlock";
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
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <StoreProvider>
            <AudioUnlock />
            <MotionProvider>{children}</MotionProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
