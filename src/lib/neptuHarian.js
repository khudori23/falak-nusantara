// Neptu hari (dina pitu) — tabel standar Primbon Jawa.
// SESUAIKAN kalau weton.js Anda sudah punya tabel ini — pakai punya weton.js saja untuk hindari dobel sumber angka.
const NEPTU_HARI = { minggu: 5, senin: 4, selasa: 3, rabu: 7, kamis: 8, jumat: 6, sabtu: 9 };
const NAMA_HARI = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];

const NEPTU_PASARAN = { legi: 5, pahing: 9, pon: 7, wage: 4, kliwon: 8 };
const NAMA_PASARAN = ['legi', 'pahing', 'pon', 'wage', 'kliwon'];
// Epoch pasaran: 1970-01-01 = Kamis Wage (index 3) — HARUS SAMA dengan epoch di weton.js Anda
// (sesuai catatan: bug epoch sebelumnya sudah diperbaiki jadi Kamis Wage, JANGAN diganti lagi).
const EPOCH_PASARAN_POS = 3;
const MS_PER_DAY = 86400000;

export function neptuHariDariTanggal(date) {
  const hari = NAMA_HARI[date.getDay()];
  return { hari, neptuHari: NEPTU_HARI[hari] };
}

export function pasaranDariTanggal(date) {
  const epoch = new Date(1970, 0, 1);
  const selisihHari = Math.floor((date.getTime() - epoch.getTime()) / MS_PER_DAY);
  let idx = ((selisihHari % 5) + EPOCH_PASARAN_POS) % 5;
  if (idx < 0) idx += 5;
  const pasaran = NAMA_PASARAN[idx];
  return { pasaran, neptuPasaran: NEPTU_PASARAN[pasaran] };
}

export function neptuTanggalKandidat(date) {
  const h = neptuHariDariTanggal(date);
  const p = pasaranDariTanggal(date);
  return {
    hari: h.hari,
    pasaran: p.pasaran,
    neptuHari: h.neptuHari,
    neptuPasaran: p.neptuPasaran,
    neptuTotal: h.neptuHari + p.neptuPasaran,
  };
}

// --- Konversi Hijriah TABULAR APPROXIMATE (±1 hari) ---
// TODO WAJIB: ganti dengan lib Hijriah asli project (roadmap "Jam & Tanggal" / "Kalender Hijriah")
// begitu file-nya ditunjukkan — jangan pakai ini untuk versi rilis, hanya placeholder MVP.
function gregorianToJD(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4)
    - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

export function tanggalHijriahApprox(date) {
  const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const islamicEpochJD = 1948440; // 1 Muharram 1 AH (tabular)
  const daysSinceEpoch = jd - islamicEpochJD;
  const cyclesOf30Years = Math.floor(daysSinceEpoch / 10631);
  let remainder = daysSinceEpoch % 10631;
  let tahun = cyclesOf30Years * 30 + 1;
  // iterasi tahun dalam siklus 30-tahun tabular (11 tahun kabisat)
  const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
  let yearInCycle = 1;
  while (yearInCycle <= 30) {
    const isLeap = leapYears.includes(yearInCycle);
    const daysInYear = isLeap ? 355 : 354;
    if (remainder < daysInYear) break;
    remainder -= daysInYear;
    tahun += 1;
    yearInCycle += 1;
  }
  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  let bulan = 1;
  for (let i = 0; i < 12; i++) {
    if (remainder < monthLengths[i]) break;
    remainder -= monthLengths[i];
    bulan += 1;
  }
  const tanggal = remainder + 1;
  const NAMA_BULAN = ['Muharram', 'Safar', "Rabi'ul Awal", "Rabi'ul Akhir", 'Jumadil Awal',
    'Jumadil Akhir', 'Rajab', "Sya'ban", 'Ramadhan', 'Syawal', "Dzulqa'dah", 'Dzulhijjah'];
  return { tahun, bulan, tanggal, namaBulan: NAMA_BULAN[bulan - 1] };
}
