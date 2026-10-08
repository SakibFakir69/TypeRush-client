import Image from "next/image";
import { Card, PrimaryButton, SectionTag } from "@/components/ui/primitives";

const AVATARS = [12, 32, 5, 47, 68];

export function Hero() {
  return (
    <Card className="flex h-full flex-col justify-center p-7">
      <SectionTag>⚡ The modern way to type</SectionTag>
      <h1 className="mt-4 text-[44px] font-extrabold leading-[1.02] tracking-tight sm:text-5xl">
        Type faster.
        <br />
        <span className="bg-gradient-to-r from-accent to-teal-500 bg-clip-text text-transparent">
          Go further.
        </span>
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
        Improve your speed, accuracy, and consistency with focused practice and real competition.
      </p>
      <div className="mt-5">
        <PrimaryButton href="/test">Start Typing Now →</PrimaryButton>
        <p className="mt-2.5 text-[11px] text-faint">
          or press{" "}
          <kbd className="rounded border border-line bg-chip px-1 font-bold tabular-nums text-muted">
            S
          </kbd>{" "}
          to start
        </p>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <div className="flex -space-x-2">
          {AVATARS.map((img) => (
            <Image
              key={img}
              src={`https://i.pravatar.cc/64?img=${img}`}
              alt="TypeRush typist"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full border-2 border-card object-cover"
            />
          ))}
        </div>
        <p className="text-xs leading-4 text-muted">
          <span className="font-bold text-ink">50K+ typists</span>
          <br />
          already improving
        </p>
      </div>
    </Card>
  );
}
