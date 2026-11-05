/**
 * Saved practice texts.
 *
 * Everything here lives in the browser only — `localStorage`, no API call, no
 * leaderboard entry. A typist can paste an article, save it, and practice it
 * later without ever publishing it.
 */

export const CUSTOM_TEXTS_KEY = "typerush:custom-texts";
/** Same limit the textarea enforces. */
export const CUSTOM_TEXT_MAX_CHARS = 2000;
/** Enough for a personal library, small enough to stay snappy. */
export const CUSTOM_TEXT_MAX_ITEMS = 20;

export type CustomText = {
  id: string;
  text: string;
  /** Epoch milliseconds — newest first in the list. */
  savedAt: number;
};

const isBrowser = () => typeof window !== "undefined";

/** localStorage may be blocked (private mode, disabled storage). */
function readRaw(): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(CUSTOM_TEXTS_KEY);
  } catch {
    return null;
  }
}

function writeRaw(items: CustomText[]): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(CUSTOM_TEXTS_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

/** Trims and collapses runs of whitespace so dedupe compares real content. */
export function normalizeCustomText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function isCustomText(value: unknown): value is CustomText {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.text === "string" &&
    typeof v.savedAt === "number" &&
    v.text.trim().length > 0
  );
}

/** Saved texts, newest first. Corrupt entries are ignored, never thrown. */
export function loadCustomTexts(): CustomText[] {
  const raw = readRaw();
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isCustomText)
      .map((item) => ({ ...item, text: item.text.trim() }))
      .sort((a, b) => b.savedAt - a.savedAt)
      .slice(0, CUSTOM_TEXT_MAX_ITEMS);
  } catch {
    return [];
  }
}

export type SaveResult =
  | { ok: true; items: CustomText[]; saved: CustomText }
  | { ok: false; reason: "empty" | "too-long" | "duplicate" | "full" | "storage" };

/** Adds one text and returns the new list, keeping newest first. */
export function saveCustomText(text: string): SaveResult {
  const clean = normalizeCustomText(text);
  if (!clean) return { ok: false, reason: "empty" };
  if (clean.length > CUSTOM_TEXT_MAX_CHARS) {
    return { ok: false, reason: "too-long" };
  }

  const items = loadCustomTexts();
  if (
    items.some((item) => normalizeCustomText(item.text).toLowerCase() === clean.toLowerCase())
  ) {
    return { ok: false, reason: "duplicate" };
  }
  if (items.length >= CUSTOM_TEXT_MAX_ITEMS) {
    return { ok: false, reason: "full" };
  }

  const saved: CustomText = {
    id: `ct_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    text: clean,
    savedAt: Date.now(),
  };
  const next = [saved, ...items];

  if (!writeRaw(next)) return { ok: false, reason: "storage" };
  return { ok: true, items: next, saved };
}

/** Removes one text by id and returns the remaining list. */
export function removeCustomText(id: string): CustomText[] {
  const next = loadCustomTexts().filter((item) => item.id !== id);
  writeRaw(next);
  return next;
}

/** Short label for lists: first words, single line. */
export function customTextPreview(text: string, max = 60): string {
  const clean = normalizeCustomText(text);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}
