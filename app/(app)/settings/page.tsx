"use client";

import { useState } from "react";
import { LogOut, Moon, Sun, MonitorSmartphone } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/primitives";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  const name =
    (typeof user?.name === "string" && user.name) ||
    (typeof user?.fullName === "string" && user.fullName) ||
    "typist";
  const email = typeof user?.email === "string" ? user.email : "—";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted">Profile, appearance, and session.</p>
      </div>

      <Card className="flex items-center gap-3 p-5">
        <Avatar
          src="https://i.pravatar.cc/96?img=11"
          alt={name}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full border border-line object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold">{name}</p>
          <p className="truncate text-xs text-muted">{email}</p>
        </div>
        <span className="ml-auto rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-bold text-accent">
          Level 12
        </span>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-extrabold">Appearance</p>
        <p className="mt-0.5 text-xs text-muted">Pick how TypeRush looks on this device.</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(
            [
              { id: "light", label: "Light", Icon: Sun },
              { id: "dark", label: "Dark", Icon: Moon },
              { id: "system", label: "System", Icon: MonitorSmartphone },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTheme(id)}
              aria-pressed={theme === id}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-[13px] font-bold transition",
                theme === id
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-line text-muted hover:text-ink"
              )}
            >
              <Icon size={15} aria-hidden /> {label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-extrabold">Session</p>
        <p className="mt-0.5 text-xs text-muted">Sign out everywhere on this device.</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            logout().finally(() => setBusy(false));
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 px-4 py-2 text-sm font-bold text-rose-500 transition hover:bg-rose-500/10 disabled:opacity-60"
        >
          <LogOut size={15} aria-hidden /> {busy ? "Logging out…" : "Log out"}
        </button>
      </Card>
    </div>
  );
}
