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
import { Reveal } from "@/components/ui/Reveal";

/**
 * Landing (Server Component by default — Next 16 App Router).
 * Thin composition only. The interactive typing test lives on
 * /test; the hero shows a static preview to keep this page fast.
 * Each block reveals once on scroll (see Reveal).
 */
export default function Home() {
  return (
    <div id="top" className="relative min-h-screen text-ink antialiased">
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
          <CtaBanner />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
