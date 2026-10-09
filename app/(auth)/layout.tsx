import type { ReactNode } from "react";
import { KeyboardBackdrop } from "@/components/landing/KeyboardBackdrop";

/** Focused auth shell: keyboard world behind, single centered column. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen text-ink antialiased">
      <KeyboardBackdrop />
      {/* Symmetric flanking glows + center spotlight wash behind the card */}
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[6%] left-[6%] h-96 w-96 rounded-full blur-3xl"
        style={{ background: "color-mix(in srgb, var(--accent) 5%, transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[6%] right-[6%] h-96 w-96 rounded-full blur-3xl"
        style={{ background: "color-mix(in srgb, var(--accent) 5%, transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-1/2 h-[560px] w-[820px] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--accent) 9%, transparent), transparent)",
        }}
      />
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}
