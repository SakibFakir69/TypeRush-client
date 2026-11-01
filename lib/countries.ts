/** Shared country data — server-safe (no client directives). */

export type Country = { code: string; name: string };

export const COUNTRIES: Country[] = [
  { code: "bd", name: "Bangladesh" },
  { code: "in", name: "India" },
  { code: "pk", name: "Pakistan" },
  { code: "np", name: "Nepal" },
  { code: "lk", name: "Sri Lanka" },
  { code: "af", name: "Afghanistan" },
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  { code: "nz", name: "New Zealand" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "es", name: "Spain" },
  { code: "it", name: "Italy" },
  { code: "nl", name: "Netherlands" },
  { code: "be", name: "Belgium" },
  { code: "ch", name: "Switzerland" },
  { code: "at", name: "Austria" },
  { code: "se", name: "Sweden" },
  { code: "no", name: "Norway" },
  { code: "dk", name: "Denmark" },
  { code: "fi", name: "Finland" },
  { code: "ie", name: "Ireland" },
  { code: "pt", name: "Portugal" },
  { code: "pl", name: "Poland" },
  { code: "gr", name: "Greece" },
  { code: "ua", name: "Ukraine" },
  { code: "ru", name: "Russia" },
  { code: "tr", name: "Turkey" },
  { code: "sa", name: "Saudi Arabia" },
  { code: "ae", name: "United Arab Emirates" },
  { code: "eg", name: "Egypt" },
  { code: "ma", name: "Morocco" },
  { code: "ng", name: "Nigeria" },
  { code: "gh", name: "Ghana" },
  { code: "ke", name: "Kenya" },
  { code: "et", name: "Ethiopia" },
  { code: "za", name: "South Africa" },
  { code: "cn", name: "China" },
  { code: "jp", name: "Japan" },
  { code: "kr", name: "South Korea" },
  { code: "id", name: "Indonesia" },
  { code: "my", name: "Malaysia" },
  { code: "ph", name: "Philippines" },
  { code: "th", name: "Thailand" },
  { code: "vn", name: "Vietnam" },
  { code: "sg", name: "Singapore" },
  { code: "mx", name: "Mexico" },
  { code: "br", name: "Brazil" },
  { code: "ar", name: "Argentina" },
  { code: "cl", name: "Chile" },
  { code: "co", name: "Colombia" },
];

/** Names people actually type that are not the canonical label above. */
const COUNTRY_ALIASES: Record<string, string> = {
  usa: "us",
  "u s a": "us",
  "united states of america": "us",
  america: "us",
  uk: "gb",
  "u k": "gb",
  britain: "gb",
  "great britain": "gb",
  england: "gb",
  scotland: "gb",
  wales: "gb",
  uae: "ae",
  "u a e": "ae",
  emirates: "ae",
  ksa: "sa",
  "kingdom of saudi arabia": "sa",
  korea: "kr",
  "republic of korea": "kr",
  "russian federation": "ru",
  "viet nam": "vn",
  holland: "nl",
  turkiye: "tr",
  "czech republic": "cz",
  "ivory coast": "ci",
  "cote d ivoire": "ci",
};

/** Lower-case, dash/underscore free lookup key. */
function countryKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[._-]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Resolve whatever is stored on a user (`"Bangladesh"`, `"BD"`, `"bd"`,
 * `"KSA"`, `"UK"`) to one canonical country record.
 *
 * Older records and hand-typed values are stored as codes, so both spellings
 * have to work or the flag and the label silently disappear.
 */
export function resolveCountry(value: string | null | undefined): Country | null {
  const k = countryKey(value ?? "");
  if (!k) return null;

  const byCode = COUNTRIES.find((c) => c.code === k);
  if (byCode) return byCode;

  const byName = COUNTRIES.find((c) => countryKey(c.name) === k);
  if (byName) return byName;

  const aliasCode = COUNTRY_ALIASES[k];
  return aliasCode ? COUNTRIES.find((c) => c.code === aliasCode) ?? null : null;
}

/** ISO code lookup for flag rendering ("Bangladesh" → "bd", "KSA" → "sa"). */
export function countryCodeFor(name: string): string | null {
  return resolveCountry(name)?.code ?? null;
}

/** Canonical display name ("sa" → "Saudi Arabia"); null when unknown. */
export function countryNameFor(value: string): string | null {
  return resolveCountry(value)?.name ?? null;
}
