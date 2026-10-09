"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { playDemoError, playDemoTick } from "@/lib/keySound";
import { cn } from "@/lib/cn";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  // Mechanical feedback for every auth input: tick per key, thud on backspace.
  const handleKeys = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (!t || (t.tagName !== "INPUT" && t.tagName !== "TEXTAREA")) return;
    if (e.key === "Backspace") playDemoError();
    else if (e.key.length === 1) playDemoTick(e.key.charCodeAt(0));
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div
        onKeyDownCapture={handleKeys}
        className="relative overflow-hidden rounded-2xl border border-line/70 bg-card/60 p-6 shadow-[var(--card-shadow)] backdrop-blur-2xl sm:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 60% at 50% 0%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 70%)",
          }}
        />
        <div className="relative">
        <h1 className="text-2xl font-black tracking-tight">{title}</h1>
        <p className="mt-1.5 text-sm leading-6 text-muted">{subtitle}</p>
        <div className="mt-5">{children}</div>
        {footer && (
          <p className="mt-5 border-t border-line pt-4 text-center text-[13px] text-muted">
            {footer}
          </p>
        )}
        </div>
      </div>
    </div>
  );
}

export function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-bold text-accent hover:underline">
      {children}
    </Link>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-500">{error}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-line bg-inset px-3.5 py-2.5 text-sm text-ink shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)] placeholder:text-faint transition focus:border-accent/60 focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_18%,transparent)]";

export function PasswordField({
  field,
  error,
  label = "Password",
  placeholder = "••••••••",
  autoComplete,
}: {
  field: UseFormRegisterReturn;
  error?: string;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} error={error}>
      <span className="relative block">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...field}
          className={cn(inputCls, "pr-11")}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted transition hover:text-ink"
        >
          {show ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
        </button>
      </span>
    </Field>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[13px] leading-5 text-rose-500">
      {message}
    </p>
  );
}

export function FormOK({ message }: { message: string }) {
  return (
    <p role="status" className="rounded-lg border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-[13px] leading-5 text-accent">
      {message}
    </p>
  );
}

export function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-mint px-4 py-2.5 text-sm font-bold text-black shadow-[0_6px_24px_rgba(46,242,200,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
    >
      {loading && <Loader2 size={16} aria-hidden className="animate-spin" />}
      {children}
    </button>
  );
}

export function GoogleButton() {
  return (
    <a
      href="/backend/api/v1/auth/google"
      className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-line px-4 py-2.5 text-sm font-bold transition hover:bg-chip"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.1.1c2.1-2 3.9-4.9 3.9-8.7z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.1.1-3.7 2.9v.1C3.4 21.5 7.4 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.6-2.8-.1.1C.5 8.7 0 10.2 0 12s.5 3.3 1.4 4.7l3.8-2.3z"
        />
        <path
          fill="#EA4335"
          d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.4 0 3.4 2.5 1.5 6.9l3.7 2.8c1-2.9 3.7-5 6.8-5z"
        />
      </svg>
      Continue with Google
    </a>
  );
}

export function OrDivider() {
  return (
    <div className="my-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-faint" aria-hidden>
      <span className="h-px flex-1 bg-line" />
      or
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function isEmail(v: string) {
  return /^\S+@\S+\.\S+$/.test(v.trim());
}
