import Link from "next/link";
import { Quote, Timer, WholeWord, PenLine, Zap } from "lucide-react";
import { Card } from "@/components/ui/primitives";

const TILES = [
  { Icon: Timer, title: "Timed", href: "/practice/session?kind=Words" },
  { Icon: Quote, title: "Quotes", href: "/practice/session?kind=Quotes" },
  { Icon: PenLine, title: "Custom", href: "/practice/session?kind=Custom" },
  { Icon: WholeWord, title: "Levels", href: "/practice" },
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
      <div className="mt-3 grid grid-cols-2 gap-2">
        {TILES.map(({ Icon, title, href }) => (
          <Link
            key={title}
            href={href}
            className="group flex flex-col items-center gap-2 rounded-xl border border-line bg-inset px-2 py-4 transition hover:border-accent/50 hover:bg-chip"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/10 text-accent transition group-hover:bg-accent/20">
              <Icon size={16} aria-hidden />
            </span>
            <span className="text-[13px] font-bold">{title}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
