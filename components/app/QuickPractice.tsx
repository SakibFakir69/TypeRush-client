import Link from "next/link";
import { ArrowRight, Quote, Timer, WholeWord, PenLine, Zap } from "lucide-react";
import { Card } from "@/components/ui/primitives";

const TILES = [
  {
    Icon: Timer,
    title: "Timed Test",
    desc: "Race against the clock and improve your speed.",
    href: "/test",
  },
  {
    Icon: Quote,
    title: "Quotes",
    desc: "Real quotes, real challenges.",
    href: "/test",
  },
  {
    Icon: PenLine,
    title: "Custom Text",
    desc: "Type your own text or paste anything.",
    href: "/test",
  },
  {
    Icon: WholeWord,
    title: "Difficulties",
    desc: "Easy · Medium · Hard",
    href: "/test",
  },
];

export function QuickPractice() {
  return (
    <Card className="p-5">
      <p className="flex items-center gap-2 text-sm font-extrabold">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/10 text-accent">
          <Zap size={15} aria-hidden />
        </span>
        Quick Practice
      </p>
      <p className="mt-0.5 text-xs text-muted">Choose a mode and start typing</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {TILES.map(({ Icon, title, desc, href }) => (
          <Link
            key={title}
            href={href}
            className="group flex items-start gap-2.5 rounded-xl border border-line bg-inset p-3 transition hover:border-accent/40"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-chip text-accent">
              <Icon size={15} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold">{title}</span>
              <span className="block text-[11px] leading-4 text-muted">{desc}</span>
            </span>
            <ArrowRight
              size={14}
              aria-hidden
              className="mt-1 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-accent"
            />
          </Link>
        ))}
      </div>
    </Card>
  );
}
