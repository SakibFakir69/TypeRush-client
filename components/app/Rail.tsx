import Link from "next/link";
import {
  Award,
  BarChart3,
  Crosshair,
  Flame,
  Star,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/primitives";
import { DASH } from "@/lib/dashboard";
import { cn } from "@/lib/cn";

function PanelHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-sm font-extrabold">{title}</p>
      <Link href={href} className="ml-auto text-xs font-semibold text-accent hover:underline">
        View all →
      </Link>
    </div>
  );
}

export function ProfileCard({ name }: { name: string }) {
  const s = DASH.stats;
  return (
    <Card className="p-5 text-center">
      <Avatar
        src="https://i.pravatar.cc/128?img=11"
        alt={name}
        width={64}
        height={64}
        className="mx-auto h-16 w-16 rounded-full border-2 border-accent/40 object-cover"
      />
      <p className="mt-2 text-lg font-black">{name}</p>
      <p className="text-xs text-muted">Level {DASH.level}</p>
      <div aria-hidden className="mt-2 h-1.5 overflow-hidden rounded-full bg-chip">
        <div className="h-full w-[82%] rounded-full bg-accent" />
      </div>
      <p className="mt-1 text-[11px] tabular-nums text-muted">
        {DASH.xp.toLocaleString()} / {DASH.xpMax.toLocaleString()} XP
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          [String(s.races), "Total Races"],
          [String(s.contests), "Contests"],
          [String(s.badges), "Badges"],
        ].map(([v, k]) => (
          <div key={k} className="rounded-lg bg-inset p-2">
            <p className="text-base font-black tabular-nums">{v}</p>
            <p className="text-[10px] text-muted">{k}</p>
          </div>
        ))}
      </div>
      <Link
        href="/settings"
        className="mt-3 block rounded-lg border border-line px-4 py-2 text-[13px] font-bold transition hover:bg-chip"
      >
        View Profile →
      </Link>
    </Card>
  );
}

const TABS = ["Global", "Weekly", "Friends"];

export function MiniLeaderboard() {
  return (
    <Card className="p-5">
      <PanelHead title="Leaderboard" href="/leaderboard" />
      <div className="mt-2.5 flex gap-1 rounded-lg bg-inset p-1 text-[11px] font-bold">
        {TABS.map((t, i) => (
          <span
            key={t}
            className={cn(
              "flex-1 rounded-md px-2 py-1 text-center",
              i === 0 ? "bg-mint text-black" : "text-muted"
            )}
          >
            {t}
          </span>
        ))}
      </div>
      <ul className="mt-2 space-y-1">
        {DASH.board.map((r) => (
          <li
            key={r.rank}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px]",
              r.you && "border border-accent/30 bg-accent/[0.07]"
            )}
          >
            <span className="w-7 shrink-0 font-mono text-[11px] font-bold tabular-nums text-muted">
              #{r.rank}
            </span>
            <Avatar
              src={`https://i.pravatar.cc/48?img=${r.img}`}
              alt={r.name}
              width={24}
              height={24}
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className={cn("truncate font-medium", r.you && "font-bold text-accent")}>
              {r.name}
            </span>
            <span className="ml-auto shrink-0 font-mono text-[11px] font-bold tabular-nums text-accent">
              {r.wpm} WPM
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

const FEED_ICONS: Record<string, typeof Zap> = {
  zap: Zap,
  chart: BarChart3,
  swords: Swords,
  trophy: Trophy,
  xp: Star,
};

export function ActivityFeed() {
  return (
    <Card className="p-5">
      <PanelHead title="Recent Activity" href="/progress" />
      <ul className="mt-2.5 space-y-2.5">
        {DASH.activity.map((a) => {
          const Icon = FEED_ICONS[a.icon] ?? Zap;
          return (
            <li key={a.text} className="flex items-start gap-2.5 text-[13px]">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                <Icon size={13} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block leading-5">{a.text}</span>
                <span className="block text-[11px] text-faint">{a.when}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

const BADGE_ICONS: Record<string, typeof Zap> = {
  zap: Zap,
  target: Crosshair,
  flame: Flame,
  swords: Swords,
};

export function AchievementsRow() {
  return (
    <Card className="p-5">
      <PanelHead title="Recent Achievements" href="/achievements" />
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        {DASH.achievements.map((a) => {
          const Icon = BADGE_ICONS[a.icon] ?? Award;
          return (
            <div key={a.name}>
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-400">
                <Icon size={18} aria-hidden />
              </span>
              <p className="mt-1.5 text-[10px] font-bold leading-tight">{a.name}</p>
              <p className="text-[10px] tabular-nums text-accent">{a.xp}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function FriendsCard() {
  return (
    <Card className="p-5">
      <PanelHead title="Friends" href="/friends" />
      <div className="mt-3 flex items-center">
        <div className="flex -space-x-2">
          {DASH.friends.map((img) => (
            <Avatar
              key={img}
              src={`https://i.pravatar.cc/48?img=${img}`}
              alt="Friend"
              width={28}
              height={28}
              className="h-7 w-7 rounded-full border-2 border-card object-cover"
            />
          ))}
          <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-card bg-chip text-[10px] font-extrabold">
            +8
          </span>
        </div>
        <p className="ml-2 text-[11px] text-muted">You have 12 friends</p>
      </div>
      <Link
        href="/friends"
        className="mt-2 block rounded-lg border border-line px-4 py-2 text-center text-[13px] font-bold transition hover:bg-chip"
      >
        Find Friends →
      </Link>
    </Card>
  );
}
