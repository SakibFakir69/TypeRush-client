"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Home,
  Keyboard,
  Settings,
  Star,
  Swords,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

export type NavItem = { href: string; label: string; Icon: typeof Home; badge?: string };

export const APP_NAV: NavItem[] = [
  { href: "/home", label: "Home", Icon: Home },
  { href: "/test", label: "Practice", Icon: Keyboard },
  { href: "/battles", label: "1v1 Battles", Icon: Swords, badge: "2" },
  { href: "/contests", label: "Contests", Icon: Trophy },
  { href: "/leaderboard", label: "Leaderboard", Icon: BarChart3 },
  { href: "/progress", label: "Progress", Icon: TrendingUp },
  { href: "/achievements", label: "Achievements", Icon: Star },
  { href: "/friends", label: "Friends", Icon: Users },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export function Sidebar({
  userName,
  filter,
}: {
  userName: string;
  filter: string;
}) {
  const pathname = usePathname();
  const q = filter.trim().toLowerCase();
  const items = APP_NAV.filter((n) => n.label.toLowerCase().includes(q));

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-card/60 px-3 py-4 backdrop-blur-xl lg:flex">
      <Link href="/home" className="flex items-center gap-1.5 px-2 text-lg font-extrabold tracking-tight">
        <span className="text-accent">⚡</span>
        <span>
          Type<span className="text-accent">Rush</span>
        </span>
      </Link>

      <nav className="mt-5 flex-1 space-y-1 overflow-y-auto" aria-label="App">
        {items.map(({ href, label, Icon, badge }) => {
          const active = pathname === href || (href !== "/home" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition",
                active
                  ? "bg-accent/15 font-bold text-accent"
                  : "text-muted hover:bg-chip hover:text-ink"
              )}
            >
              <Icon size={16} aria-hidden />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="grid h-5 min-w-5 place-items-center rounded-md bg-violet-500 px-1 text-[10px] font-extrabold text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
        {items.length === 0 && (
          <p className="px-3 py-2 text-xs text-faint">No matches for “{filter}”.</p>
        )}
      </nav>

      <div className="relative mt-3 overflow-hidden rounded-xl border border-accent/20 bg-gradient-to-b from-accent/10 to-transparent p-4">
        <Zap size={18} aria-hidden className="text-accent" />
        <p className="mt-2 text-sm font-extrabold leading-snug">
          Small steps
          <br />
          type big dreams.
        </p>
        <p className="mt-1 text-[11px] leading-4 text-muted">
          Keep practicing, keep growing!
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-line bg-inset p-3">
        <Avatar
          src="https://i.pravatar.cc/64?img=11"
          alt={userName}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full border border-line object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold">{userName}</p>
          <p className="text-[11px] text-faint">Level 12</p>
          <div aria-hidden className="mt-1 h-1 overflow-hidden rounded-full bg-chip">
            <div className="h-full w-[82%] rounded-full bg-accent" />
          </div>
        </div>
      </div>
    </aside>
  );
}
