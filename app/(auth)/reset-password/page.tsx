"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { getApiError } from "@/helper/error-helper";
import { useResetPasswordMutation } from "@/lib/features/auth/features.auth";
import { toast } from "sonner";
import { resetSchema, type ResetInput } from "@/components/auth/schemas";
import {
  AuthShell,
  FormError,
  FormOK,
  InlineLink,
  PasswordField,
  SubmitButton,
} from "@/components/auth/ui";

function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [reset, { isLoading }] = useResetPasswordMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
    mode: "onTouched",
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = async (values: ResetInput) => {
    try {
      await reset({ resetToken: token, password: values.password }).unwrap();
      try {
        window.sessionStorage.removeItem("typerush-reset-token");
      } catch {
        // ignore
      }
      toast.success("Password updated — log in with the new one.");
      setDone(true);
    } catch (e) {
      setError("root", { message: getApiError(e) });
    }
  };

  // Success auto-continues to login; the button below is the manual path.
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => router.push("/login"), 3000);
    return () => clearTimeout(t);
  }, [done, router]);

  if (done) {
    return (
      <div className="space-y-4">
        <FormOK message="Password reset successful — log in with your new password." />
        <p className="text-center text-xs text-faint">
          Taking you to log in in 3 seconds…
        </p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="inline-flex w-full items-center justify-center rounded-lg bg-mint px-4 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
        >
          Log in →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {errors.root?.message && <FormError message={errors.root.message} />}
      <PasswordField
        field={register("password")}
        error={errors.password?.message}
        autoComplete="new-password"
      />
      <PasswordField
        field={register("confirm")}
        error={errors.confirm?.message}
        label="Confirm new password"
        autoComplete="new-password"
      />
      <SubmitButton loading={isLoading} kbd="⏎">Set new password →</SubmitButton>
    </form>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let t: string | null = null;
      try {
        t = window.sessionStorage.getItem("typerush-reset-token");
      } catch {
        t = null;
      }
      setToken(t);
      setChecked(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Pick something strong — 8 characters minimum."
      footer={<>Changed your mind? <InlineLink href="/login">Back to log in</InlineLink></>}
    >
      {!checked ? null : !token ? (
        <div className="space-y-4">
          <FormError message="This page needs a verified code first — codes are single-use and expire in minutes." />
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="inline-flex w-full items-center justify-center rounded-lg bg-mint px-4 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
          >
            Restart recovery →
          </button>
        </div>
      ) : (
        <ResetForm token={token} />
      )}
    </AuthShell>
  );
}
