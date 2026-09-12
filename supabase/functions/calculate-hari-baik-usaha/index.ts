// =====================================================================
// Supabase Edge Function: calculate-hari-baik-usaha (v12)
// Falak Nusantara — Kalkulator Keberkahan & Hari Baik Tradisional
//
// CHANGELOG v12:
// - IMPLEMENTASI NYATA integrasi cuaca (sebelumnya stub multiplier=1.0,
//   source="none"). getWeatherAssessment() memanggil OpenWeatherMap
//   5-day/3-hour forecast API pakai OPENWEATHER_API_KEY (Supabase secret).
// - Multiplier cuaca hanya diterapkan ke kegiatan fisik lapangan
//   (WEATHER_SENSITIVE_ACTIVITIES); kegiatan lain tetap dilaporkan
//   kondisinya untuk transparansi tapi skor tidak berubah.
// - Fallback berlapis, tidak pernah melempar error ke klien: tanpa
//   lat/lon -> NO_LOCATION, tanpa secret -> NO_API_KEY, di luar
//   jangkauan 5 hari -> OUT_OF_FORECAST_RANGE, gagal fetch ->
//   FETCH_ERROR/ERROR_FALLBACK.
// - responseBody menyertakan field `weather` terpisah untuk UI.
// - calculateLunarDay TETAP estimasi siklus sinodis (tidak diganti
//   ephemeris presisi) — supaya metode Abu Ma'syar tetap setia ke kitab
//   asli dan bisa diverifikasi manual oleh praktisi.
// =====================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type ActivityCode =
  | "BANGUN_RUMAH" | "BANGUN_TEMPAT_USAHA" | "BERDAGANG" | "BERLAYAR"
  | "TANAM_BUAH" | "TANAM_UMBI" | "PANEN" | "SIMPAN_LUMBUNG" | "TERNAK";

type KategoriUsaha = "PERTANIAN" | "PETERNAKAN" | "PEMBANGUNAN" | "PERNIAGAAN";
type DayName = "Minggu" | "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu";
type Pasaran = "Legi" | "Pahing" | "Pon" | "Wage" | "Kliwon";
type PancasudaName = "Sri" | "Rejeki" | "Gedhong" | "Loro" | "Pati";
type PacaName = "Sri" | "Kala" | "Naga" | "Numpi";
type LunarPhase = "WAXING_MOON" | "WANING_MOON";
type ElementName = "TANAH" | "AIR" | "UDARA" | "API";
type Grade = "SANGAT_BAIK" | "NETRAL" | "HINDARI";
type Direction = "UTARA" | "SELATAN" | "TIMUR" | "BARAT";

interface RequestBody { date: string; activity_code: ActivityCode; latitude?: number; longitude?: number; }
interface WeatherAssessment { multiplier: number; condition: string; source: string; }
interface OwmForecastItem { dt: number; dt_txt: string; weather: { id: number; main: string; description: string }[]; }
interface OwmForecastResponse { list: OwmForecastItem[]; }

const VALID_ACTIVITIES: ActivityCode[] = [
  "BANGUN_RUMAH", "BANGUN_TEMPAT_USAHA", "BERDAGANG", "BERLAYAR",
  "TANAM_BUAH", "TANAM_UMBI", "PANEN", "SIMPAN_LUMBUNG", "TERNAK",
];

const ACTIVITY_KATEGORI: Record<ActivityCode, KategoriUsaha> = {
  BANGUN_RUMAH: "PEMBANGUNAN", BANGUN_TEMPAT_USAHA: "PEMBANGUNAN",
  BERDAGANG: "PERNIAGAAN", BERLAYAR: "PERNIAGAAN",
  TANAM_BUAH: "PERTANIAN", TANAM_UMBI: "PERTANIAN", PANEN: "PERTANIAN", SIMPAN_LUMBUNG: "PERTANIAN",
  TERNAK: "PETERNAKAN",
};

const WEATHER_SENSITIVE_ACTIVITIES: Record<ActivityCode, boolean> = {
  BANGUN_RUMAH: true, BANGUN_TEMPAT_USAHA: true, BERDAGANG: false, BERLAYAR: true,
  TANAM_BUAH: true, TANAM_UMBI: true, PANEN: true, SIMPAN_LUMBUNG: false, TERNAK: true,
};

