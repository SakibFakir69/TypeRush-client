import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TestExperience } from "@/components/test/TestExperience";

export const metadata: Metadata = {
  title: "Typing Test — TypeRush",
  description:
    "Take a focused 15, 30 or 60 second typing test with live WPM, accuracy and error tracking.",
};

/** Dedicated test route: single purpose, no landing clutter. */
export default function TestPage() {
  return (
    <div id="top" className="min-h-screen bg-app text-ink antialiased">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <TestExperience />
      </main>
      <Footer />
    </div>
  );
}
