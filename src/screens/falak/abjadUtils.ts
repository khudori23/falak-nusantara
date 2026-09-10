export interface AbjadStep { char: string; arabicLetter: string | null; value: number; }
export interface AbjadResult { steps: AbjadStep[]; total: number; }
const LATIN_TO_ARABIC: Record<string, string> = {
  "kh": "خ", "sy": "ش", "dz": "ذ", "ts": "ث", "gh": "غ",
  "a": "ا", "b": "ب", "t": "ت", "j": "ج", "h": "ه",
  "d": "د", "r": "ر", "z": "ز", "s": "س", "sh": "ص",
  "th": "ط", "'": "ع", "f": "ف", "q": "ق", "k": "ك",
  "l": "ل", "m": "م", "n": "ن", "w": "و", "y": "ي",
  "g": "ج", "c": "ج", "v": "ف", "p": "ب", "x": "ك",
};
export function calculateAbjad(name: string, letterValues: Record<string, number>): AbjadResult {
  const cleaned = name.toLowerCase().replace(/[^a-z']/g, "");
  const steps: AbjadStep[] = [];
  let i = 0;
  while (i < cleaned.length) {
    const twoChar = cleaned.slice(i, i + 2);
    const oneChar = cleaned[i];
    if (LATIN_TO_ARABIC[twoChar]) {
      const arabicLetter = LATIN_TO_ARABIC[twoChar];
      const value = letterValues[arabicLetter] ?? 0;
      steps.push({ char: twoChar, arabicLetter, value });
      i += 2;
    } else if (LATIN_TO_ARABIC[oneChar]) {
      const arabicLetter = LATIN_TO_ARABIC[oneChar];
      const value = letterValues[arabicLetter] ?? 0;
      steps.push({ char: oneChar, arabicLetter, value });
      i += 1;
    } else {
      steps.push({ char: oneChar, arabicLetter: null, value: 0 });
      i += 1;
    }
  }
  const total = steps.reduce((sum, s) => sum + s.value, 0);
  return { steps, total };
}
export function reduceToSingleDigit(n: number): number {
  while (n > 9) { n = String(n).split("").reduce((sum, d) => sum + parseInt(d, 10), 0); }
  return n;
}
