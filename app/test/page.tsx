import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TestExperience } from "@/components/test/TestExperience";
import { getSessionUser } from "@/lib/server/session";
import { absoluteUrl, ogImages } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Free Typing Test",
  description:
    "Take a focused 15, 30 or 60 second typing test with live WPM, accuracy and error tracking. No account needed.",
  alternates: { canonical: "/test" },
  openGraph: {
    title: "Free typing test — live WPM and accuracy",
    description:
      "Take a focused 15, 30 or 60 second typing test with live WPM, accuracy and error tracking. No account needed.",
    url: absoluteUrl("/test"),
    images: ogImages("TypePotijogita typing test and competition platform"),
  },
};

/** The structured data for the public arena. */
const testSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "TypePotijogita Typing Test",
  url: absoluteUrl("/test"),
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  description:
    "A free typing speed test that measures words per minute, accuracy and errors in 15, 30 or 60 second runs.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

/** Public arena: members practice in-app instead. */
export default async function TestPage() {
  const user = await getSessionUser();
  if (user) redirect("/practice");
  return (
    <div id="top" className="min-h-screen bg-app text-ink antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(testSchema).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Suspense
          fallback={
            <div className="mx-auto w-full max-w-4xl animate-pulse rounded-2xl border border-line bg-card p-10 text-center text-sm text-muted">
              Loading practice arena…
            </div>
          }
        >
          <TestExperience />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
