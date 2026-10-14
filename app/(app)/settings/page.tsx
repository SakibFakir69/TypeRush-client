"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bell,
  LogOut,
  Mail,
  MonitorSmartphone,
  Moon,
  Sun,
  Trash2,
  Volume2,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { isSoundEnabled, setSoundEnabled } from "@/lib/keySound";
import { getApiError } from "@/helper/error-helper";
import { useDeleteUserMutation } from "@/lib/features/user/features.user";
import { Card } from "@/components/ui/primitives";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import Link from "next/link";

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-accent" : "border border-line bg-chip"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
          checked ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}

/** Device-only boolean pref (honest: never leaves this browser). */
function useLocalPref(key: string, initial: boolean) {
  const [val, setVal] = useState(initial);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const v = window.localStorage.getItem(key);
        if (v !== null) setVal(v === "1");
      } catch {
        // ignore
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [key]);
  const set = (v: boolean) => {
    setVal(v);
    try {
      window.localStorage.setItem(key, v ? "1" : "0");
    } catch {
      // ignore
    }
  };
  return [val, set] as const;
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm font-extrabold">{title}</p>
      <p className="mt-0.5 text-xs text-muted">{desc}</p>
      <div className="mt-3">{children}</div>
    </Card>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [sound, setSound] = useState(true);
  const [contestAlerts, setContestAlerts] = useLocalPref("typerush-pref-contests", true);
  const [weeklyRecap, setWeeklyRecap] = useLocalPref("typerush-pref-recap", false);
  const [arming, setArming] = useState(false);
  const [ack, setAck] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteAccount, { isLoading: deleting }] = useDeleteUserMutation();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setSound(isSoundEnabled()));
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggleSound = (v: boolean) => {
    setSound(v);
    setSoundEnabled(v);
  };

  const name =
    (typeof user?.name === "string" && user.name) ||
    (typeof user?.fullName === "string" && user.fullName) ||
    "typist";
  const email = typeof user?.email === "string" ? user.email : "—";

  const confirmDelete = async () => {
    setDeleteError("");
    try {
      await deleteAccount().unwrap();
    } catch (e) {
      setDeleteError(getApiError(e));
      return;
    }
    await logout();
    toast.success("Account permanently deleted.");
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Profile, appearance, notifications, and session.
        </p>
      </div>

      <Card className="flex items-center gap-3 p-5">
        <Avatar
          src="https://i.pravatar.cc/96?img=11"
          alt={name}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full border border-line object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-extrabold">{name}</p>
          <p className="truncate text-xs text-muted">{email}</p>
        </div>
        <Link
          href="/profile"
          className="shrink-0 rounded-lg border border-line px-4 py-2 text-sm font-bold transition hover:bg-chip"
        >
          View profile
        </Link>
      </Card>

      <Section title="Appearance" desc="Pick how TypeRush looks on this device.">
        <div className="grid grid-cols-3 gap-2">
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
      </Section>

      <Section
        title="Sound & notifications"
        desc="Notification toggles live on this device only."
      >
        <ul className="space-y-1">
          <li className="flex items-center gap-3 rounded-lg px-1 py-2">
            <Volume2 size={16} aria-hidden className="shrink-0 text-accent" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold">Keyboard sounds</span>
              <span className="block text-[11px] text-muted">
                Typing ticks and shortcut blips
              </span>
            </span>
            <Switch checked={sound} onChange={toggleSound} label="Keyboard sounds" />
          </li>
          <li className="flex items-center gap-3 rounded-lg px-1 py-2">
            <Bell size={16} aria-hidden className="shrink-0 text-accent" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold">Contest alerts</span>
              <span className="block text-[11px] text-muted">
                Reminders before weekly cups
              </span>
            </span>
            <Switch checked={contestAlerts} onChange={setContestAlerts} label="Contest alerts" />
          </li>
          <li className="flex items-center gap-3 rounded-lg px-1 py-2">
            <Mail size={16} aria-hidden className="shrink-0 text-accent" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold">Weekly recap email</span>
              <span className="block text-[11px] text-muted">
                Your stats, every Monday
              </span>
            </span>
            <Switch checked={weeklyRecap} onChange={setWeeklyRecap} label="Weekly recap email" />
          </li>
        </ul>
      </Section>

      <Section title="Session" desc="Sign out on this device.">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            logout().finally(() => setBusy(false));
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-bold text-muted transition hover:bg-chip hover:text-ink disabled:opacity-60"
        >
          <LogOut size={15} aria-hidden /> {busy ? "Logging out…" : "Log out"}
        </button>
      </Section>

      <Card className="border-rose-500/30 p-5">
        <p className="text-sm font-extrabold text-rose-500">Danger zone</p>
        {!arming ? (
          <>
            <p className="mt-0.5 text-xs text-muted">
              Deleting is permanent and cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => {
                setArming(true);
                setAck(false);
                setDeleteError("");
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 px-4 py-2 text-sm font-bold text-rose-500 transition hover:bg-rose-500/10"
            >
              <Trash2 size={15} aria-hidden /> Delete account
            </button>
          </>
        ) : (
          <>
            <p className="mt-0.5 text-xs leading-5 text-muted">
              This permanently deletes your account, results, and history.
              Deleted accounts can never log in again. Type nothing — just
              confirm you understand.
            </p>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-rose-500"
              />
              <span>
                I understand my account, results, and history will be
                permanently deleted.
              </span>
            </label>
            {deleteError && (
              <p role="alert" className="mt-2 text-xs text-rose-500">
                {deleteError}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={!ack || deleting}
                onClick={confirmDelete}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={15} aria-hidden />
                {deleting ? "Deleting…" : "Yes, delete everything"}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setArming(false);
                  setAck(false);
                  setDeleteError("");
                }}
                className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-muted transition hover:bg-chip hover:text-ink disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
