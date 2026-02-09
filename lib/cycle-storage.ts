/**
 * Shared localStorage persistence for cycles.
 * Used by Cycles and Calendar pages. Replace with Supabase later.
 */

export const CYCLES_STORAGE_KEY = "activeCycles";

type CycleRecord = Record<string, unknown>;

function isDateLike(v: unknown): v is Date {
  return v instanceof Date || (typeof v === "object" && v !== null && "toISOString" in v);
}

export function loadCycles(): CycleRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CYCLES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CycleRecord[];
    return parsed.map((c) => ({
      ...c,
      startDate: new Date(c.startDate as string),
      endDate: new Date(c.endDate as string),
      completedAt: c.completedAt ? new Date(c.completedAt as string) : undefined,
    }));
  } catch {
    return [];
  }
}

export function saveCycles(cycles: CycleRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    const toStore = cycles.map((c) => ({
      ...c,
      startDate: isDateLike(c.startDate) ? (c.startDate as Date).toISOString() : c.startDate,
      endDate: isDateLike(c.endDate) ? (c.endDate as Date).toISOString() : c.endDate,
      completedAt: c.completedAt && isDateLike(c.completedAt) ? (c.completedAt as Date).toISOString() : c.completedAt,
    }));
    localStorage.setItem(CYCLES_STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // ignore
  }
}