const NEPTU_HARI: Record<number, { nama: DayName; nilai: number }> = {
  0: { nama: "Minggu", nilai: 5 }, 1: { nama: "Senin", nilai: 4 }, 2: { nama: "Selasa", nilai: 3 },
  3: { nama: "Rabu", nilai: 7 }, 4: { nama: "Kamis", nilai: 8 }, 5: { nama: "Jumat", nilai: 6 }, 6: { nama: "Sabtu", nilai: 9 },
};

const PASARAN_LIST: { nama: Pasaran; nilai: number }[] = [
  { nama: "Legi", nilai: 5 }, { nama: "Pahing", nilai: 9 }, { nama: "Pon", nilai: 7 },
  { nama: "Wage", nilai: 4 }, { nama: "Kliwon", nilai: 8 },
];
const WAGE_INDEX = 3;

const PANCASUDA: Record<number, { nama: PancasudaName; skor: number }> = {
  1: { nama: "Sri", skor: 90 }, 2: { nama: "Rejeki", skor: 90 }, 3: { nama: "Gedhong", skor: 95 },
  4: { nama: "Loro", skor: 30 }, 5: { nama: "Pati", skor: 10 },
};

const TALI_WANGKE_PAIRS: { hari: DayName; pasaran: Pasaran }[] = [
  { hari: "Senin", pasaran: "Kliwon" }, { hari: "Selasa", pasaran: "Legi" }, { hari: "Rabu", pasaran: "Pahing" },
  { hari: "Kamis", pasaran: "Pon" }, { hari: "Jumat", pasaran: "Wage" }, { hari: "Sabtu", pasaran: "Kliwon" },
  { hari: "Minggu", pasaran: "Wage" },
];

const PACA_OPAT: Record<number, { nama: PacaName; skor: number }> = {
  0: { nama: "Sri", skor: 85 }, 1: { nama: "Kala", skor: 20 }, 2: { nama: "Naga", skor: 95 }, 3: { nama: "Numpi", skor: 95 },
};

const PACA_COMPATIBLE_ACTIVITIES: Record<PacaName, ActivityCode[]> = {
  Sri: ["BANGUN_RUMAH"], Kala: [], Naga: ["PANEN"], Numpi: ["BANGUN_TEMPAT_USAHA", "SIMPAN_LUMBUNG"],
};
const PACA_COMPAT_BONUS = 10;

const ACTIVITY_ELEMENT_RULES: Record<ActivityCode, ElementName[]> = {
  BANGUN_RUMAH: ["TANAH"], BANGUN_TEMPAT_USAHA: ["UDARA", "TANAH"], BERDAGANG: ["UDARA", "TANAH"],
  BERLAYAR: ["AIR"], TERNAK: ["AIR"], PANEN: ["TANAH"], TANAM_UMBI: ["TANAH"], TANAM_BUAH: ["TANAH"], SIMPAN_LUMBUNG: ["TANAH"],
};
const ELEMENT_BONUS = 25;

interface EngineWeight { sunda: number; jawa: number; abu: number }
const ACTIVITY_WEIGHTS: Record<ActivityCode, EngineWeight> = {
  BANGUN_RUMAH: { sunda: 0.35, jawa: 0.40, abu: 0.25 },
  BANGUN_TEMPAT_USAHA: { sunda: 0.35, jawa: 0.40, abu: 0.25 },
  BERDAGANG: { sunda: 0.30, jawa: 0.40, abu: 0.30 },
  BERLAYAR: { sunda: 0.35, jawa: 0.30, abu: 0.35 },
  TANAM_BUAH: { sunda: 0.33, jawa: 0.33, abu: 0.34 },
  TANAM_UMBI: { sunda: 0.33, jawa: 0.33, abu: 0.34 },
  PANEN: { sunda: 0.33, jawa: 0.33, abu: 0.34 },
  SIMPAN_LUMBUNG: { sunda: 0.33, jawa: 0.33, abu: 0.34 },
  TERNAK: { sunda: 0.33, jawa: 0.33, abu: 0.34 },
};

