"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getApiError } from "@/helper/error-helper";
import { useForgotPasswordMutation } from "@/lib/features/auth/features.auth";
import { toast } from "sonner";
import { forgotSchema, type ForgotInput } from "@/components/auth/schemas";
import {
  AuthShell,
  Field,
  FormError,
  FormOK,
  InlineLink,
  SubmitButton,
  inputCls,
} from "@/components/auth/ui";

export default function ForgotPasswordPage() {
  const [doneEmail, setDoneEmail] = useState("");
  const [forgot, { isLoading }] = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotInput) => {
    try {
      await forgot({ email: values.email }).unwrap();
      toast.success("Code sent — check your inbox.");
      setDoneEmail(values.email);
    } catch (e) {
      setError("root", { message: getApiError(e) });
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your account email and we'll send a one-time code."
      footer={<>Remembered it? <InlineLink href="/login">Back to log in</InlineLink></>}
    >
      {doneEmail ? (
        <div className="space-y-4">
          <FormOK message="If this email is registered, a one-time code is on its way. Codes expire quickly and resends are rate-limited." />
          <Link
            href={`/verify-otp?email=${encodeURIComponent(doneEmail)}`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-mint px-4 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
          >
            Enter the code →
          </Link>
        </div>
      ) : (
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
          <SubmitButton loading={isLoading} kbd="⏎">Send code →</SubmitButton>
        </form>
      )}
    </AuthShell>
  );
}
