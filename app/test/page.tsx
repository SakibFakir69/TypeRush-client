import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TestExperience } from "@/components/test/TestExperience";
import { getSessionUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Typing Test — TypeRush",
  description:
    "Take a focused 15, 30 or 60 second typing test with live WPM, accuracy and error tracking.",
};

/** Public arena: members practice in-app instead. */
export default async function TestPage() {
  const user = await getSessionUser();
  if (user) redirect("/practice");
  return (
    <div id="top" className="min-h-screen bg-app text-ink antialiased">
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
