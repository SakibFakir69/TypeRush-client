"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { getApiError } from "@/helper/error-helper";
import { EmailTypoHint } from "@/components/auth/EmailTypo";
import { useCreateUserMutation } from "@/lib/features/user/features.user";
import { useResendVerifyOtpMutation } from "@/lib/features/auth/features.auth";
import { signupSchema, type SignupInput } from "@/components/auth/schemas";
import { CountryPicker } from "@/components/auth/CountryPicker";
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

export default function SignupPage() {
  const router = useRouter();
  const [emailHint, setEmailHint] = useState("");
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [sendOtp, { isLoading: sending }] = useResendVerifyOtpMutation();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      name: "",
      email: "",
      country: "",
      password: "",
      confirm: "",
    },
  });

  const onSubmit = async (values: SignupInput) => {
    // Server zod strips the extra `confirm` key automatically.
    try {
      await createUser({ ...values }).unwrap();
    } catch (e) {
      setError("root", { message: getApiError(e) });
      return;
    }
    // Account created — fire the verification code (best effort; the
    // verify page always offers Resend) and move to verification.
    const email = values.email;
    try {
      await sendOtp({ email }).unwrap();
    } catch {
      // Resend from the next screen — never block registration on this.
    }
    router.push(`/verify-signup?email=${encodeURIComponent(email)}`);
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever. Track results, join contests, and battle typists worldwide."
      footer={<>Already have an account? <InlineLink href="/login">Log in</InlineLink></>}
    >
      <GoogleButton />
      <OrDivider />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root?.message && <FormError message={errors.root.message} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.fullName?.message}>
            <input
              placeholder="Ada Lovelace"
              autoComplete="name"
              {...register("fullName")}
              className={inputCls}
            />
          </Field>
          <Field label="Username" error={errors.name?.message}>
            <input
              placeholder="speedmaster"
              autoComplete="username"
              {...register("name")}
              className={inputCls}
            />
          </Field>
        </div>
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
        <Field label="Country" error={errors.country?.message}>
          <CountryPicker
            onChange={(name) =>
              setValue("country", name, {
                shouldValidate: true,
                shouldTouch: true,
              })
            }
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            field={register("password")}
            error={errors.password?.message}
            autoComplete="new-password"
          />
          <PasswordField
            field={register("confirm")}
            error={errors.confirm?.message}
            label="Confirm password"
            autoComplete="new-password"
          />
        </div>
        <SubmitButton loading={creating || sending} kbd="⏎">Sign up free →</SubmitButton>
      </form>
    </AuthShell>
  );
}
