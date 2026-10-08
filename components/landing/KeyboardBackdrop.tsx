"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/cn";

type Keycap = {
  left: number;
  top: number;
  w: number;
  h: number;
  rot: number;
  mint: boolean;
  glow: boolean;
  legend: string;
  wide: boolean;
  dur: number;
  delay: number;
  lift: number;
  dim: boolean;
};

const ROW = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890!@#$%&*";

/** Deterministic PRNG so server + client render identical keys. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildKeys(count: number, seed: number, dim: boolean): Keycap[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => {
    const wide = !dim && i % 9 === 4;
    return {
      left: 1 + rand() * 96,
      top: 3 + rand() * 92,
      w: wide ? 96 + rand() * 40 : dim ? 16 + rand() * 16 : 26 + rand() * 28,
      h: wide ? 32 : dim ? 16 + rand() * 16 : 26 + rand() * 28,
      rot: -10 + rand() * 20,
      mint: !dim && i % 7 === 3,
      glow: !dim && i % 11 === 5,
      legend: wide ? "SPACE" : dim ? "" : ROW[(i * 7) % ROW.length],
      wide,
      dur: 2.6 + rand() * 1.9,
      delay: -(rand() * 4),
      lift: dim ? 4 + rand() * 5 : 7 + rand() * 9,
      dim,
    };
  });
}

// Far layer: small dim keys (depth). Near layer: full keys (focus).
const FAR_KEYS = buildKeys(22, 21, true);
const NEAR_KEYS = buildKeys(30, 7, false);

/**
 * Keyboard-world backdrop: faint key grid, ambient aura blobs,
 * a dim far key field and a near key field drifting at different
 * scroll speeds (parallax depth). Fixed, pointer-transparent,
 * pure decoration. Honors reduced-motion (no parallax, no bounce).
 */
export function KeyboardBackdrop() {
  const farRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        if (farRef.current)
          farRef.current.style.transform = `translateY(${(y * 0.05).toFixed(1)}px)`;
        if (nearRef.current)
          nearRef.current.style.transform = `translateY(${(y * 0.12).toFixed(1)}px)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const renderKey = (k: Keycap, i: number) => (
    <span
      key={i}
      aria-hidden
      className={cn(
        "kb-key grid place-items-center",
        k.mint && "kb-key-mint",
        k.glow && "kb-key-glow",
        k.dim && "opacity-25"
      )}
      style={
        {
          left: `${k.left}%`,
          top: `${k.top}%`,
          width: k.w,
          height: k.h,
          transform: `rotate(${k.rot.toFixed(1)}deg)`,
          "--kb-dur": `${k.dur.toFixed(2)}s`,
          "--kb-delay": `${k.delay.toFixed(2)}s`,
          "--kb-lift": `${k.lift.toFixed(1)}px`,
        } as CSSProperties
      }
    >
      {k.legend && (
        <span
          className={cn(
            "font-bold leading-none",
            k.wide ? "text-[8px] tracking-[0.25em]" : "text-[10px]",
            k.mint || k.glow ? "text-accent" : "text-muted"
          )}
        >
          {k.legend}
        </span>
      )}
    </span>
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="kb-grid-bg absolute inset-0" />
      <div
        aria-hidden
        className="absolute -left-40 top-[8%] h-[420px] w-[420px] rounded-full blur-3xl"
        style={{
          background:
            "color-mix(in srgb, var(--accent) 7%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="absolute -right-48 top-[55%] h-[460px] w-[460px] rounded-full blur-3xl"
        style={{
          background:
            "color-mix(in srgb, #a855f7 6%, transparent)",
        }}
      />
      <div ref={farRef} aria-hidden className="absolute inset-0">
        {FAR_KEYS.map(renderKey)}
      </div>
      <div ref={nearRef} aria-hidden className="absolute inset-0">
        {NEAR_KEYS.map(renderKey)}
      </div>
    </div>
  );
}
