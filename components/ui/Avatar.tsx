"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Avatar with graceful fallback: if the photo fails to load,
 * renders an initials tile instead of a broken-image icon
 * (which would duplicate the adjacent name text).
 */
export function Avatar({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={cn(
          "grid shrink-0 place-items-center rounded-full border border-line bg-gradient-to-br from-teal-600 to-emerald-800 text-[10px] font-extrabold text-white",
          className
        )}
      >
        {initials(alt)}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
