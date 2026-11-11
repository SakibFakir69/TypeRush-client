"use client";

import { useEffect, useState } from "react";

/**
 * A clock that re-renders on an interval.
 *
 * Countdowns and contest phases need "now" to move forward, but calling
 * `Date.now()` during render is unstable. This ticks once a second by default.
 */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
