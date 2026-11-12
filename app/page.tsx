import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { DemoTyping } from "@/components/landing/DemoTyping";
import { ValueProps } from "@/components/landing/ValueProps";
import { PracticeSection } from "@/components/landing/PracticeSection";
import { BattleSection } from "@/components/landing/BattleSection";
import { LeaderboardSection } from "@/components/landing/LeaderboardSection";
import { ContestsSection } from "@/components/landing/ContestsSection";
import { ProgressSection } from "@/components/landing/ProgressSection";
import { TeamsSection } from "@/components/landing/TeamsSection";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { KeyboardBackdrop } from "@/components/landing/KeyboardBackdrop";
import { FaqSection } from "@/components/seo/FaqSection";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollJourney } from "@/components/ui/ScrollJourney";
import {
  LANDING_FAQ,
  appSchema,
  organizationSchema,
} from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Free Online Typing Test — Measure Your WPM",
  description:
    "Free online typing speed test: measure your WPM and accuracy in 15, 30 or 60 seconds, practise daily, race other typists and climb the global leaderboards.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "TypePotijogita — Free Online Typing Test & Competition",
    description:
      "Measure your typing speed and accuracy, practise daily, and compete with typists worldwide.",
    url: absoluteUrl("/"),
  },
};

/**
 * Landing (Server Component by default — Next 16 App Router).
 * Thin composition only. The interactive typing test lives on
 * /test; the hero shows a static preview to keep this page fast.
 * Each block reveals once on scroll (see Reveal).
 */
export default function Home() {
  return (
    <div id="top" className="relative min-h-screen text-ink antialiased">
      {/* The structured data for the landing page. The FAQPage schema is
          rendered by <FaqSection> itself, so the markup always matches the
          questions shown on the page. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(appSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
        }}
      />

      <ScrollJourney />
      <KeyboardBackdrop />
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:space-y-14">

        <section className="grid gap-4 lg:grid-cols-[1fr_1.55fr]">
          <Reveal>
            <Hero />
          </Reveal>
          <Reveal delay={0.1}>
            <DemoTyping />
          </Reveal>
        </section>

        <Reveal>
          <ValueProps />
        </Reveal>
        <Reveal>
          <PracticeSection />
        </Reveal>
        <Reveal>
          <BattleSection />
        </Reveal>
        <Reveal>
          <LeaderboardSection />
        </Reveal>
        <Reveal>
          <ContestsSection />
        </Reveal>
        <Reveal>
          <ProgressSection />
        </Reveal>
        <Reveal>
          <TeamsSection />
        </Reveal>
        <Reveal>
          <div className="mx-auto max-w-3xl">
            <FaqSection items={LANDING_FAQ} />
          </div>
        </Reveal>
        <Reveal>
          <CtaBanner />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
