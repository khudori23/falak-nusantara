/**
 * javaneseCalendar.js
 * Tabel & util dasar untuk engine Kecocokan Pasangan (Jawa / Sunda / Abu Ma'syar).
 *
 * PENTING:
 * - Kalau di repo sudah ada util hari+pasaran dari fitur "Hitungan Hari"
 *   (mis. di src/lib/hitunganHari.js atau src/lib/astronomy.js), PAKAI ITU,
 *   jangan dobel. Fungsi getHariPasaran() di sini cuma fallback kalau belum ada,
 *   supaya engine Jawa Weton di file ini tetap bisa jalan sendiri.
 * - Semua tabel di bawah diambil langsung dari hasil riset (neptu, naktu,
 *   pola siklus 8, interpretasi Raml mod 9). Yang TIDAK ada di sini (konversi
 *   nama -> aksara Cacarakan, konversi nama -> nilai abjad Arab) SENGAJA
 *   tidak dibuat karena riset belum kasih algoritma pastinya — jangan
 *   ditambahkan sendiri sebelum ada sumber, sesuai aturan Rule Registry proyek.
 */

// ---------------------------------------------------------------------------
// 1. NEPTU JAWA (sumber: riset §1)
// ---------------------------------------------------------------------------
export const NEPTU_HARI = {
  Minggu: 5,
  Senin: 4,
  Selasa: 3,
  Rabu: 7,
  Kamis: 8,
  Jumat: 6,
  Sabtu: 9,
};

export const NEPTU_PASARAN = {
  Legi: 5,
  Pahing: 9,
  Pon: 7,
  Wage: 4,
  Kliwon: 8,
};

// ---------------------------------------------------------------------------
// 2. NAKTU SUNDA (sumber: riset §8; nilai bulan "Jumadil Akhir" belum ada di
//    dokumen sumber, sengaja dibiarkan null sampai diverifikasi)
// ---------------------------------------------------------------------------
export const NAKTU_HARI = {
  Ahad: 5,
  Senin: 4,
  Selasa: 3,
  Rabu: 7,
  Kamis: 8,
  Jumat: 6,
  Sabtu: 9,
};

export const NAKTU_PASARAN = {
  Kaliwon: 8,
  Manis: 5,
  Pahing: 9,
  Pon: 7,
  Wage: 4,
};

export const NAKTU_BULAN = {
  Muharam: 7,
  Mulud: 3,
  'Silih Mulud': 5,
  'Jumadil Awal': 6,
  'Jumadil Akhir': null, // TODO: belum ada di sumber, jangan ditebak
  Rajab: 2,
  Rewah: 4,
  Puasa: 5,
  Sawal: 7,
  Hapit: 1,
  Rayagung: 3,
};

export const NAKTU_TAHUN = {
  Alip: 1,
  Ehe: 5,
  Jimawal: 3,
  Je: 7,
  Dal: 4,
  Be: 2,
  Wawu: 4,
  Jimakir: 3,
};

// ---------------------------------------------------------------------------
// 3. SIKLUS 8 JAWA — Pegat/Ratu/Jodoh/Topo/Tinari/Padu/Sujanan/Pesthi
//    (sumber: riset §3, tabel sisa 1-8)
// ---------------------------------------------------------------------------
export const SIKLUS_8 = [
  { sisa: 1, symbol: 'Pegat', interpretation: 'Secara simbolik dikaitkan dengan potensi keretakan/perpisahan.' },
  { sisa: 2, symbol: 'Ratu', interpretation: 'Secara simbolik dikaitkan dengan keharmonisan dan kewibawaan.' },
  { sisa: 3, symbol: 'Jodoh', interpretation: 'Secara simbolik dikaitkan dengan keserasian pasangan.' },
  { sisa: 4, symbol: 'Topo', interpretation: 'Secara simbolik dikaitkan dengan perjuangan/kesulitan di awal.' },
  { sisa: 5, symbol: 'Tinari', interpretation: 'Secara simbolik dikaitkan dengan keberuntungan.' },
  { sisa: 6, symbol: 'Padu', interpretation: 'Secara simbolik dikaitkan dengan potensi pertengkaran.' },
  { sisa: 7, symbol: 'Sujanan', interpretation: 'Secara simbolik dikaitkan dengan kecemburuan/ketidaksetiaan.' },
  { sisa: 8, symbol: 'Pesthi', interpretation: 'Secara simbolik dikaitkan dengan ketenteraman dan kelanggengan.' },
];

