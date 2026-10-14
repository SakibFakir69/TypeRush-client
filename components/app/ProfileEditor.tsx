"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Pencil, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { inputCls } from "@/components/auth/ui";
import { getApiError } from "@/helper/error-helper";
import { useAppDispatch } from "@/lib/hooks";
import { authApi } from "@/lib/features/auth/features.auth";
import { useUpdateUserMutation } from "@/lib/features/user/features.user";
import { cn } from "@/lib/cn";

export type ProfileInitial = {
  name: string;
  fullName: string;
  bio: string;
  country: string;
  age: string;
  avatarUrl: string;
};

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Profile header with inline editing: Edit toggles inputs for name,
 * full name, country and bio; Save persists via the profile endpoint
 * and refreshes the server-rendered details below.
 */
export function ProfileEditor({ initial }: { initial: ProfileInitial }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [updateProfile, { isLoading }] = useUpdateUserMutation();

  const set = (k: keyof ProfileInitial) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const cancel = () => {
    setForm(initial);
    setError("");
    setEditing(false);
  };

  const save = async () => {
    setError("");
    const ageTrimmed = form.age.trim();
    const ageNum = ageTrimmed === "" ? undefined : Number(ageTrimmed);
    if (ageNum !== undefined && (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120)) {
      setError("Age must be a whole number between 1 and 120.");
      return;
    }
    const fields = {
      name: form.name.trim(),
      fullName: form.fullName.trim(),
      country: form.country.trim(),
      bio: form.bio.trim(),
      ...(ageNum !== undefined ? { age: ageNum } : {}),
    };
    try {
      await updateProfile(fields).unwrap();
      // Reflect instantly everywhere (navbar chip included), then
      // revalidate the server-rendered tiles below.
      dispatch(
        authApi.util.updateQueryData("getSession", undefined, (draft) => {
          if (!draft) return draft;
          Object.assign(draft, fields);
        })
      );
      toast.success("Profile updated.");
      setEditing(false);
      router.refresh();
    } catch (e) {
      const status =
        e && typeof e === "object" && "status" in e
          ? (e as { status?: unknown }).status
          : undefined;
      if (status === 401) {
        // Token expired or session gone: the only fix is logging in again.
        setError("Session expired — taking you to log in…");
        setTimeout(() => router.push("/login"), 1500);
        return;
      }
      setError(getApiError(e));
    }
  };

  return (
    <>
      <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
        {initial.avatarUrl ? (
          <Avatar
            src={initial.avatarUrl}
            alt={form.name || "Member"}
            width={80}
            height={80}
            className="h-20 w-20 rounded-2xl border-4 border-card object-cover shadow-lg"
          />
        ) : (
          <span
            role="img"
            aria-label={form.name || "Member"}
            className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-4 border-card bg-gradient-to-br from-teal-600 to-emerald-800 text-2xl font-black text-white shadow-lg"
          >
            {initials(form.name || "Member")}
          </span>
        )}
        <div className="min-w-0 flex-1 sm:pb-1">
          {editing ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={form.name}
                onChange={set("name")}
                aria-label="Display name"
                placeholder="Display name"
                className={cn(inputCls, "py-2 text-sm font-bold")}
              />
              <input
                value={form.fullName}
                onChange={set("fullName")}
                aria-label="Full name"
                placeholder="Full name"
                className={cn(inputCls, "py-2 text-sm")}
              />
            </div>
          ) : (
            <>
              <h1 className="truncate text-2xl font-black tracking-tight">
                {form.name || "typist"}
              </h1>
              <p className="mt-0.5 truncate text-sm font-medium text-accent">
                @{form.name || "typist"}
                {form.fullName && form.fullName !== form.name && (
                  <span className="font-normal text-muted"> · {form.fullName}</span>
                )}
              </p>
            </>
          )}
        </div>
        {editing ? (
          <div className="flex shrink-0 gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={cancel}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-bold text-muted transition hover:bg-chip hover:text-ink disabled:opacity-60"
            >
              <X size={14} aria-hidden /> Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-60"
            >
              <Check size={14} strokeWidth={3} aria-hidden />
              {isLoading ? "Saving…" : "Save"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-mint px-4 py-2 text-sm font-bold text-black transition hover:brightness-110 sm:self-auto"
          >
            <Pencil size={14} aria-hidden /> Edit profile
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <div className="grid gap-2 sm:grid-cols-[1fr_110px]">
            <input
              value={form.country}
              onChange={set("country")}
              aria-label="Country"
              placeholder="Country"
              className={cn(inputCls, "py-2 text-sm")}
            />
            <input
              value={form.age}
              onChange={set("age")}
              aria-label="Age"
              placeholder="Age"
              type="number"
              min={1}
              max={120}
              className={cn(inputCls, "py-2 text-sm tabular-nums")}
            />
          </div>
          <textarea
            value={form.bio}
            onChange={set("bio")}
            aria-label="Bio"
            placeholder="Tell the world who is behind the keyboard…"
            rows={2}
            maxLength={500}
            className={cn(inputCls, "resize-y py-2 text-sm leading-6")}
          />
          {error && <p role="alert" className="text-xs text-rose-500">{error}</p>}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted">
          {form.bio || "No bio yet — tell the world who is behind the keyboard."}
        </p>
      )}
    </>
  );
}
