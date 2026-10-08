"use client";

import { useEffect, useState } from "react";

/**
 * Scrollspy: returns the id of the section currently above a
 * 40%-viewport line. Used by Navbar to glow the matching link.
 *
 * Why not IntersectionObserver: with a thin detection band, short
 * sections at the page bottom (e.g. the footer = "about") can sit
 * below the band and never activate. Position comparison + an
 * explicit bottom-of-page rule makes every item reachable.
 */
export function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState<string>("");
  const key = sectionIds.join("|");

  useEffect(() => {
    const ids = key.split("|").filter(Boolean);
    if (ids.length === 0) return;

    let raf = 0;
    const compute = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // Bottom of page: last existing section wins, so short
      // footers still highlight (fixes "About never glows").
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) {
        for (let i = ids.length - 1; i >= 0; i--) {
          if (document.getElementById(ids[i])) {
            current = ids[i];
            break;
          }
        }
      }
      setActive(current);
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [key]);

  return active;
}