const SYNODIC_MONTH = 29.53;
const NEW_MOON_EPOCH_UTC = Date.UTC(2000, 0, 6);
const ELEMENT_CYCLE: ElementName[] = ["TANAH", "AIR", "UDARA", "API"];

function positiveModulo(value: number, modulo: number): number { return ((value % modulo) + modulo) % modulo; }

function parseISODateOnly(dateString: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!m) return null;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return dt;
}

function daysSinceEpoch(date: Date): number { const epoch = Date.UTC(1970, 0, 1); return Math.floor((date.getTime() - epoch) / 86400000); }
function clamp(v: number, min: number, max: number): number { return Math.max(min, Math.min(max, v)); }

function getWeton(date: Date) {
  const dse = daysSinceEpoch(date);
  const dayIndex = date.getUTCDay();
  const pasaranIndex = positiveModulo(dse + WAGE_INDEX, 5);
  const hari = NEPTU_HARI[dayIndex];
  const pasaran = PASARAN_LIST[pasaranIndex];
  return { dse, dayIndex, pasaranIndex, hari, pasaran };
}

function calculateJawaScore(weton: ReturnType<typeof getWeton>) {
  const totalNeptu = weton.hari.nilai + weton.pasaran.nilai;
  let idx = totalNeptu % 5;
  if (idx === 0) idx = 5;
  const pancasuda = PANCASUDA[idx];
  const isTaliWangke = TALI_WANGKE_PAIRS.some((p) => p.hari === weton.hari.nama && p.pasaran === weton.pasaran.nama);
  let score = pancasuda.skor;
  if (isTaliWangke) score = score * 0.5;
  score = clamp(Math.round(score), 0, 100);
  return { score, weton: `${weton.hari.nama} ${weton.pasaran.nama}`, neptu: totalNeptu, pancasuda: pancasuda.nama, is_tali_wangke: isTaliWangke };
}

function calculateSundaScore(weton: ReturnType<typeof getWeton>, activity: ActivityCode) {
  const pacaIndex = positiveModulo(weton.dse, 4);
  const paca = PACA_OPAT[pacaIndex];
  const compatible = PACA_COMPATIBLE_ACTIVITIES[paca.nama].includes(activity);
  let score = paca.skor;
  if (compatible) score += PACA_COMPAT_BONUS;
  score = clamp(Math.round(score), 0, 100);
  const status = paca.nama === "Kala" ? "Kurang Baik" : compatible ? "Sangat Baik" : "Netral";
  return { score, paca: paca.nama, status, pacaIndex };
}

const PANCASUDA_MEANING: Record<PancasudaName, string> = {
  Sri: "pertanda kemakmuran dan rezeki yang lancar",
  Rejeki: "pertanda kemudahan rezeki dan hasil usaha yang berlimpah",
  Gedhong: "pertanda kemapanan dan cocok untuk membangun atau menyimpan harta",
  Loro: "pertanda rawan gangguan atau kesulitan, kurang ideal untuk memulai sesuatu",
  Pati: "pertanda berat, dianggap pantangan besar dalam tradisi Jawa",
};

const PACA_MEANING: Record<PacaName, string> = {
  Sri: "pertanda kemakmuran dan keberuntungan",
  Kala: "pertanda bahaya atau rintangan besar, sangat dihindari untuk memulai kegiatan",
  Naga: "pertanda kekuatan dan kesuburan, cocok untuk kegiatan memanen atau menuai hasil",
  Numpi: "pertanda ketenangan dan kekokohan, cocok untuk membangun atau menyimpan",
};

const ELEMENT_MEANING: Record<ElementName, string> = {
  TANAH: "melambangkan kestabilan, kesuburan, dan ketekunan — baik untuk pertanian dan pembangunan",
  AIR: "melambangkan kelenturan dan keharmonisan — baik untuk pelayaran dan peternakan",
  UDARA: "melambangkan komunikasi dan mobilitas — baik untuk perniagaan",
  API: "melambangkan semangat dan energi kuat, namun cenderung labil",
};

