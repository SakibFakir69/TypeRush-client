"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { getApiError } from "@/helper/error-helper";
import {
  useVerifyEmailMutation,
} from "@/lib/features/auth/features.auth";
import { ResendButton } from "@/components/auth/ResendButton";
import { WelcomeOverlay } from "@/components/auth/WelcomeOverlay";
import {
  AuthShell,
  Field,
  FormError,
  FormOK,
  InlineLink,
  SubmitButton,
  inputCls,
} from "@/components/auth/ui";

const otpSchema = z.object({
  otp: z.string().trim().length(6, "Enter the 6-digit code."),
});
type OtpForm = z.infer<typeof otpSchema>;

function VerifySignupForm({ email }: { email: string }) {
  const router = useRouter();
  const [verify, { isLoading: verifying }] = useVerifyEmailMutation();
  const [welcomed, setWelcomed] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    mode: "onTouched",
    defaultValues: { otp: "" },
  });

  const onSubmit = async (values: OtpForm) => {
    try {
      await verify({ email, otp: values.otp }).unwrap();
      setWelcomed(true);
    } catch (e) {
      setError("root", { message: getApiError(e) });
    }
  };

  const goLogin = () => {
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <FormOK message={`A code was sent to ${email}. It expires in a few minutes.`} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root?.message && <FormError message={errors.root.message} />}
        <Field label="One-time code" error={errors.otp?.message}>
          <input
            placeholder="6-digit code"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            {...register("otp", {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D+/g, "").slice(0, 6);
              },
            })}
            className={`${inputCls} font-mono text-lg tracking-[0.3em]`}
          />
        </Field>
        <SubmitButton loading={verifying} kbd="⏎">
          Verify & continue →
        </SubmitButton>
      </form>
      <ResendButton getEmail={() => email} kind="signup" />
      {welcomed && <WelcomeOverlay name="" onDone={goLogin} />}
    </div>
  );
}

export default function VerifySignupPage() {
  return (
    <AuthShell
      title="Verify your email"
      subtitle="Enter the 6-digit code from registration to activate your account."
      footer={<>Wrong email? <InlineLink href="/signup">Register again</InlineLink></>}
    >
      <Suspense>
        <VerifySignupInner />
      </Suspense>
    </AuthShell>
  );
}

function VerifySignupInner() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  if (!email) {
    return (
      <FormError message="No email to verify — register first, then come back here." />
    );
  }
  return <VerifySignupForm email={email} />;
}
