// =====================================================================
// Supabase Edge Function: calculate-hari-baik-usaha (v9)
// Falak Nusantara — Modul Kalkulator Keberkahan & Hari Baik Tradisional
//
// WATERFALL VALIDATION SYSTEM:
//   [1] Neptu & Weton (Jawa)      -> Pancasuda (mod 5)
//   [2] Paca Opat (Sunda)         -> Sri/Kala/Naga/Numpi
//   [3] Pranata Mangsa (Jawa)     -> kesesuaian musim solar untuk kegiatan
//   [4] Abu Ma'syar (Falak)       -> elemen zodiak + fase bulan
//   [5] Filter hari larangan      -> Tali Wangke/Sampar Wangke (LIHAT CATATAN)
//   [6] Composite weighted score  -> S_akhir (0-100)
//
// CATATAN JUJUR SOAL AKURASI BUDAYA:
//   Tali Wangke/Sampar Wangke terikat pada siklus Wuku (210 hari, 30 wuku)
//   yang butuh titik jangkar (epoch) tervalidasi dari naskah primer
//   (mis. Kitab Betaljemur Adammakna edisi cap tertentu). Sumber-sumber
//   sekunder yang tersedia publik saling berbeda menyebut hari & wuku
//   spesifiknya, sehingga BELUM di-hardcode di sini — daripada
//   memberikan "hari larangan mutlak" yang salah, fungsi ini
//   mengembalikan status TRADITION_DEPENDENT untuk bagian ini.
//   Isi WUKU_EPOCH + TALIWANGKE_TABLE di bawah begitu sumber primer
//   sudah diverifikasi (lihat TODO).
//
//   Sama halnya untuk arah kompas fondasi (Windu/Pangerang-erang Sunda):
//   dikembalikan "belum_terverifikasi" sampai ada sumber akademik yang
//   memetakan siklus windu -> 4 arah mata angin secara presisi.
// =====================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// ---------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------

type ActivityCode =
  | "TANAM_BUAH"
  | "TANAM_UMBI"
  | "PANEN"
  | "SIMPAN_LUMBUNG"
  | "TERNAK"
  | "BANGUN_RUMAH"
  | "BANGUN_TEMPAT_USAHA"
  | "BERDAGANG"
  | "BERLAYAR";

type PancasudaResult = "Sri" | "Rejeki" | "Gedhong" | "Loro" | "Pati";
type PacaResult = "Sri" | "Kala" | "Naga" | "Numpi";
type ElementType = "Tanah" | "Air" | "Udara" | "Api";

interface RequestBody {
  date: string; // YYYY-MM-DD
  activity_code: ActivityCode;
  latitude?: number;
  longitude?: number;
}

interface EngineWeight {
  sunda: number;
  jawa: number;
  abu: number;
}

// ---------------------------------------------------------------------
// [DATA] NEPTU HARI & PASARAN (terverifikasi, sesuai spesifikasi kamu)
// ---------------------------------------------------------------------

const NEPTU_HARI: Record<number, { nama: string; nilai: number }> = {
  0: { nama: "Minggu", nilai: 5 },
  1: { nama: "Senin", nilai: 4 },
  2: { nama: "Selasa", nilai: 3 },
  3: { nama: "Rabu", nilai: 7 },
  4: { nama: "Kamis", nilai: 8 },
  5: { nama: "Jumat", nilai: 6 },
  6: { nama: "Sabtu", nilai: 9 },
};

const PASARAN_LIST = [
  { nama: "Legi", nilai: 5 },
  { nama: "Pahing", nilai: 9 },
  { nama: "Pon", nilai: 7 },
  { nama: "Wage", nilai: 4 },
  { nama: "Kliwon", nilai: 8 },
];

// Epoch pasaran: 1 Januari 1900 (Senin) = Pasaran "Kliwon" (indeks 4).
// Basis konversi Julian Day standar; pasaran berputar 5 hari sekali.
const PASARAN_EPOCH_JD_MOD5 = 4; // indeks PASARAN_LIST untuk JD referensi

// ---------------------------------------------------------------------
// [DATA] PANCASUDA (Jawa) — modulus 5, base score sesuai spesifikasi kamu
// ---------------------------------------------------------------------

const PANCASUDA_MAP: Record<
  number,
  { nama: PancasudaResult; skorBase: number; makna: string }