const ACTIVITY_LABEL: Record<ActivityCode, string> = {
  BANGUN_RUMAH: "membangun rumah", BANGUN_TEMPAT_USAHA: "membangun tempat usaha",
  BERDAGANG: "berdagang", BERLAYAR: "berlayar",
  TANAM_BUAH: "menanam buah-buahan", TANAM_UMBI: "menanam umbi-umbian",
  PANEN: "memanen", SIMPAN_LUMBUNG: "menyimpan hasil panen di lumbung",
  TERNAK: "memulai usaha ternak",
};

const GRADE_LABEL: Record<Grade, string> = {
  SANGAT_BAIK: "sangat baik", NETRAL: "netral", HINDARI: "sebaiknya dihindari",
};

function getSpatialDirection(weton: ReturnType<typeof getWeton>, pacaIndex: number): Direction {
  const directions: Direction[] = ["UTARA", "TIMUR", "SELATAN", "BARAT"];
  const directionIndex = positiveModulo(weton.pasaranIndex + weton.dayIndex + pacaIndex, 4);
  return directions[directionIndex];
}

function calculateLunarDay(date: Date): { lunarDay: number; phase: LunarPhase } {
  const diffDays = (date.getTime() - NEW_MOON_EPOCH_UTC) / 86400000;
  const cyclePos = positiveModulo(diffDays, SYNODIC_MONTH);
  let lunarDay = Math.round(cyclePos) + 1;
  lunarDay = clamp(lunarDay, 1, 30);
  const phase: LunarPhase = lunarDay <= 15 ? "WAXING_MOON" : "WANING_MOON";
  return { lunarDay, phase };
}

function calculateDailyElement(dse: number): ElementName { return ELEMENT_CYCLE[positiveModulo(dse, 4)]; }

function calculateAbuMasyarScore(weton: ReturnType<typeof getWeton>, activity: ActivityCode, date: Date) {
  const { lunarDay, phase } = calculateLunarDay(date);
  const element = calculateDailyElement(weton.dse);
  const required = ACTIVITY_ELEMENT_RULES[activity];
  const elementMatch = required.includes(element);
  let score = 55;
  if (elementMatch) score += ELEMENT_BONUS;
  score = clamp(Math.round(score), 0, 100);
  return { score, lunar_day: lunarDay, lunar_phase: phase, element, element_match: elementMatch };
}

function weatherMultiplierForConditionId(id: number): { multiplier: number; label: string } {
  if (id >= 200 && id <= 232) return { multiplier: 0.80, label: "Badai petir" };
  if (id >= 300 && id <= 321) return { multiplier: 0.95, label: "Gerimis" };
  if (id >= 500 && id <= 504) return { multiplier: 0.92, label: "Hujan" };
  if (id === 511) return { multiplier: 0.90, label: "Hujan es" };
  if (id >= 520 && id <= 531) return { multiplier: 0.85, label: "Hujan lebat" };
  if (id >= 600 && id <= 622) return { multiplier: 0.90, label: "Salju" };
  if (id >= 701 && id <= 781) return { multiplier: 0.97, label: "Kabut/berkabut" };
  if (id === 800) return { multiplier: 1.05, label: "Cerah" };
  if (id === 801 || id === 802) return { multiplier: 1.02, label: "Berawan sebagian" };
  if (id === 803 || id === 804) return { multiplier: 1.00, label: "Mendung" };
  return { multiplier: 1.00, label: "Kondisi cuaca tidak dikenali" };
}

