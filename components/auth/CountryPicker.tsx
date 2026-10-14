"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/cn";

function Flag({ code }: { code: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny CDN flags; next/image offers nothing here
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt=""
      aria-hidden
      width={20}
      height={14}
      loading="lazy"
      className="h-3.5 w-5 shrink-0 rounded-[3px] object-cover"
    />
  );
}

/**
 * Country picker with flags + type-to-filter. Controlled via
 * value/onChange so react-hook-form stays in charge of validation.
 */
export function CountryPicker({
  onChange,
}: {
  onChange: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [picked, setPicked] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFilter("");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setFilter("");
      }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const selected = COUNTRIES.find((c) => c.name === picked);
  const q = filter.trim().toLowerCase();
  const list = COUNTRIES.filter(
    (c) => !q || c.name.toLowerCase().includes(q) || c.code.includes(q)
  );

  const pick = (name: string) => {
    setPicked(name);
    onChange(name);
    setOpen(false);
    setFilter("");
  };

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Choose country"
        className="flex w-full items-center gap-2.5 rounded-lg border border-line bg-inset px-3.5 py-2.5 text-left text-sm transition focus:border-accent/60 focus:outline-none"
      >
        {selected ? (
          <Flag code={selected.code} />
        ) : (
          <Globe size={15} aria-hidden className="shrink-0 text-faint" />
        )}
        <span className={cn("flex-1 truncate", !selected && "text-faint")}>
          {selected ? selected.name : "Choose your country…"}
        </span>
        <ChevronDown
          size={15}
          aria-hidden
          className={cn("shrink-0 text-faint transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-line bg-card shadow-[var(--card-shadow)]">
          <div className="border-b border-line p-2">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search countries…"
              aria-label="Search countries"
              className="w-full rounded-md bg-inset px-2.5 py-1.5 text-[13px] text-ink placeholder:text-faint focus:outline-none"
            />
          </div>
          <ul role="listbox" aria-label="Countries" className="max-h-56 overflow-y-auto p-1.5">
            {list.map((c) => (
              <li key={c.code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={picked === c.name}
                  onClick={() => pick(c.name)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition hover:bg-chip",
                    picked === c.name ? "font-bold text-ink" : "text-muted"
                  )}
                >
                  <Flag code={c.code} />
                  <span className="flex-1 truncate">{c.name}</span>
                  {picked === c.name && (
                    <Check size={14} aria-hidden className="shrink-0 text-accent" />
                  )}
                </button>
              </li>
            ))}
            {list.length === 0 && (
              <li className="px-2.5 py-3 text-center text-xs text-faint">
                No match — pick the closest one.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