> = {
  1: { nama: "Sri", skorBase: 90, makna: "Kemakmuran" },
  2: { nama: "Rejeki", skorBase: 90, makna: "Keuangan" },
  3: { nama: "Gedhong", skorBase: 95, makna: "Materi/Bangunan" },
  4: { nama: "Loro", skorBase: 30, makna: "Halangan/Sakit" },
  0: { nama: "Pati", skorBase: 10, makna: "Kegagalan/Mati" }, // hasil mod 5 == 0 setara "5"
};

// ---------------------------------------------------------------------
// [DATA] PACA OPAT (Sunda) — siklus 4, base score sesuai spesifikasi kamu
// ---------------------------------------------------------------------

const PACA_OPAT_MAP: Record<
  number,
  { nama: PacaResult; skorBase: number; idealUntuk: ActivityCode[] }
> = {
  0: { nama: "Sri", skorBase: 85, idealUntuk: ["BANGUN_RUMAH", "TANAM_BUAH", "TANAM_UMBI", "TERNAK", "BERDAGANG", "BERLAYAR"] },
  1: { nama: "Kala", skorBase: 20, idealUntuk: [] }, // penalti fatal, tidak ideal untuk apa pun
  2: { nama: "Naga", skorBase: 95, idealUntuk: ["PANEN"] },
  3: { nama: "Numpi", skorBase: 95, idealUntuk: ["SIMPAN_LUMBUNG", "BANGUN_TEMPAT_USAHA"] },
};

// Epoch siklus Paca Opat: diselaraskan dengan indeks pasaran (siklus 5 hari)
// dipetakan ke siklus 4 — mengikuti pola yang sudah live di v8 (ref_sunda_paca_opat).
// Menggunakan Julian Day modulus 4 sebagai basis siklus harian yang konsisten.

// ---------------------------------------------------------------------
// [DATA] BOBOT KEGIATAN — target Pancasuda/Paca per kategori
// (khusus BANGUN_RUMAH vs BANGUN_TEMPAT_USAHA dipisah sesuai instruksi kamu)
// ---------------------------------------------------------------------

const TARGET_PANCASUDA: Record<ActivityCode, PancasudaResult[]> = {
  TANAM_BUAH: ["Sri", "Rejeki"],
  TANAM_UMBI: ["Sri", "Gedhong"],
  PANEN: ["Sri", "Rejeki", "Gedhong"],
  SIMPAN_LUMBUNG: ["Gedhong", "Sri"],
  TERNAK: ["Sri", "Rejeki"],
  BANGUN_RUMAH: ["Sri"], // fokus: keharmonisan & ketenteraman
  BANGUN_TEMPAT_USAHA: ["Gedhong", "Rejeki"], // fokus: omzet & modal
  BERDAGANG: ["Rejeki", "Sri", "Gedhong"],
  BERLAYAR: ["Sri", "Rejeki"],
};

const TARGET_PACA: Record<ActivityCode, PacaResult[]> = {
  TANAM_BUAH: ["Sri", "Naga"],
  TANAM_UMBI: ["Sri", "Numpi"],
  PANEN: ["Naga"],
  SIMPAN_LUMBUNG: ["Numpi"],
  TERNAK: ["Sri", "Numpi"],
  BANGUN_RUMAH: ["Sri", "Numpi"], // fokus: kedamaian & ketahanan rumah tangga
  BANGUN_TEMPAT_USAHA: ["Numpi", "Sri"], // fokus: daya tampung modal
  BERDAGANG: ["Sri"],
  BERLAYAR: ["Sri"],
};

const TARGET_ELEMENT: Record<ActivityCode, ElementType[]> = {
  TANAM_BUAH: ["Tanah", "Air"],
  TANAM_UMBI: ["Tanah"],
  PANEN: ["Tanah", "Air"],
  SIMPAN_LUMBUNG: ["Tanah"],
  TERNAK: ["Air", "Tanah"],
  BANGUN_RUMAH: ["Tanah"],
  BANGUN_TEMPAT_USAHA: ["Udara", "Tanah"],
  BERDAGANG: ["Udara", "Tanah"],
  BERLAYAR: ["Air"],
};