async function getWeatherAssessment(lat: number | undefined, lon: number | undefined, dateStr: string, activity: ActivityCode): Promise<WeatherAssessment> {
  if (lat === undefined || lon === undefined) return { multiplier: 1.0, condition: "Lokasi tidak diberikan", source: "NO_LOCATION" };
  const apiKey = Deno.env.get("OPENWEATHER_API_KEY");
  if (!apiKey) return { multiplier: 1.0, condition: "API key cuaca belum dikonfigurasi", source: "NO_API_KEY" };
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) { console.error("OpenWeatherMap fetch non-OK status:", res.status); return { multiplier: 1.0, condition: "Gagal mengambil data cuaca", source: "FETCH_ERROR" }; }
    const data = (await res.json()) as OwmForecastResponse;
    const matching = (data.list ?? []).filter((item) => item.dt_txt?.startsWith(dateStr));
    if (matching.length === 0) return { multiplier: 1.0, condition: "Tanggal di luar jangkauan prakiraan cuaca (maks. 5 hari)", source: "OUT_OF_FORECAST_RANGE" };
    let best = matching[0];
    let bestDiff = Infinity;
    for (const item of matching) {
      const hour = Number(item.dt_txt.slice(11, 13));
      const diff = Math.abs(hour - 9);
      if (diff < bestDiff) { bestDiff = diff; best = item; }
    }
    const weatherId = best.weather?.[0]?.id ?? 800;
    const { multiplier, label } = weatherMultiplierForConditionId(weatherId);
    if (!WEATHER_SENSITIVE_ACTIVITIES[activity]) {
      return { multiplier: 1.0, condition: `${label} (tidak memengaruhi skor kegiatan ini)`, source: "OPENWEATHERMAP_NOT_APPLIED" };
    }
    return { multiplier, condition: label, source: "OPENWEATHERMAP" };
  } catch (e) {
    console.error("getWeatherAssessment failed:", e);
    return { multiplier: 1.0, condition: "Kesalahan saat mengambil data cuaca", source: "ERROR_FALLBACK" };
  }
}

function getGrade(score: number): Grade { if (score >= 80) return "SANGAT_BAIK"; if (score >= 60) return "NETRAL"; return "HINDARI"; }
function getRecommendedTime(grade: Grade): string {
  if (grade === "SANGAT_BAIK") return "Pagi (06:00–10:00)";
  if (grade === "NETRAL") return "Pagi–siang (07:00–12:00)";
  return "Pertimbangkan penjadwalan ulang";
}

function generateExecutiveSummary(
  activity: ActivityCode, grade: Grade,
  jawa: ReturnType<typeof calculateJawaScore>, sunda: ReturnType<typeof calculateSundaScore>,
  abu: ReturnType<typeof calculateAbuMasyarScore>, direction: Direction, weather: WeatherAssessment,
): string {
  const parts: string[] = [];
  const activityLabel = ACTIVITY_LABEL[activity];
  const gradeLabel = GRADE_LABEL[grade];
  const elementLabel = abu.element.toLowerCase();

  const faktor = [
    { nama: "adat Jawa", skor: jawa.score, selaras: !jawa.is_tali_wangke && (jawa.pancasuda === "Sri" || jawa.pancasuda === "Rejeki" || jawa.pancasuda === "Gedhong") },
    { nama: "adat Sunda", skor: sunda.score, selaras: sunda.status === "Sangat Baik" },
    { nama: "kitab Abu Ma'syar", skor: abu.element_match ? 80 : 40, selaras: abu.element_match },
  ];
  const dominan = faktor.reduce((a, b) => (b.skor > a.skor ? b : a));
  const lemah = faktor.filter((f) => !f.selaras);

  // Penjelasan per-tradisi: sebut istilah, lalu jelaskan artinya.
  parts.push(`Menurut adat Jawa, weton ${jawa.weton} jatuh pada Pancasuda ${jawa.pancasuda} — ${PANCASUDA_MEANING[jawa.pancasuda]}${jawa.is_tali_wangke ? ", namun hari ini termasuk hari larangan Tali/Sampar Wangke sehingga skor dipotong 50%" : ""}.`);
  parts.push(`Untuk adat Sunda, tanggal ini jatuh pada siklus Paca ${sunda.paca} — ${PACA_MEANING[sunda.paca]}.`);
  parts.push(`Sedangkan menurut kitab Abu Ma'syar, elemen harian pada tanggal ini adalah ${elementLabel} (${ELEMENT_MEANING[abu.element]}), pada fase bulan ${abu.lunar_phase === "WAXING_MOON" ? "naik" : "turun"} (hari ke-${abu.lunar_day}), yang ${abu.element_match ? "selaras" : "kurang selaras"} dengan kebutuhan elemen untuk kegiatan ${activityLabel}.`);

  if (weather.source === "OPENWEATHERMAP" && weather.multiplier !== 1.0) {
    const arahCuaca = weather.multiplier < 1.0 ? "menurunkan" : "menaikkan";
    parts.push(`Prakiraan cuaca (${weather.condition}) turut sedikit ${arahCuaca} skor akhir.`);
  }

  // Kesimpulan akhir — tegas, menyebut alasan.
  if (grade === "HINDARI") {
    if (jawa.is_tali_wangke) {
      parts.push(`Jadi, kesimpulannya: untuk kegiatan ${activityLabel}, tanggal ini TIDAK disarankan karena jatuh pada hari larangan Tali/Sampar Wangke menurut adat Jawa. Disarankan mencari tanggal alternatif.`);
    } else {
      parts.push(`Jadi, kesimpulannya: untuk kegiatan ${activityLabel}, tanggal ini TIDAK disarankan (${gradeLabel}) karena mayoritas tradisi tidak menunjukkan hasil yang mendukung. Disarankan mencari tanggal alternatif.`);
    }
  } else if (grade === "SANGAT_BAIK") {
    let kesimpulan = `Jadi, kesimpulannya: untuk kegiatan ${activityLabel}, tanggal ini tergolong ${gradeLabel}. Faktor paling menentukan adalah ${dominan.nama}, yang hasilnya selaras dengan kegiatan ini.`;
    if (lemah.length > 0) {
      kesimpulan += ` Meski ${lemah.map((f) => f.nama).join(" dan ")} menunjukkan hasil yang kurang ideal, pengaruhnya lebih kecil sehingga tidak mengubah kesimpulan akhir.`;
    }
    parts.push(kesimpulan);
  } else {
    parts.push(`Jadi, kesimpulannya: untuk kegiatan ${activityLabel}, tanggal ini tergolong ${gradeLabel} — tidak ada larangan tegas, namun juga tidak ada tradisi yang benar-benar mendukung secara kuat. Boleh dilaksanakan jika tidak ada pilihan tanggal lain, namun hasil optimal tidak dijamin.`);
  }

  return parts.join(" ");
}

