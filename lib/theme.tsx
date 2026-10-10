"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Script from "next/script";

const KEY = "typerush-theme";

type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: Resolved;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
});

function apply(r: Resolved) {
  const el = document.documentElement;
  el.classList.toggle("light", r === "light");
  el.classList.toggle("dark", r !== "light");
  el.style.colorScheme = r;
}

function resolveStored(): Theme {
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* storage unavailable — fall through to default */
  }
  return "dark";
}

function resolveLive(t: Theme): Resolved {
  if (t !== "system") return t;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/**
 * Blocking pre-paint script (via next/script, not a rendered <script>
 * tag) so the saved theme applies before first paint — no flash.
 */
export function ThemeScript() {
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- rendered in app/layout.tsx (root layout), the sanctioned App Router spot
    <Script
      id="typerush-theme-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t=localStorage.getItem("typerush-theme")||"dark";var r=t==="system"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):t;if(r==="light")document.documentElement.classList.add("light");document.documentElement.style.colorScheme=r;}catch(e){}})();`,
      }}
    />
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolved, setResolved] = useState<Resolved>("dark");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = resolveStored();
      setThemeState(stored);
      const r = resolveLive(stored);
      setResolved(r);
      apply(r);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      const r: Resolved = mq.matches ? "light" : "dark";
      setResolved(r);
      apply(r);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(KEY, t);
    } catch {
      /* storage unavailable — session-only theme */
    }
    const r = resolveLive(t);
    setResolved(r);
    apply(r);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