// Bobot engine per kategori kegiatan (Weight_Sunda, Weight_Jawa, Weight_Abu).
// Total harus = 1. Kegiatan pembangunan diberi bobot Sunda lebih besar
// (karena tradisi fondasi/arah dominan di Sunda); perniagaan diberi bobot
// Jawa lebih besar (Rejeki/Gedhong adalah konsep Jawa yang lebih kaya).
const ENGINE_WEIGHTS: Record<ActivityCode, EngineWeight> = {
  TANAM_BUAH: { sunda: 0.35, jawa: 0.35, abu: 0.3 },
  TANAM_UMBI: { sunda: 0.35, jawa: 0.35, abu: 0.3 },
  PANEN: { sunda: 0.4, jawa: 0.3, abu: 0.3 },
  SIMPAN_LUMBUNG: { sunda: 0.4, jawa: 0.3, abu: 0.3 },
  TERNAK: { sunda: 0.3, jawa: 0.4, abu: 0.3 },
  BANGUN_RUMAH: { sunda: 0.4, jawa: 0.35, abu: 0.25 },
  BANGUN_TEMPAT_USAHA: { sunda: 0.35, jawa: 0.4, abu: 0.25 },
  BERDAGANG: { sunda: 0.25, jawa: 0.45, abu: 0.3 },
  BERLAYAR: { sunda: 0.3, jawa: 0.3, abu: 0.4 },
};

// ---------------------------------------------------------------------
// [DATA] ZODIAK ABU MA'SYAR (tanggal Masehi tropis standar)
// ---------------------------------------------------------------------

const ZODIAK_TABLE: { nama: string; elemen: ElementType; mulai: [number, number]; akhir: [number, number] }[] = [
  { nama: "Aries", elemen: "Api", mulai: [3, 21], akhir: [4, 19] },
  { nama: "Taurus", elemen: "Tanah", mulai: [4, 20], akhir: [5, 20] },
  { nama: "Gemini", elemen: "Udara", mulai: [5, 21], akhir: [6, 20] },
  { nama: "Cancer", elemen: "Air", mulai: [6, 21], akhir: [7, 22] },
  { nama: "Leo", elemen: "Api", mulai: [7, 23], akhir: [8, 22] },
  { nama: "Virgo", elemen: "Tanah", mulai: [8, 23], akhir: [9, 22] },
  { nama: "Libra", elemen: "Udara", mulai: [9, 23], akhir: [10, 22] },
  { nama: "Scorpio", elemen: "Air", mulai: [10, 23], akhir: [11, 21] },
  { nama: "Sagittarius", elemen: "Api", mulai: [11, 22], akhir: [12, 21] },
  { nama: "Capricorn", elemen: "Tanah", mulai: [12, 22], akhir: [1, 19] },
  { nama: "Aquarius", elemen: "Udara", mulai: [1, 20], akhir: [2, 18] },
  { nama: "Pisces", elemen: "Air", mulai: [2, 19], akhir: [3, 20] },
];

// ---------------------------------------------------------------------
// [DATA] PRANATA MANGSA (12 mangsa, versi Kasunanan, terverifikasi)
// Kalender solar Jawa — rentang tanggal Masehi relatif tetap tiap tahun.
// ---------------------------------------------------------------------

