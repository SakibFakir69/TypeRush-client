"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getApiError,
  useVerifyOtpMutation,
} from "@/lib/features/api/base-api";
import { otpSchema, type OtpInput } from "@/components/auth/schemas";
import {
  AuthShell,
  Field,
  FormError,
  InlineLink,
  SubmitButton,
  inputCls,
} from "@/components/auth/ui";

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [verify, { isLoading }] = useVerifyOtpMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    mode: "onTouched",
    defaultValues: { email: params.get("email") ?? "", otp: "" },
  });

  const onSubmit = async (values: OtpInput) => {
    try {
      const data = await verify({
        email: values.email,
        otp: values.otp,
      }).unwrap();
      if (!data.resetToken) {
        setError("root", { message: "Verification failed — try again." });
        return;
      }
      try {
        window.sessionStorage.setItem("typerush-reset-token", data.resetToken);
      } catch {
        setError("root", {
          message: "Browser storage is blocked — enable it to continue.",
        });
        return;
      }
      router.push("/reset-password");
    } catch (e) {
      setError("root", { message: getApiError(e) });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {errors.root?.message && <FormError message={errors.root.message} />}
      <Field label="Email" error={errors.email?.message}>
        <input
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
          className={inputCls}
        />
      </Field>
      <Field label="One-time code" error={errors.otp?.message}>
        <input
          placeholder="6-digit code"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={12}
          {...register("otp", {
            onChange: (e) => {
              e.target.value = e.target.value.replace(/\s+/g, "");
            },
          })}
          className={`${inputCls} font-mono text-lg tracking-[0.3em]`}
        />
      </Field>
      <p className="-mt-1 text-xs text-faint">
        Wrong code 5+ times locks it — request a fresh one from{" "}
        <InlineLink href="/forgot-password">forgot password</InlineLink>.
      </p>
      <SubmitButton loading={isLoading}>Verify code →</SubmitButton>
    </form>
  );
}

export default function VerifyOtpPage() {
  return (
    <AuthShell
      title="Check your inbox"
      subtitle="Enter the one-time code we emailed you. It expires in a few minutes."
      footer={<>No code yet? <InlineLink href="/forgot-password">Resend it</InlineLink></>}
    >
      <Suspense>
        <VerifyForm />
      </Suspense>
    </AuthShell>
  );
}
