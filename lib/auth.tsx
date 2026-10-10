"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getApiError,
  useGetSessionQuery,
  useLoginMutation,
  useLogoutMutation,
  useSignupMutation,
  type SessionUser,
} from "@/lib/features/api/base-api";

export type { SessionUser };

type AuthResult = { ok: boolean; message: string };

/**
 * Session hook backed directly by RTK Query — no context provider,
 * no manual thunks. Every mounted instance shares the cached session;
 * login/signup/logout invalidate the "Session" tag so it refetches.
 */
export function useAuth() {
  const router = useRouter();
  const { data, isLoading, refetch } = useGetSessionQuery();
  const [loginMut] = useLoginMutation();
  const [signupMut] = useSignupMutation();
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
        return { ok: true, message: "Logged in." };
      } catch (e) {
        return { ok: false, message: getApiError(e) };
      }
    },
    [loginMut, router]
  );

  const signup = useCallback(
    async (input: Record<string, unknown>): Promise<AuthResult> => {
      try {
        await signupMut(input).unwrap();
      } catch (e) {
        return { ok: false, message: getApiError(e) };
      }
      // Server doesn't auto-login on signup: sign in with the same creds.
      const { email, password } = input;
      if (typeof email !== "string" || typeof password !== "string") {
        return { ok: true, message: "Account created — please log in." };
      }
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
