import { Crosshair, Flame, Layers, Swords, Trophy, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AchievementCategory } from "@/lib/features/achievements/features.achievements";

/**
 * How every achievement category is presented: its icon, its unit and the
 * sentence that explains the goal. Shared by the achievements shelf and the
 * progress screen so a badge never changes meaning between the two.
 */

export type CategoryMeta = {
  id: AchievementCategory;
  label: string;
  Icon: LucideIcon;
  /** How the threshold is read, e.g. "WPM". */
  unit: string;
  /** What the goal is, in words. */
  goal: string;
};

export const CATEGORY_META: CategoryMeta[] = [
  {
    id: "speed",
    label: "Speed",
    Icon: Zap,
    unit: "WPM",
    goal: "reach a faster run",
  },
  {
    id: "accuracy",
    label: "Accuracy",
    Icon: Crosshair,
    unit: "%",
    goal: "type more precisely",
  },
  {
    id: "volume",
    label: "Volume",
    Icon: Layers,
    unit: "runs",
    goal: "finish more runs",
  },
  {
    id: "streak",
    label: "Streak",
    Icon: Flame,
    unit: "days",
    goal: "keep a daily streak",
  },
  {
    id: "contest",
    label: "Contest",
    Icon: Trophy,
    unit: "contests",
    goal: "join more contests",
  },
  {
    id: "social",
    label: "Battles",
    Icon: Swords,
    unit: "battles",
    goal: "win more duels",
  },
];

export const CATEGORY_BY_ID: Record<string, CategoryMeta> = Object.fromEntries(
  CATEGORY_META.map((meta) => [meta.id, meta])
);

/** Tier colours: 1 = bronze, 2 = silver, 3 = gold. */
export const TIER_STYLE: Record<
  number,
  { label: string; chip: string; ring: string; text: string }
> = {
  1: {
    label: "Bronze",
    chip: "border-orange-500/40 bg-orange-500/10 text-orange-500",
    ring: "border-orange-500/45 bg-orange-500/10 text-orange-500",
    text: "text-orange-500",
  },
  2: {
    label: "Silver",
    chip: "border-sky-400/40 bg-sky-400/10 text-sky-400",
    ring: "border-sky-400/45 bg-sky-400/10 text-sky-400",
    text: "text-sky-400",
  },
  3: {
    label: "Gold",
    chip: "border-amber-500/40 bg-amber-500/10 text-amber-500",
    ring: "border-amber-500/45 bg-amber-500/10 text-amber-500",
    text: "text-amber-500",
  },
};

export const TIER_FALLBACK = TIER_STYLE[1];

/** "Reach 100 WPM" / "Finish 10 runs" — the goal behind a badge. */
export function goalText(meta: CategoryMeta, threshold: number): string {
  switch (meta.id) {
    case "speed":
      return `Reach ${threshold} WPM`;
    case "accuracy":
      return `Reach ${threshold}% accuracy`;
    case "volume":
      return `Finish ${threshold} runs`;
    case "streak":
      return `Type ${threshold} days in a row`;
    case "contest":
      return `Join ${threshold} contests`;
    case "social":
      return `Finish ${threshold} battles`;
    default:
      return `${threshold} ${meta.unit}`;
  }
}

/** "58 / 100 WPM" — the user's own number next to the goal. */
export function valueText(
  meta: CategoryMeta,
  value: number,
  threshold: number
): string {
  switch (meta.id) {
    case "speed":
      return `${value} / ${threshold} WPM`;
    case "accuracy":
      return `${value}% / ${threshold}%`;
    case "volume":
      return `${value} / ${threshold} runs`;
    case "streak":
      return `${value} / ${threshold} days`;
    case "contest":
      return `${value} / ${threshold} contests`;
    case "social":
      return `${value} / ${threshold} battles`;
    default:
      return `${value} / ${threshold}`;
  }
}