function validateRequest(body: unknown): { ok: true; data: RequestBody } | { ok: false; fields: string[]; message: string } {
  if (typeof body !== "object" || body === null) return { ok: false, fields: [], message: "Body harus berupa JSON object." };
  const b = body as Record<string, unknown>;
  const fields: string[] = [];
  if (typeof b.date !== "string" || !b.date) fields.push("date");
  if (typeof b.activity_code !== "string" || !VALID_ACTIVITIES.includes(b.activity_code as ActivityCode)) fields.push("activity_code");
  if (b.latitude !== undefined) { const lat = b.latitude; if (typeof lat !== "number" || !Number.isFinite(lat) || lat < -90 || lat > 90) fields.push("latitude"); }
  if (b.longitude !== undefined) { const lon = b.longitude; if (typeof lon !== "number" || !Number.isFinite(lon) || lon < -180 || lon > 180) fields.push("longitude"); }
  if (fields.length > 0) return { ok: false, fields, message: `Field tidak valid: ${fields.join(", ")}` };
  if (typeof b.date === "string" && parseISODateOnly(b.date) === null) return { ok: false, fields: ["date"], message: "Format 'date' harus YYYY-MM-DD dan merupakan tanggal kalender valid." };
  return { ok: true, data: { date: b.date as string, activity_code: b.activity_code as ActivityCode, latitude: b.latitude as number | undefined, longitude: b.longitude as number | undefined } };
}

