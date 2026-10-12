import Link from "next/link";
import { Rocket } from "lucide-react";
import { Card } from "@/components/ui/primitives";

/** Placeholder for app areas still in the oven. */
export function ComingSoon({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mx-auto max-w-xl">
      <Card className="p-10 text-center">
        <span className="mx-auto grid h-14 w-14 animate-pulse place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
          <Rocket size={26} strokeWidth={2} aria-hidden />
        </span>
        <div
          aria-hidden
          className="mx-auto mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-chip"
        >
          <div className="h-full w-1/2 animate-pulse rounded-full bg-accent/60" />
        </div>
        <h1 className="mt-4 text-2xl font-black tracking-tight">{title}</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted">{desc}</p>
        <p className="mt-1 text-xs font-bold text-accent">
          Features loading… coming soon, stay with us.
        </p>
        <Link
          href="/home"
          className="mt-5 inline-block rounded-lg bg-mint px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
        >
          ← Back to home
        </Link>
      </Card>
    </div>
  );
}
