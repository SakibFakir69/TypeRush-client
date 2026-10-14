import type { Metadata } from "next";
import Link from "next/link";
import {
  Cake,
  CalendarDays,
  Globe,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { ProfileEditor } from "@/components/app/ProfileEditor";
import { countryCodeFor } from "@/lib/countries";
import { getSessionUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Profile — TypeRush",
  description: "Your TypeRush member profile.",
  
};

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
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
  const bio = str(user?.bio);
  const avatarUrl = str(user?.avatarUrl);
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
        {/* Cover: deep gradient, twin glows, faint key grid */}
        <div
          aria-hidden
          className="relative h-32 overflow-hidden bg-gradient-to-r from-accent/25 via-accent/10 to-violet-500/25"
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.09) 0 1px, transparent 1px 34px), repeating-linear-gradient(0deg, rgba(255,255,255,0.09) 0 1px, transparent 1px 34px)",
              maskImage:
                "radial-gradient(80% 120% at 50% 0%, black 30%, transparent 75%)",
            }}
          />
          <div
            aria-hidden
            className="absolute -left-10 -top-16 h-48 w-48 rounded-full blur-3xl"
            style={{ background: "rgba(46, 242, 200, 0.22)" }}
          />
          <div
            aria-hidden
            className="absolute -right-10 -top-16 h-48 w-48 rounded-full blur-3xl"
            style={{ background: "rgba(168, 85, 247, 0.25)" }}
          />
        </div>
        <div className="px-5 pb-5 sm:px-7">
          <ProfileEditor
            initial={{
              name,
              fullName,
              bio,
              country,
              age: typeof user?.age === "number" ? String(user.age) : "",
              avatarUrl,
            }}
          />

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {details.map(({ Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl border border-line bg-inset px-3 py-2.5"
              >
                {label === "Country" && countryCodeFor(country) ? (
                  // eslint-disable-next-line @next/next/no-img-element -- tiny CDN flag; next/image offers nothing here
                  <img
                    src={`https://flagcdn.com/w80/${countryCodeFor(country)}.png`}
                    alt=""
                    aria-hidden
                    width={32}
                    height={22}
                    loading="lazy"
                    className="h-[22px] w-8 shrink-0 rounded-md border border-line object-cover"
                  />
                ) : (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                    <Icon size={15} aria-hidden />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider text-faint">
                    {label}
                  </span>
                  <span className="block truncate text-[13px] font-bold">{value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

        <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href="/practice"
            className="inline-block rounded-lg bg-mint px-5 py-2.5 text-center text-sm font-bold text-black transition hover:brightness-110"
          >
            Start Practice →
          </Link>
        </div>
    </div>
  );
}
