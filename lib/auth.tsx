"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getApiError } from "@/helper/error-helper";
import {
  useGetSessionQuery,
  useLoginMutation,
  useLogoutMutation,
} from "@/lib/features/auth/features.auth";
import { useCreateUserMutation } from "@/lib/features/user/features.user";
import type { SessionUser } from "@/lib/features/api/base-api";

export type { SessionUser };

type AuthResult = { ok: boolean; message: string };

/**
 * Session hook backed directly by RTK Query — no context provider,
 * no manual thunks. Every mounted instance shares the cached session;
 * login/logout/profile edits invalidate the "Session" tag so it refetches.
 */
export function useAuth() {
  const router = useRouter();
  const { data, isLoading, refetch } = useGetSessionQuery();
  const [loginMut] = useLoginMutation();
  const [signupMut] = useCreateUserMutation();
  const [logoutMut] = useLogoutMutation();

  const user = data ?? null;

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        await loginMut({ email, password }).unwrap();
        router.refresh();
        toast.success("Logged in — welcome back!");
        return { ok: true, message: "Logged in." };
      } catch (e) {
        return { ok: false, message: getApiError(e) };
      }
    },
    [loginMut, router]
  );

  const signup = useCallback(
    async (input: Record<string, unknown>): Promise<AuthResult> => {
      const { email, password } = input;
      if (typeof email !== "string" || typeof password !== "string") {
        return { ok: false, message: "Email and password are required." };
      }
      try {
        await signupMut({
          name: String(input.name ?? ""),
          fullName: String(input.fullName ?? ""),
          email,
          country: String(input.country ?? ""),
          password,
        }).unwrap();
      } catch (e) {
        return { ok: false, message: getApiError(e) };
      }
      // Server doesn't auto-login on signup: sign in with the same creds.
      return await login(email, password);
    },
    [signupMut, login]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMut().unwrap();
    } catch {
      // Session ends locally even if the server call fails.
    }
    toast.success("Logged out. See you soon!");
    router.refresh();
  }, [logoutMut, router]);

  return {
    user,
    loading: isLoading,
    refresh,
    login,
    signup,
    logout,
  };
}