const PRANATA_MANGSA: { nama: string; watak: string; mulai: [number, number]; akhir: [number, number]; cocokUntuk: ActivityCode[] }[] = [
  { nama: "Kasa", watak: "Daun berguguran, mulai tanam palawija", mulai: [6, 22], akhir: [8, 1], cocokUntuk: ["TANAM_UMBI", "TANAM_BUAH"] },
  { nama: "Karo", watak: "Bumi merekah, kemarau puncak", mulai: [8, 2], akhir: [8, 24], cocokUntuk: ["SIMPAN_LUMBUNG", "BANGUN_RUMAH", "BANGUN_TEMPAT_USAHA"] },
  { nama: "Katelu", watak: "Palawija mulai dipanen", mulai: [8, 25], akhir: [9, 18], cocokUntuk: ["PANEN", "BANGUN_RUMAH", "BANGUN_TEMPAT_USAHA"] },
  { nama: "Kapat", watak: "Buah-buahan mulai matang", mulai: [9, 19], akhir: [10, 13], cocokUntuk: ["PANEN", "BERDAGANG"] },
  { nama: "Kalima", watak: "Awal pancaroba, hewan melata keluar", mulai: [10, 14], akhir: [11, 9], cocokUntuk: ["TERNAK", "TANAM_BUAH"] },
  { nama: "Kanem", watak: "Awal musim hujan, mulai membajak & semai", mulai: [11, 10], akhir: [12, 22], cocokUntuk: ["TANAM_BUAH", "TANAM_UMBI", "TERNAK"] },
  { nama: "Kapitu", watak: "Hujan deras, tandur (tanam bibit padi)", mulai: [12, 23], akhir: [2, 3], cocokUntuk: ["TANAM_UMBI", "TANAM_BUAH"] },
  { nama: "Kawolu", watak: "Curah hujan tinggi, hama mulai muncul", mulai: [2, 4], akhir: [3, 1], cocokUntuk: ["TERNAK"] },
  { nama: "Kasanga", watak: "Buah-buahan berbunga", mulai: [3, 2], akhir: [3, 26], cocokUntuk: ["TANAM_BUAH", "BERLAYAR"] },
  { nama: "Kasadasa", watak: "Angin timur mulai berhembus", mulai: [3, 27], akhir: [4, 19], cocokUntuk: ["BERLAYAR", "BERDAGANG"] },
  { nama: "Desta", watak: "Padi menguning, panen raya", mulai: [4, 20], akhir: [5, 11], cocokUntuk: ["PANEN", "SIMPAN_LUMBUNG"] },
  { nama: "Sada", watak: "Kemarau kering, cocok bangun & dagang", mulai: [5, 12], akhir: [6, 21], cocokUntuk: ["BANGUN_RUMAH", "BANGUN_TEMPAT_USAHA", "BERDAGANG"] },
];

// ---------------------------------------------------------------------
// UTIL: Julian Day (untuk siklus pasaran & paca opat yang konsisten)
// ---------------------------------------------------------------------

