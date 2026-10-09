"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
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
  const { login } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/test";
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginInput) => {
    const res = await login(values.email, values.password);
    if (res.ok) {
      router.push(next);
      router.refresh();
    } else {
      setError("root", { message: res.message });
    }
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
            {...register("email")}
            className={inputCls}
          />
        </Field>
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
        <SubmitButton loading={isSubmitting}>Log in →</SubmitButton>
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
