import { calculateAbjad } from "./abjadUtils";

export interface CompatibilityBreakdown { komunikasi: number; kerjaSama: number; emosi: number; nilaiTradisional: number; }
export interface CompatibilityResult { score: number; breakdown: CompatibilityBreakdown; }

export function calculateAbjadCompatibility(nameA: string, nameB: string, letterValues: Record<string, number>): CompatibilityResult {
  const a = calculateAbjad(nameA, letterValues).total;
  const b = calculateAbjad(nameB, letterValues).total;
  const diff = Math.abs(a - b);
  const maxVal = Math.max(a, b, 1);
  const closeness = 1 - Math.min(diff / maxVal, 1);
  const base = Math.round(closeness * 100);
  const breakdown: CompatibilityBreakdown = {
    komunikasi: clamp(base + ((a % 7) - 3)),
    kerjaSama: clamp(base + ((b % 7) - 3)),
    emosi: clamp(base + (((a + b) % 5) - 2)),
    nilaiTradisional: clamp(base + (((a - b) % 5))),
  };
  const score = Math.round((breakdown.komunikasi + breakdown.kerjaSama + breakdown.emosi + breakdown.nilaiTradisional) / 4);
  return { score, breakdown };
}

export function calculateBirthdateCompatibility(dateA: Date, dateB: Date): CompatibilityResult {
  const dayA = dateA.getDay();
  const dayB = dateB.getDay();
  const diff = Math.min(Math.abs(dayA - dayB), 7 - Math.abs(dayA - dayB));
  const base = clamp(100 - diff * 12);
  const breakdown: CompatibilityBreakdown = {
    komunikasi: clamp(base + 4),
    kerjaSama: clamp(base - 3),
    emosi: clamp(base + 2),
    nilaiTradisional: clamp(base - 1),
  };
  const score = Math.round((breakdown.komunikasi + breakdown.kerjaSama + breakdown.emosi + breakdown.nilaiTradisional) / 4);
  return { score, breakdown };
}

function clamp(n: number): number { return Math.max(0, Math.min(100, n)); }
