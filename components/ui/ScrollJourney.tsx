"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/** Thin journey bar: fills as you travel down the landing page. */
export function ScrollJourney() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-accent via-mint to-accent"
      style={{ scaleX }}
    />
  );
}
