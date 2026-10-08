import type { ReactNode } from "react";
import { Card } from "@/components/ui/primitives";

/**
 * Standard two-column section shell:
 * left = intro (number, title, desc, CTA), right = content.
 * Keeps every landing block visually consistent (product-engineer pass).
 */
export function SectionShell({
  id,
  index,
  title,
  desc,
  action,
  children,
  accent = "text-accent",
}: {
  id: string;
  index: string;
  title: ReactNode;
  desc: string;
  action?: ReactNode;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <section id={id} className="grid scroll-mt-20 gap-3 lg:grid-cols-[280px_1fr]">
      <Card className="flex flex-col justify-center p-6">
        <p className={`text-xs font-bold ${accent}`}>{index}</p>
        <h2 className="mt-2 text-[22px] font-extrabold leading-tight tracking-tight">{title}</h2>
        <p className="mt-2 text-[13px] leading-5 text-muted">{desc}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </Card>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
