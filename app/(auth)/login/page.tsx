"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { EmailTypoHint } from "@/components/auth/EmailTypo";
import {
  useLazyGetSessionQuery,
  useLoginMutation,
  useLogoutMutation,
  useResendVerifyOtpMutation,
} from "@/lib/features/auth/features.auth";
import { getApiError } from "@/helper/error-helper";
import { loginSchema, type LoginInput } from "@/components/auth/schemas";
import {
  AuthShell,
  Field,
  FormError,
  GoogleButton,
  InlineLink,
  OrDivider,
  PasswordField,
  SubmitButton,
  inputCls,
} from "@/components/auth/ui";

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/home";
  const [loginMut, { isLoading }] = useLoginMutation();
  const [logoutMut] = useLogoutMutation();
  const [triggerSession] = useLazyGetSessionQuery();
  const [resendOtp] = useResendVerifyOtpMutation();
  const [emailHint, setEmailHint] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginInput) => {
    try {
      await loginMut({ email: values.email, password: values.password }).unwrap();
    } catch (e) {
      setError("root", { message: getApiError(e) });
      return;
    }
    // Credentials passed — but unverified emails cannot stay logged in.
    // Kill the session, send a fresh code, and divert to verification.
    try {
      const session = await triggerSession(undefined, false).unwrap();
      if (session && session.emailVerified === false) {
        try {
          await logoutMut().unwrap();
        } catch {
          // Local session already unusable — continue to verification.
        }
        try {
          await resendOtp({ email: values.email }).unwrap();
        } catch {
          // Verify screen always offers Resend — never block on this.
        }
        toast.success("Verify your email first — fresh code sent.");
        router.push(`/verify-signup?email=${encodeURIComponent(values.email)}`);
        return;
      }
    } catch {
      // Session unreadable — fall through to the normal landing.
    }
    toast.success("Logged in — welcome back!");
    router.push(next);
    router.refresh();
  };

  return (
    <>
      <GoogleButton />
      <OrDivider />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root?.message && <FormError message={errors.root.message} />}
        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email", {
              onChange: (e) => setEmailHint(e.target.value),
            })}
            className={inputCls}
          />
        </Field>
        <EmailTypoHint
          email={emailHint}
          onFix={(fix) => {
            setEmailHint(fix);
            setValue("email", fix, { shouldValidate: true });
          }}
        />
        <div>
          <PasswordField
            field={register("password")}
            error={errors.password?.message}
            autoComplete="current-password"
          />
          <p className="mt-1.5 text-right text-xs">
            <InlineLink href="/forgot-password">Forgot password?</InlineLink>
          </p>
        </div>
        <SubmitButton loading={isLoading} kbd="⏎">Log in →</SubmitButton>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to track results, join contests, and climb the leaderboard."
      footer={<>New to TypeRush? <InlineLink href="/signup">Create an account</InlineLink></>}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
