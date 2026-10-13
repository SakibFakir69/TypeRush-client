import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Cake,
  CalendarDays,
  Globe,
  Hash,
  Mail,
  Pencil,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/primitives";
import { ProfileStats } from "@/components/app/ProfileStats";
import { getSessionUser } from "@/lib/server/session";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Profile — TypeRush",
  description: "Your TypeRush member profile.",
};

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Member profile — every visible field of the User model. */
export default async function ProfilePage() {
  const user = await getSessionUser();
  const name = str(user?.name) || str(user?.fullName) || "typist";
  const fullName = str(user?.fullName);
  const email = str(user?.email);
  const country = str(user?.country);
  const age = typeof user?.age === "number" ? String(user.age) : "";
  const provider = str(user?.authProvider) || "local";
  const verified = user?.emailVerified === true;
  const bio = str(user?.bio);
  const avatarUrl = str(user?.avatarUrl);
  const shortId = str(user?.id).slice(0, 8);
  const since = (() => {
    const raw = str(user?.createdAt);
    if (!raw) return "";
    const d = new Date(raw);
    return Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleDateString(undefined, { year: "numeric", month: "long" });
  })();

  const details = [
    { Icon: Mail, label: "Email", value: email || "—" },
    { Icon: UserIcon, label: "Username", value: str(user?.name) || "—" },
    { Icon: Cake, label: "Age", value: age || "—" },
    { Icon: Globe, label: "Country", value: country || "—" },
    {
      Icon: ShieldCheck,
      label: "Sign-in method",
      value: provider === "google" ? "Google" : "Email",
    },
    { Icon: CalendarDays, label: "Member since", value: since || "—" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card className="overflow-hidden p-0">
        {/* Cover */}
        <div
          aria-hidden
          className="h-28 bg-gradient-to-r from-accent/25 via-accent/10 to-violet-500/20"
        />
        <div className="px-5 pb-5 sm:px-7">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
            {avatarUrl ? (
              <Avatar
                src={avatarUrl}
                alt={name}
                width={80}
                height={80}
                className="h-20 w-20 rounded-2xl border-4 border-card object-cover"
              />
            ) : (
              <span
                role="img"
                aria-label={name}
                className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-4 border-card bg-gradient-to-br from-teal-600 to-emerald-800 text-2xl font-black text-white"
              >
                {initials(name)}
              </span>
            )}
            <div className="min-w-0 flex-1 sm:pb-1">
              <p className="flex flex-wrap items-center gap-2 text-xl font-black tracking-tight">
                <span className="truncate">{name}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                    verified
                      ? "bg-accent/10 text-accent"
                      : "bg-amber-500/10 text-amber-500"
                  )}
                >
                  <BadgeCheck size={12} aria-hidden />
                  {verified ? "Verified" : "Unverified"}
                </span>
              </p>
              {fullName && fullName !== name && (
                <p className="truncate text-sm text-muted">{fullName}</p>
              )}
              {shortId && (
                <p className="mt-0.5 font-mono text-[11px] tabular-nums text-faint">
                  id_{shortId}
                </p>
              )}
            </div>
            <Link
              href="/settings"
              className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-line px-4 py-2 text-sm font-bold transition hover:bg-chip sm:self-auto"
            >
              <Pencil size={14} aria-hidden /> Edit
            </Link>
          </div>

          <p className="mt-3 text-sm leading-6 text-muted">
            {bio || "No bio yet — tell the world who is behind the keyboard."}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {details.map(({ Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl border border-line bg-inset px-3 py-2.5"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                  <Icon size={15} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider text-faint">
                    {label}
                  </span>
                  <span className="block truncate text-[13px] font-bold">{value}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-inset px-3 py-2.5 text-[13px]">
            <Hash size={14} aria-hidden className="shrink-0 text-faint" />
            <span className="text-muted">Full account id</span>
            <span className="ml-auto truncate font-mono text-[11px] tabular-nums text-faint">
              {str(user?.id) || "—"}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <p className="text-sm font-extrabold">Your stats</p>
        <p className="mt-0.5 text-xs text-muted">
          Computed live from your submitted tests.
        </p>
        <div className="mt-3">
          <ProfileStats email={email} />
        </div>
      </Card>
    </div>
  );
}
