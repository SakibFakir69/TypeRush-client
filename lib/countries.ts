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

/** ISO code lookup for flag rendering ("Bangladesh" → "bd"). */
export function countryCodeFor(name: string): string | null {
  const hit = COUNTRIES.find(
    (c) => c.name.toLowerCase() === name.trim().toLowerCase()
  );
  return hit ? hit.code : null;
}
