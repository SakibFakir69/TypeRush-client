"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { getApiError } from "@/helper/error-helper";
import { useCreateUserMutation } from "@/lib/features/user/features.user";
import { signupSchema, type SignupInput } from "@/components/auth/schemas";
import { COUNTRIES } from "@/components/auth/countries";
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
  const [createUser, { isLoading }] = useCreateUserMutation();
  const {
    register,
    handleSubmit,
    setError,
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
    // No auto-login here: the account must verify its email first.
    try {
      await createUser({ ...values }).unwrap();
      router.push(`/verify-signup?email=${encodeURIComponent(values.email)}`);
    } catch (e) {
      setError("root", { message: getApiError(e) });
    }
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
            list="country-list"
            {...register("country")}
            className={inputCls}
          />
          <datalist id="country-list">
            {COUNTRIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
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
        <SubmitButton loading={isLoading} kbd="⏎">Sign up free →</SubmitButton>
      </form>
    </AuthShell>
  );
}
