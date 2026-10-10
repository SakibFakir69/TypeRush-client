"use client";

import { useTheme } from "@/lib/theme";
import { Toaster } from "sonner";

/** Theme-aware toast root mounted once in the root layout. */
export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--card)",
          color: "var(--ink)",
          border: "1px solid var(--line)",
        },
      }}
    />
  );
}
