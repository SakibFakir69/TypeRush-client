import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-card shadow-[var(--card-shadow)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/[0.08] px-2.5 py-1 text-[11px] font-semibold text-accent">
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  href = "#",
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-lg bg-mint px-4 py-2.5 text-sm font-bold text-black transition hover:brightness-110 active:brightness-95"
    >
      {children}
    </a>
  );
}

export function GhostButton({
  children,
  href = "#",
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink transition hover:border-line hover:bg-chip"
    >
      {children}
    </a>
  );
}
