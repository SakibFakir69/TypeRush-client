"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { signupSchema, type SignupInput } from "@/components/auth/schemas";
import { WelcomeOverlay } from "@/components/auth/WelcomeOverlay";
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
  const { signup } = useAuth();
  const router = useRouter();
  const [welcomed, setWelcomed] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
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
    const res = await signup({ ...values });
    if (res.ok) {
      setWelcomeName(values.name.trim().split(" ")[0]);
      setWelcomed(true);
    } else {
      setError("root", { message: res.message });
    }
  };

  const goApp = () => {
    router.push("/test");
    router.refresh();
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
            {...register("email")}
            className={inputCls}
          />
        </Field>
        <Field label="Country" error={errors.country?.message}>
          <input
            placeholder="Bangladesh"
            autoComplete="country-name"
            {...register("country")}
            className={inputCls}
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
        <SubmitButton loading={isSubmitting}>Sign up free →</SubmitButton>
      </form>
      {welcomed && <WelcomeOverlay name={welcomeName} onDone={goApp} />}
    </AuthShell>
  );
}
