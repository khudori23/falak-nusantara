/**
 * falakUtils.ts
 * Falak Nusantara — Utility perhitungan client-side (tanpa dependency eksternal)
 * Dipakai oleh: JamTanggal.tsx, KalenderHijriah.tsx
 *
 * Semua fungsi di sini murni matematis (offline-first, PRD §4 & §5).
 */

// ---------- Konversi Hijriah (algoritma tabular/"Kuwaiti" — hisab urfi) ----------
// Catatan: ini estimasi hisab, BUKAN hasil rukyat. Tampilkan sebagai estimasi
// di UI untuk tanggal yang jauh dari hari ini (sesuai PRD §4 edge case).

export interface HijriDate {
  day: number;
  month: number; // 1-12
  year: number;
  monthName: string;
}

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir",
  "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah",
];

/** Konversi tanggal Masehi (Date, UTC) ke Hijriah menggunakan algoritma tabular Kuwaiti. */
export function gregorianToHijri(date: Date): HijriDate {
  const jd = gregorianToJulianDay(date);
  return julianDayToHijri(jd);
}

function gregorianToJulianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * m2 + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045
  );
}

function julianDayToHijri(jd: number): HijriDate {
  // Konstanta algoritma tabular Kuwaiti (epoch Hijriah = JD 1948439.5)
  const jdEpoch = 1948439.5 - 1;
  let l = Math.floor(jd) - Math.floor(jdEpoch);
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return {
    day,
    month,
    year,
    monthName: HIJRI_MONTHS[month - 1] ?? "-",
  };
}

/** Format Hijriah siap-tampil, mis. "14 Rabiul Awal 1448 H" */
export function formatHijri(h: HijriDate): string {
  return `${h.day} ${h.monthName} ${h.year} H`;
}

// ---------- Fase Bulan ----------

export type MoonPhaseName =
  | "Bulan Baru" | "Sabit Awal" | "Kuartal Awal" | "Cembung Awal"
  | "Purnama" | "Cembung Akhir" | "Kuartal Akhir" | "Sabit Akhir";

export interface MoonPhase {
  name: MoonPhaseName;
  illumination: number; // 0-1
  icon: string; // emoji, untuk render cepat tanpa aset gambar
}

const SYNODIC_MONTH = 29.530588853; // hari
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // referensi bulan baru

export function getMoonPhase(date: Date): MoonPhase {
  const daysSinceNew = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
  let phase = (daysSinceNew % SYNODIC_MONTH) / SYNODIC_MONTH;
  if (phase < 0) phase += 1;

  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;

  let name: MoonPhaseName;
  let icon: string;
  if (phase < 0.03 || phase > 0.97) { name = "Bulan Baru"; icon = "🌑"; }
  else if (phase < 0.22) { name = "Sabit Awal"; icon = "🌒"; }
  else if (phase < 0.28) { name = "Kuartal Awal"; icon = "🌓"; }
  else if (phase < 0.47) { name = "Cembung Awal"; icon = "🌔"; }
  else if (phase < 0.53) { name = "Purnama"; icon = "🌕"; }
  else if (phase < 0.72) { name = "Cembung Akhir"; icon = "🌖"; }
  else if (phase < 0.78) { name = "Kuartal Akhir"; icon = "🌗"; }
  else { name = "Sabit Akhir"; icon = "🌘"; }

  return { name, illumination, icon };
}

// ---------- Waktu Terbit & Terbenam Matahari ----------
// Formula sunrise equation standar (NOAA-style approximation).

export interface SunTimes {
  sunrise: Date | null; // null = matahari tidak terbit/terbenam hari itu (lintang ekstrem)
  sunset: Date | null;
}

export function getSunTimes(date: Date, lat: number, lng: number): SunTimes {
  const rad = Math.PI / 180;
  const dayOfYear = Math.floor(
    (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(date.getUTCFullYear(), 0, 0)) /
      86400000
  );

  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);

  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const latRad = lat * rad;
  const cosH =
    (Math.cos(90.833 * rad) - Math.sin(latRad) * Math.sin(decl)) /
    (Math.cos(latRad) * Math.cos(decl));

  if (cosH > 1 || cosH < -1) {
    return { sunrise: null, sunset: null }; // matahari tidak terbit/terbenam (lintang ekstrem)
  }

  const haDeg = Math.acos(cosH) / rad;

  const sunriseUTCMinutes = 720 - 4 * (lng + haDeg) - eqTime;
  const sunsetUTCMinutes = 720 - 4 * (lng - haDeg) - eqTime;

  const base = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return {
    sunrise: new Date(base + sunriseUTCMinutes * 60000),
    sunset: new Date(base + sunsetUTCMinutes * 60000),
  };
}

export function formatTime(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function formatGregorian(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}
