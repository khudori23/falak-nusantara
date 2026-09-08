// Sistem Abjad Hisab (Abjad Kabir) — nilai baku huruf hijaiyah.
const HIJAIYAH_VALUE = {
  'ا': 1, 'ب': 2, 'ج': 3, 'د': 4, 'ه': 5, 'و': 6, 'ز': 7, 'ح': 8, 'ط': 9,
  'ي': 10, 'ك': 20, 'ل': 30, 'م': 40, 'ن': 50, 'س': 60, 'ع': 70, 'ف': 80,
  'ص': 90, 'ق': 100, 'ر': 200, 'ش': 300, 'ت': 400, 'ث': 500, 'خ': 600,
  'ذ': 700, 'ض': 800, 'ظ': 900, 'غ': 1000,
};

// Transliterasi sederhana Latin -> Hijaiyah (1 huruf Latin = 1 huruf hijaiyah terdekat).
// Ini pendekatan disederhanakan, bukan kaidah tajwid/transliterasi formal.
const LATIN_TO_HIJAIYAH = {
  a: 'ا', b: 'ب', c: 'ك', d: 'د', e: 'ي', f: 'ف', g: 'ج', h: 'ه', i: 'ي',
  j: 'ج', k: 'ك', l: 'ل', m: 'م', n: 'ن', o: 'و', p: 'ف', q: 'ق', r: 'ر',
  s: 'س', t: 'ت', u: 'و', v: 'ف', w: 'و', x: 'س', y: 'ي', z: 'ز',
};

export function hitungAbjad(namaLengkap) {
  const bersih = namaLengkap.toLowerCase().replace(/[^a-z]/g, '');
  const breakdown = [];
  let total = 0;
  for (const ch of bersih) {
    const hijaiyah = LATIN_TO_HIJAIYAH[ch];
    const value = hijaiyah ? HIJAIYAH_VALUE[hijaiyah] : 0;
    total += value;
    breakdown.push({ latin: ch, hijaiyah, value });
  }
  return { total, breakdown, normalisasi: total % 9 === 0 ? 9 : total % 9 };
}