function getUserIdFromAuthHeader(authHeader: string | null): string | null {
  try {
    if (!authHeader) return null;
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch { return null; }
}

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

async function logCalculation(params: {
  userId: string | null; activity: ActivityCode; dateStr: string; latitude?: number; longitude?: number;
  compositeScore: number; grade: Grade; jawa: ReturnType<typeof calculateJawaScore>; sunda: ReturnType<typeof calculateSundaScore>;
  abu: ReturnType<typeof calculateAbuMasyarScore>; weather: WeatherAssessment; responseBody: unknown;
}) {
  const { error } = await supabaseAdmin.from("calculation_logs").insert({
    user_id: params.userId, kategori: ACTIVITY_KATEGORI[params.activity], kegiatan: params.activity, metode: "GABUNGAN",
    target_date: params.dateStr, location_lat: params.latitude ?? null, location_long: params.longitude ?? null,
    composite_score: params.compositeScore, grade: params.grade, sunda_score: params.sunda.score,
    sunda_detail: { paca: params.sunda.paca, status: params.sunda.status, paca_index: params.sunda.pacaIndex },
    jawa_score: params.jawa.score,
    jawa_detail: { weton: params.jawa.weton, neptu: params.jawa.neptu, pancasuda: params.jawa.pancasuda, is_tali_wangke: params.jawa.is_tali_wangke },
    abu_masyar_score: params.abu.score,
    abu_masyar_detail: { lunar_day: params.abu.lunar_day, lunar_phase: params.abu.lunar_phase, element: params.abu.element, element_match: params.abu.element_match },
    weather_multiplier: params.weather.multiplier,
    weather_detail: { condition: params.weather.condition, source: params.weather.source },
    raw_response: params.responseBody,
  });
  if (error) console.error("calculation_logs insert failed:", error.message);
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json",
};

function jsonError(code: number, type: string, message: string, fields: string[] = []) {
  return new Response(JSON.stringify({ meta: { code, status: "error", engine: "Falak Nusantara Multi-Engine Scoring v2.0" }, error: { type, message, fields } }), { status: code, headers: CORS_HEADERS });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonError(405, "METHOD_NOT_ALLOWED", "Gunakan POST.");
  let rawBody: unknown;
  try { rawBody = await req.json(); } catch { return jsonError(400, "VALIDATION_ERROR", "Body harus JSON valid."); }
  const validated = validateRequest(rawBody);
  if (!validated.ok) return jsonError(400, "VALIDATION_ERROR", validated.message, validated.fields);
  try {
    const { date: dateStr, activity_code: activity, latitude, longitude } = validated.data;
    const date = parseISODateOnly(dateStr)!;
    const weton = getWeton(date);
    const jawa = calculateJawaScore(weton);
    const sunda = calculateSundaScore(weton, activity);
    const abu = calculateAbuMasyarScore(weton, activity, date);
    const direction = getSpatialDirection(weton, sunda.pacaIndex);
    const weather = await getWeatherAssessment(latitude, longitude, dateStr, activity);
    const weight = ACTIVITY_WEIGHTS[activity];
    const rawScore = sunda.score * weight.sunda + jawa.score * weight.jawa + abu.score * weight.abu;
    const compositeScore = clamp(Math.round(rawScore * weather.multiplier), 0, 100);
    const grade = getGrade(compositeScore);
    const responseBody = {
      meta: { code: 200, status: "success", engine: "Falak Nusantara Multi-Engine Scoring v2.0" },
      data: { date: dateStr, activity: activity, composite_score: compositeScore, grade },
      spatial_advice: { starting_direction: direction, recommended_time: getRecommendedTime(grade) },
      breakdown: {
        jawa: { score: jawa.score, weton: jawa.weton, neptu: jawa.neptu, pancasuda: jawa.pancasuda, is_tali_wangke: jawa.is_tali_wangke },
        sunda: { score: sunda.score, paca: sunda.paca, status: sunda.status },
        abu_masyar: { score: abu.score, lunar_day: abu.lunar_day, lunar_phase: abu.lunar_phase, element: abu.element },
      },
      weather: { applied: weather.source === "OPENWEATHERMAP", multiplier: weather.multiplier, condition: weather.condition, source: weather.source },
      calculation_audit: { days_since_epoch: weton.dse, pasaran_index: weton.pasaranIndex, paca_index: sunda.pacaIndex, raw_score: Math.round(rawScore * 100) / 100, weather_multiplier: weather.multiplier, algorithm_version: "2.0.0" },
      executive_summary: generateExecutiveSummary(activity, grade, jawa, sunda, abu, direction, weather),
    };
    const userId = getUserIdFromAuthHeader(req.headers.get("Authorization"));
    try {
      await logCalculation({ userId, activity, dateStr, latitude, longitude, compositeScore, grade, jawa, sunda, abu, weather, responseBody });
    } catch (logErr) { console.error("logCalculation threw:", logErr); }
    return new Response(JSON.stringify(responseBody), { status: 200, headers: CORS_HEADERS });
  } catch (e) {
    console.error(e);
    return jsonError(500, "INTERNAL_ERROR", e instanceof Error ? e.message : String(e));
  }
});
// trigger deploy 1789204417
// retry 1789204878
// retry 1789204891
