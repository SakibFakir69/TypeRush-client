"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Pencil, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { CountryPicker } from "@/components/auth/CountryPicker";
import { inputCls } from "@/components/auth/ui";
import { getApiError } from "@/helper/error-helper";
import { resolveCountry } from "@/lib/countries";
import { useAppDispatch } from "@/lib/hooks";
import { authApi } from "@/lib/features/auth/features.auth";
import { useUpdateUserMutation } from "@/lib/features/user/features.user";
import { useUploadAvatarMutation } from "@/lib/features/upload/features.upload";
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

const AVATAR_MAX_SIDE = 512;

/**
 * Avatars never need to be bigger than a few hundred pixels, and a 10 MB photo
 * would also hit the proxy body limit. Downscale in the browser and send WebP;
 * fall back to the untouched file when the canvas cannot decode the image.
 */
async function shrinkAvatar(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      AVATAR_MAX_SIDE / Math.max(bitmap.width, bitmap.height)
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.9)
    );
    if (!blob) return file;

    const name = file.name.replace(/\.[^.]+$/, "") || "avatar";
    return new File([blob], `${name}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
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
  // Profiles created before the picker existed may hold an ISO code
  // ("sa"), so normalise once — saving then stores the readable name.
  const [form, setForm] = useState<ProfileInitial>(() => ({
    ...initial,
    country: resolveCountry(initial.country)?.name ?? initial.country,
  }));
  const [error, setError] = useState("");
  const [updateProfile, { isLoading }] = useUpdateUserMutation();

  // Avatar upload: one request stores the image and the new avatarUrl.
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof ProfileInitial) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const cancel = () => {
    setForm({
      ...initial,
      country: resolveCountry(initial.country)?.name ?? initial.country,
    });
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

  // ADDED: avatar upload handlers
  const handleAvatarClick = () => {
    if (!isUploadingAvatar) fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB.");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("image", await shrinkAvatar(file));

    try {
      const { url, user } = await uploadAvatar(formData).unwrap();
      if (!url) throw new Error("Upload returned no image URL.");
      setAvatarUrl(url);
      // The endpoint already saved avatarUrl; keep the cached session in sync
      // so the navbar, rail ProfileCard and comments all switch immediately.
      dispatch(
        authApi.util.updateQueryData("getSession", undefined, (draft) => {
          if (!draft) return draft;
          draft.avatarUrl = url;
          if (user?.xp !== undefined) draft.xp = user.xp;
        })
      );
      toast.success("Avatar updated.");
      router.refresh();
    } catch (err) {
      toast.error(getApiError(err));
    }
    e.target.value = "";
  };

  return (
    <>
      <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
        {/* CHANGED: avatarUrl state used instead of initial.avatarUrl, wrapped for click-to-upload */}
        <div className="relative h-20 w-20 shrink-0">
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={isUploadingAvatar}
            className="group relative block h-20 w-20 overflow-hidden rounded-2xl border-4 border-card shadow-lg disabled:opacity-60"
          >
            {avatarUrl ? (
              <Avatar
                src={avatarUrl}
                alt={form.name || "Member"}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                role="img"
                aria-label={form.name || "Member"}
                className="grid h-full w-full place-items-center bg-gradient-to-br from-teal-600 to-emerald-800 text-2xl font-black text-white"
              >
                {initials(form.name || "Member")}
              </span>
            )}
            <span className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
              <Pencil size={18} aria-hidden />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
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
            <CountryPicker
              value={form.country}
              onChange={(name) => setForm((f) => ({ ...f, country: name }))}
              className="py-2 text-sm"
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