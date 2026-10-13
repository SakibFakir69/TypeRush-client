"use client";

const KNOWN = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "proton.me",
  "yandex.com",
];

function distance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[n];
}

/**
 * Catches typo'd domains (gmal.com → gmail.com). Only fires when the
 * domain looks finished (contains a dot) so it never nags mid-typing.
 */
export function suggestEmailFix(raw: string): string | null {
  const at = raw.lastIndexOf("@");
  if (at <= 0) return null;
  const local = raw.slice(0, at);
  const domain = raw.slice(at + 1).toLowerCase();
  if (!local || !domain.includes(".")) return null;
  if (KNOWN.includes(domain)) return null;
  let best: string | null = null;
  let bestDist = 3;
  for (const known of KNOWN) {
    const d = distance(domain, known);
    if (d < bestDist) {
      bestDist = d;
      best = known;
    }
  }
  if (!best) return null;
  return `${local}@${best}`;
}

export function EmailTypoHint({
  email,
  onFix,
}: {
  email: string;
  onFix: (fixed: string) => void;
}) {
  const fix = suggestEmailFix(email.trim());
  if (!fix) return null;
  return (
    <button
      type="button"
      onClick={() => onFix(fix)}
      className="mt-1.5 text-xs text-accent hover:underline"
    >
      Did you mean <span className="font-bold">{fix}</span>?
    </button>
  );
}
