import { Crosshair, Trophy, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import { VALUE_PROPS } from "@/lib/landing";

type Extra = {
  Icon: LucideIcon;
  keys: string[];
  proof: string;
};

const EXTRAS: Record<string, Extra> = {
  "Improve Speed": {
    Icon: Zap,
    keys: ["A", "S", "D", "F"],
    proof: "Adaptive speed drills",
  },
  "Better Accuracy": {
    Icon: Crosshair,
    keys: ["J", "K", "L", "✓"],
    proof: "Real-time error feedback",
  },
  "Compete & Win": {
    Icon: Trophy,
    keys: ["1", "V", "1", "★"],
    proof: "Live 1v1 + weekly cups",
  },
  "Track Progress": {
    Icon: TrendingUp,
    keys: ["P", "B", "↗", "+"],
    proof: "Your WPM curve, weekly",
  },
};

export function ValueProps() {
  return (
    <div className="grid gap-2 rounded-2xl border border-line bg-card p-3 sm:grid-cols-2 lg:grid-cols-4">
      {VALUE_PROPS.map((f) => {
        const extra = EXTRAS[f.title];
        const Icon = extra.Icon;
        return (
          <div
            key={f.title}
            className="group flex flex-col rounded-xl p-4 transition hover:bg-chip"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent transition-transform duration-200 group-hover:scale-110">
                <Icon size={19} strokeWidth={2.2} aria-hidden />
              </span>
              <p className="text-sm font-bold tracking-tight">{f.title}</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted">{f.desc}</p>
            <div className="mt-3 flex items-center gap-1 border-t border-line pt-3">
              <div className="flex gap-1" aria-hidden>
                {extra.keys.map((k, i) => (
                  <span
                    key={i}
                    className="mini-key grid h-6 w-6 place-items-center rounded-[6px] border border-line bg-inset text-[10px] font-bold text-muted"
                    style={{ animationDelay: `${(i * 0.22).toFixed(2)}s` }}
                  >
                    {k}
                  </span>
                ))}
              </div>
              <p className="ml-auto text-right text-[11px] font-medium leading-4 text-accent">
                {extra.proof}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