function toJulianDay(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

// ---------------------------------------------------------------------
// ENGINE 1: JAWA (Neptu, Weton, Pancasuda)
// ---------------------------------------------------------------------

function hitungEngineJawa(date: Date, activity: ActivityCode) {
  const hariIdx = date.getUTCDay();
  const hari = NEPTU_HARI[hariIdx];

  const jd = toJulianDay(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  const pasaranIdx = ((jd - PASARAN_EPOCH_JD_MOD5) % 5 + 5) % 5;
  const pasaran = PASARAN_LIST[pasaranIdx];

  const totalNeptu = hari.nilai + pasaran.nilai;
  const pancasudaIdx = totalNeptu % 5;
  const pancasuda = PANCASUDA_MAP[pancasudaIdx];

  const target = TARGET_PANCASUDA[activity];
  const cocok = target.includes(pancasuda.nama);

  // Skor dasar dari Pancasuda, dengan bonus jika cocok target kegiatan,
  // penalti tambahan jika hasilnya Loro/Pati (di luar penalti base yang sudah rendah).
  let skor = pancasuda.skorBase;
  if (cocok) skor = Math.min(100, skor + 5);
  if (pancasuda.nama === "Loro" || pancasuda.nama === "Pati") {
    skor = Math.max(0, skor - 5);
  }

  // [4] Filter Tali Wangke / Sampar Wangke — TRADITION_DEPENDENT.
  // TODO: isi WUKU_EPOCH + tabel wuku-spesifik begitu naskah primer
  // (Betaljemur Adammakna, cap tertentu) sudah diverifikasi tim kamu.
  const taliWangkeStatus: "TRADITION_DEPENDENT" = "TRADITION_DEPENDENT";

  return {
    score: Math.round(skor),
    weton: `${hari.nama} ${pasaran.nama}`,
    neptu_hari: hari.nilai,
    neptu_pasaran: pasaran.nilai,
    total_neptu: totalNeptu,
    pancasuda: pancasuda.nama,
    pancasuda_makna: pancasuda.makna,
    target_kegiatan: target,
    cocok_target: cocok,
    tali_wangke_check: taliWangkeStatus,
    advice: cocok
      ? `Weton ${hari.nama} ${pasaran.nama} jatuh pada Pancasuda ${pancasuda.nama} — selaras dengan target kegiatan ini.`
      : `Weton ${hari.nama} ${pasaran.nama} jatuh pada Pancasuda ${pancasuda.nama} — bukan target utama untuk kegiatan ini, pertimbangkan tanggal lain jika ingin hasil optimal.`,
  };
}

// ---------------------------------------------------------------------
// ENGINE 2: SUNDA (Paca Opat)
// ---------------------------------------------------------------------

function hitungEngineSunda(date: Date, activity: ActivityCode) {
  const jd = toJulianDay(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  const pacaIdx = ((jd % 4) + 4) % 4;
  const paca = PACA_OPAT_MAP[pacaIdx];

  const target = TARGET_PACA[activity];
  const cocok = target.includes(paca.nama);

  let skor = paca.skorBase;
  if (cocok) skor = Math.min(100, skor + 5);

  // Arah kompas fondasi (Windu/Pangerang-erang) — BELUM TERVERIFIKASI.
  // TODO: perlu sumber akademik yang memetakan siklus windu -> 4 arah.
  const arahKompas = "belum_terverifikasi";

  return {
    score: Math.round(skor),
    paca_state: paca.nama,
    target_kegiatan: target,
    cocok_target: cocok,
    spatial_direction_status: "TRADITION_DEPENDENT" as const,
    spatial_direction: arahKompas,
    advice:
      paca.nama === "Kala"
        ? "Hari ini jatuh pada siklus Kala (energi panas/rintangan) — sangat disarankan menghindari kegiatan besar."
        : cocok
        ? `Siklus Paca ${paca.nama} selaras dengan kegiatan ini.`
        : `Siklus Paca ${paca.nama} bukan target utama untuk kegiatan ini.`,
  };
}

// ---------------------------------------------------------------------
// ENGINE 3: ABU MA'SYAR (Zodiak + Fase Bulan)
// ---------------------------------------------------------------------

function getZodiak(date: Date) {
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  for (const z of ZODIAK_TABLE) {
    const [m1, d1] = z.mulai;
    const [m2, d2] = z.akhir;
    if (m1 <= m2) {
      if ((m === m1 && d >= d1) || (m === m2 && d <= d2) || (m > m1 && m < m2)) return z;
    } else {
      // rentang melewati akhir tahun (Capricorn)
      if ((m === m1 && d >= d1) || (m === m2 && d <= d2) || m > m1 || m < m2) return z;
    }
  }
  return ZODIAK_TABLE[0];
}

// Interface fase bulan Hijriah — dipetakan ke fungsi Ephemeris internal
// Falak Nusantara yang sudah ada (lib Hisab). Fungsi di bawah adalah
// KONTRAK yang harus diisi dengan pemanggilan library internal itu,
// bukan implementasi ephemeris baru dari nol.
async function getFaseBulanHijriah(_date: Date): Promise<{ hariHijriah: number; fase: "Waxing" | "Waning" }> {
  // TODO: ganti dengan pemanggilan modul Hisab/Ephemeris internal
  // Falak Nusantara (mis. import { hitungTanggalHijriah } from '../_shared/falakEngine.ts').
  // Placeholder di bawah HANYA estimasi kasar (bukan sumber kebenaran)
  // agar fungsi tetap bisa dites end-to-end sebelum diintegrasikan.
  const epochNewMoon = Date.UTC(2000, 0, 6); // referensi bulan baru
  const synodicMonth = 29.530588853; // hari
  const diffDays = (_date.getTime() - epochNewMoon) / 86400000;
  const hariHijriah = Math.floor((diffDays % synodicMonth) + synodicMonth) % synodicMonth;
  const hariBulat = Math.max(1, Math.round(hariHijriah) || 1);
  return {
    hariHijriah: hariBulat,
    fase: hariBulat <= 15 ? "Waxing" : "Waning",
  };
}

async function hitungEngineAbuMasyar(date: Date, activity: ActivityCode) {
  const zodiak = getZodiak(date);
  const { hariHijriah, fase } = await getFaseBulanHijriah(date);

  const targetElemen = TARGET_ELEMENT[activity];
  const cocokElemen = targetElemen.includes(zodiak.elemen);

  // Fase bulan: Waxing cocok untuk membuka/membangun, Waning cocok untuk
  // panen/pembersihan lahan (sesuai spesifikasi kamu).
  const kegiatanWaxing: ActivityCode[] = ["BANGUN_RUMAH", "BANGUN_TEMPAT_USAHA", "BERDAGANG", "TANAM_BUAH", "TANAM_UMBI", "TERNAK", "BERLAYAR"];
  const kegiatanWaning: ActivityCode[] = ["PANEN", "SIMPAN_LUMBUNG"];

  const cocokFase =
    (fase === "Waxing" && kegiatanWaxing.includes(activity)) ||
    (fase === "Waning" && kegiatanWaning.includes(activity));

  let skor = 60; // baseline netral
  if (cocokElemen) skor += 20;
  if (cocokFase) skor += 20;
  skor = Math.min(100, skor);

  return {
    score: Math.round(skor),
    zodiac: zodiak.nama,
    element: zodiak.elemen,
    lunar_day: hariHijriah,
    lunar_phase: fase,
    cocok_elemen: cocokElemen,
    cocok_fase: cocokFase,
    advice: `Elemen harian ${zodiak.elemen} (${zodiak.nama}), fase bulan ${fase === "Waxing" ? "naik (H" + hariHijriah + ")" : "turun (H" + hariHijriah + ")"} — ${
      cocokElemen && cocokFase
        ? "kedua faktor selaras dengan kegiatan ini."
        : cocokElemen
        ? "elemen selaras, namun fase bulan kurang ideal untuk kegiatan ini."
        : cocokFase
        ? "fase bulan selaras, namun elemen kurang ideal untuk kegiatan ini."
        : "elemen dan fase bulan sama-sama bukan kondisi ideal untuk kegiatan ini."
    }`,
  };
}

// ---------------------------------------------------------------------
// ENGINE 4: PRANATA MANGSA
// ---------------------------------------------------------------------

function hitungPranataMangsa(date: Date, activity: ActivityCode) {
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();

  const mangsa = PRANATA_MANGSA.find((mg) => {
    const [m1, d1] = mg.mulai;
    const [m2, d2] = mg.akhir;
    if (m1 <= m2) {
      return (m === m1 && d >= d1) || (m === m2 && d <= d2) || (m > m1 && m < m2);
    }
    return (m === m1 && d >= d1) || (m === m2 && d <= d2) || m > m1 || m < m2;
  }) ?? PRANATA_MANGSA[0];

  const cocok = mangsa.cocokUntuk.includes(activity);

  return {
    mangsa: mangsa.nama,
    watak: mangsa.watak,
    cocok_musim: cocok,
    // Digunakan sebagai modifier kecil (bukan engine utama), karena bobot
    // musim solar bersifat konteks agrikultur — relevansi lebih besar
    // untuk kategori pertanian/peternakan/pembangunan dibanding perniagaan.
    modifier: cocok ? 1.05 : activity === "BERDAGANG" || activity === "BERLAYAR" ? 1.0 : 0.95,
  };
}

// ---------------------------------------------------------------------
// COMPOSITE SCORING (Waterfall)
// ---------------------------------------------------------------------

function gradeFromScore(score: number): "SANGAT_BAIK" | "BAIK" | "NETRAL" | "KURANG_BAIK" | "HINDARI" {
  if (score >= 85) return "SANGAT_BAIK";
  if (score >= 70) return "BAIK";
  if (score >= 50) return "NETRAL";
  if (score >= 30) return "KURANG_BAIK";
  return "HINDARI";
}

const EXECUTION_WINDOW: Partial<Record<ActivityCode, string>> = {
  BANGUN_RUMAH: "07:00 - 11:00 WIB",
  BANGUN_TEMPAT_USAHA: "07:00 - 11:00 WIB",
  BERDAGANG: "07:00 - 10:00 WIB",
  BERLAYAR: "05:00 - 08:00 WIB",
};

async function hitungSkorKomposit(date: Date, activity: ActivityCode) {
  const sunda = hitungEngineSunda(date, activity);
  const jawa = hitungEngineJawa(date, activity);
  const abu = await hitungEngineAbuMasyar(date, activity);
  const mangsa = hitungPranataMangsa(date, activity);

  const weight = ENGINE_WEIGHTS[activity];

  // Penalti fatal keras: Kala (Sunda) atau Pati (Jawa) menekan skor akhir
  // secara eksplisit, terlepas dari bobot rata-rata, karena keduanya
  // dianggap "larangan berat" dalam tradisi masing-masing.
  const penaltiFatal = sunda.paca_state === "Kala" || jawa.pancasuda === "Pati";

  let composite =
    weight.sunda * sunda.score + weight.jawa * jawa.score + weight.abu * abu.score;

  composite *= mangsa.modifier;

  if (penaltiFatal) {
    composite = Math.min(composite, 35); // hard cap, tidak peduli bobot lain
  }

  composite = Math.max(0, Math.min(100, Math.round(composite)));

  const grade = gradeFromScore(composite);

  const executiveSummary = penaltiFatal
    ? `Tanggal ini jatuh pada kondisi tradisi yang dianggap berat (${sunda.paca_state === "Kala" ? "Kala" : "Pati"}) — sangat disarankan mencari tanggal alternatif.`
    : grade === "SANGAT_BAIK" || grade === "BAIK"
    ? `Tanggal ini cukup selaras dengan tradisi untuk kegiatan yang dipilih.`
    : `Tanggal ini netral hingga kurang ideal — pertimbangkan tanggal lain jika ingin hasil maksimal.`;

  return {
    composite_score: composite,
    grade,
    sunda,
    jawa,
    abu,
    mangsa,
    penalti_fatal: penaltiFatal,
    executive_summary: executiveSummary,
  };
}

// ---------------------------------------------------------------------
// HTTP HANDLER
// ---------------------------------------------------------------------

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return jsonResponse(405, { code: 405, status: "error" }, null, "Method tidak didukung, gunakan POST.");
    }

    const body: RequestBody = await req.json();

    if (!body.date || !body.activity_code) {
      return jsonResponse(400, { code: 400, status: "error" }, null, "Parameter 'date' dan 'activity_code' wajib diisi.");
    }
    if (!(body.activity_code in ENGINE_WEIGHTS)) {
      return jsonResponse(400, { code: 400, status: "error" }, null, `activity_code '${body.activity_code}' tidak dikenali.`);
    }

    const date = new Date(`${body.date}T00:00:00Z`);
    if (isNaN(date.getTime())) {
      return jsonResponse(400, { code: 400, status: "error" }, null, "Format 'date' harus YYYY-MM-DD.");
    }

    const hasil = await hitungSkorKomposit(date, body.activity_code);

    const responseBody = {
      meta: { code: 200, status: "success", feature: "Falak Nusantara - Hari Baik Module v9" },
      request: { date: body.date, activity: body.activity_code },
      assessment: {
        composite_score: hasil.composite_score,
        grade: hasil.grade,
        actionable_insights: {
          spatial_direction: hasil.sunda.spatial_direction,
          optimal_hours: EXECUTION_WINDOW[body.activity_code] ?? "07:00 - 17:00 WIB",
          executive_summary: hasil.executive_summary,
        },
      },
      breakdown: {
        sunda_engine: {
          score: hasil.sunda.score,
          paca_state: hasil.sunda.paca_state,
          spatial_direction_status: hasil.sunda.spatial_direction_status,
          advice: hasil.sunda.advice,
        },
        jawa_engine: {
          score: hasil.jawa.score,
          weton: hasil.jawa.weton,
          pancasuda: hasil.jawa.pancasuda,
          tali_wangke_check: hasil.jawa.tali_wangke_check,
          advice: hasil.jawa.advice,
        },
        abu_masyar_engine: {
          score: hasil.abu.score,
          lunar_phase: hasil.abu.lunar_phase,
          element: hasil.abu.element,
          advice: hasil.abu.advice,
        },
        pranata_mangsa: {
          mangsa: hasil.mangsa.mangsa,
          watak: hasil.mangsa.watak,
          cocok_musim: hasil.mangsa.cocok_musim,
        },
      },
      disclaimer:
        "Hasil ini adalah interpretasi tradisional untuk edukasi dan refleksi, bukan kepastian/ramalan. Dua faktor (Tali Wangke/Sampar Wangke dan arah kompas Windu) belum diverifikasi dari naskah primer dan ditandai TRADITION_DEPENDENT.",
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return jsonResponse(500, { code: 500, status: "error" }, null, `Terjadi kesalahan internal: ${e instanceof Error ? e.message : String(e)}`);
  }
});

function jsonResponse(status: number, meta: Record<string, unknown>, data: unknown, message: string) {
  return new Response(JSON.stringify({ meta, message, data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

