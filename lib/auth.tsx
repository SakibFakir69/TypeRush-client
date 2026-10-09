"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export type SessionUser = {
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
} & Record<string, unknown>;

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  signup: (input: Record<string, unknown>) => Promise<{ ok: boolean; message: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<SessionUser | null> {
  const res = await apiFetch<unknown>("/api/v1/users");
  if (!res.ok || !res.data || typeof res.data !== "object") return null;
  const d = res.data as Record<string, unknown>;
  if (d.user && typeof d.user === "object") return d.user as SessionUser;
  return d as SessionUser;
}

/** Session provider: hydrates the user from the httpOnly cookie session. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    setUser(await fetchMe());
  }, []);

  useEffect(() => {
    let alive = true;
    fetchMe()
      .then((u) => {
        if (alive) setUser(u);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch("/api/v1/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (res.ok) {
      setUser(await fetchMe());
      router.refresh();
    }
    return { ok: res.ok, message: res.message };
  }, [router]);

  const signup = useCallback(
    async (input: Record<string, unknown>) => {
      const created = await apiFetch("/api/v1/users", {
        method: "POST",
        body: input,
      });
      if (!created.ok) return { ok: false, message: created.message };
      // Server doesn't auto-login on signup: sign in with the same creds.
      const email = input.email;
      const password = input.password;
      if (typeof email === "string" && typeof password === "string") {
        return await login(email, password);
      }
      return { ok: true, message: created.message };
    },
    [login]
  );

  const logout = useCallback(async () => {
    await apiFetch("/api/v1/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