/** total neptu -> hasil siklus 8 (mod 8, sisa 0 dibaca sebagai 8) */
export function hitungSiklus8(totalNeptu) {
  const sisa = totalNeptu % 8 === 0 ? 8 : totalNeptu % 8;
  return SIKLUS_8.find((s) => s.sisa === sisa);
}

// ---------------------------------------------------------------------------
// 4. ABU MA'SYAR — Fasal Menghitung Jodoh (mod 9) — interpretasi sisa
//    (sumber: riset §20). Rumus butuh "nilai nama" yang caranya BELUM ada
//    sumbernya -> jangan dipakai untuk hitung otomatis dulu, cuma disimpan
//    di sini supaya siap dipakai begitu tabel konversi nama sudah diaudit.
// ---------------------------------------------------------------------------
export const ABU_MASYAR_JODOH_MOD9 = [
  { sisa: 1, interpretation: 'Kurang baik.' },
  { sisa: 2, interpretation: 'Baik.' },
  { sisa: 3, interpretation: 'Awal baik, akhir kurang baik.' },
  { sisa: 4, interpretation: 'Menyenangkan di awal, memberatkan kemudian.' },
  { sisa: 5, interpretation: 'Erat secara kekeluargaan.' },
  { sisa: 6, interpretation: 'Awal baik, kemudian ada kesulitan.' },
  { sisa: 7, interpretation: 'Baik.' },
  { sisa: 8, interpretation: 'Banyak kerepotan.' },
  { sisa: 9, interpretation: 'Kecenderungan berselisih/berpisah.' },
];

// ---------------------------------------------------------------------------
// 5. SUNDA REPOK — tabel simbol sisa 1-7 (sumber: riset §9). Rumus konversi
//    nama -> aksara Cacarakan BELUM lengkap di sumber -> jangan dipakai untuk
//    hitung otomatis dulu, disimpan supaya siap dipakai setelah diaudit.
// ---------------------------------------------------------------------------
export const REPOK_MOD7 = [
  { sisa: 1, symbol: 'Pisang Punggel', interpretation: 'Secara simbolik dikaitkan dengan kesialan/naas.' },
  { sisa: 2, symbol: 'Tunggak Semi', interpretation: 'Simbol keberlanjutan.' },
  { sisa: 3, symbol: 'Lumbung/Lungguh Gumuling', interpretation: 'Berkecukupan, menjadi tempat pertolongan orang lain.' },
  { sisa: 4, symbol: 'Satriya Lumaku', interpretation: 'Banyak berpindah tempat.' },
  { sisa: 5, symbol: 'Pandita Mukti', interpretation: 'Kaya ilmu.' },
  { sisa: 6, symbol: 'Pandan Waringin', interpretation: 'Banyak rezeki, tetapi turut dinikmati banyak orang.' },
  { sisa: 7, symbol: 'Padaringan Kebek', interpretation: 'Tidak kekurangan pangan.' },
];

// ---------------------------------------------------------------------------
// 6. Fallback hari + pasaran dari tanggal Masehi.
//    Epoch: 8 Juli 1633 M = 1 Sura tahun Alip = Jumat Legi (konvensi umum
//    kalender Jawa). Ganti fungsi ini dengan util existing di app kalau sudah
//    ada, supaya satu sumber kebenaran untuk seluruh app.
// ---------------------------------------------------------------------------
const HARI_LIST = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const PASARAN_LIST = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'];
const EPOCH_UTC_MS = Date.UTC(1633, 6, 8); // 8 Juli 1633, indeks pasaran = 0 (Legi)

export function getHariPasaran(dateInput) {
  const d = new Date(dateInput);
  const dateOnlyUTC = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const hari = HARI_LIST[d.getDay()];

  const diffDays = Math.round((dateOnlyUTC - EPOCH_UTC_MS) / 86400000);
  const idx = ((diffDays % 5) + 5) % 5;
  const pasaran = PASARAN_LIST[idx];

  return { hari, pasaran };
}

export function getNeptu(dateInput) {
  const { hari, pasaran } = getHariPasaran(dateInput);
  return {
    hari,
    pasaran,
    neptuHari: NEPTU_HARI[hari],
    neptuPasaran: NEPTU_PASARAN[pasaran],
    neptuTotal: NEPTU_HARI[hari] + NEPTU_PASARAN[pasaran],
  };
}
