"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Global motion defaults: honor OS reduced-motion everywhere. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
