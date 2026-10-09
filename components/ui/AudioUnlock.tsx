"use client";

import { useEffect } from "react";
import { unlockAudio } from "@/lib/keySound";

/**
 * Warms up the shared AudioContext on the very first user gesture,
 * so the first keystroke already has sound (autoplay policies start
 * contexts suspended until a gesture arrives).
 */
export function AudioUnlock() {
  useEffect(() => {
    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, []);
  return null;
}
