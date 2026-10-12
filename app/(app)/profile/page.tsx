import type { Metadata } from "next";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { getSessionUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Profile — TypeRush",
  description: "Your TypeRush member profile.",
};

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Member profile, read from the live session. */
export default async function ProfilePage() {
  const user = await getSessionUser();
  const name =
    (typeof user?.name === "string" && user.name) ||
    (typeof user?.fullName === "string" && user.fullName) ||
    "typist";
  const email = typeof user?.email === "string" ? user.email : "—";
  const country = typeof user?.country === "string" ? user.country : "—";
  const created = typeof user?.createdAt === "string" ? user.createdAt : null;
  const since = (() => {
    if (!created) return "—";
    const d = new Date(created);
    return Number.isNaN(d.getTime())
      ? "—"
      : d.toLocaleDateString(undefined, { year: "numeric", month: "long" });
  })();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-muted">Your member details, live from your account.</p>
      </div>
      <Card className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
        <span
          role="img"
          aria-label={name}
          className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-2 border-accent/40 bg-gradient-to-br from-teal-600 to-emerald-800 text-2xl font-black text-white"
        >
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-black">{name}</p>
          <p className="truncate text-sm text-muted">{email}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 text-[11px] sm:justify-start">
            <span className="rounded-full bg-chip px-2.5 py-1 font-bold text-muted">
              {country}
            </span>
            <span className="rounded-full bg-chip px-2.5 py-1 font-bold text-muted">
              Member since {since}
            </span>
          </div>
        </div>
        <Link
          href="/settings"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-bold transition hover:bg-chip"
        >
          <Pencil size={14} aria-hidden /> Edit
        </Link>
      </Card>
    </div>
  );
}
