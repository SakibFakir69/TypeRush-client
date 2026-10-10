"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { getApiError } from "@/helper/error-helper";
import {
  useSendSignupOtpMutation,
  useVerifySignupMutation,
} from "@/lib/features/auth/features.auth";
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
  otp: z.string().trim().min(1, "Enter the code."),
});
type OtpForm = z.infer<typeof otpSchema>;

function VerifySignupForm({ email }: { email: string }) {
  const router = useRouter();
  const [sendOtp, { isLoading: sending }] = useSendSignupOtpMutation();
  const [verify, { isLoading: verifying }] = useVerifySignupMutation();
  const [sendState, setSendState] = useState<"sending" | "sent" | "failed">(
    "sending"
  );
  const [welcomed, setWelcomed] = useState(false);
  const sentOnce = useRef(false);

  // Register → send OTP immediately (once per mount).
  useEffect(() => {
    if (sentOnce.current || !email) return;
    sentOnce.current = true;
    sendOtp({ email })
      .unwrap()
      .then(() => setSendState("sent"))
      .catch(() => setSendState("failed"));
  }, [email, sendOtp]);

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

  const resend = async () => {
    setSendState("sending");
    try {
      await sendOtp({ email }).unwrap();
      setSendState("sent");
    } catch (e) {
      setError("root", { message: getApiError(e) });
      setSendState("failed");
    }
  };

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
      {sendState === "sending" && (
        <p role="status" className="text-sm text-muted">
          Sending your code…
        </p>
      )}
      {sendState === "sent" && (
        <FormOK message={`Code sent to ${email}. It expires in a few minutes.`} />
      )}
      {sendState === "failed" && (
        <FormError message="Couldn't send the code automatically — press Resend below." />
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root?.message && <FormError message={errors.root.message} />}
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
        <SubmitButton loading={verifying} kbd="⏎">Verify & continue →</SubmitButton>
      </form>
      <button
        type="button"
        onClick={resend}
        disabled={sending}
        className="w-full text-center text-[13px] font-bold text-accent hover:underline disabled:opacity-60"
      >
        {sending ? "Sending…" : "Resend code"}
      </button>
      {welcomed && <WelcomeOverlay name="" onDone={goLogin} />}
    </div>
  );
}

export default function VerifySignupPage() {
  return (
    <AuthShell
      title="Verify your email"
      subtitle="We sent a one-time code on registration — enter it to activate your account."
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
