// sundaNaktuBulanTahun.js
// Engine Naktu Bulan & Naktu Tahun (Windu) — Sasih Kala Caka Sunda
//
// SUMBER DATA NAKTU (nilai bulan & tahun): Paririmbon Sunda (Jawa Barat),
// Depdikbud Ditjen Kebudayaan 1992/1993, hlm. 18-20 (bagian "2.2.1
// Transliterasi" — transliterasi huruf demi huruf dari naskah asli,
// bukan analisis turunan). Nilai naktu bulan TERBUKTI konstan di semua
// 8 tabel tahun windu yang ada di naskah (Alip s/d Jim Akhir), jadi
// aman dipakai sebagai tabel tetap.
//
// SUMBER FORMULA NAMA TAHUN WINDU dari tahun Hijriah (AH mod 8):
// kalender Jawa Sultan Agungan (bukan spesifik naskah Sunda ini, tapi
// naskah memakai penamaan windu yang sama persis: Alip, He/Ehe, Jim
// Awal, Je, Dal, Be, Wau/Wawu, Jim Akhir — urutan identik).
// Dicek silang dengan catatan naskah sendiri: "naskah ditulis 1938 M
// = tahun Jim Awal" -> 1938 M ~ AH 1357 -> 1357 mod 8 = 5 = Jimawal.
// COCOK, jadi formula ini valid dipakai di sini.
//
// VALIDASI PRESISI (dijalankan & dites): tanggal 6 Juni 1938 M dihitung
// oleh engine ini -> 7 Silih Mulud 1357 H, tahun windu Jim Awal. Ini
// cocok PERSIS dengan colophon naskah sendiri: "1938 tahun Jim Awal
// tanggal 7 bulan Silih Mulud" -- bukan cuma cocok tahun, tapi cocok
// sampai ke tanggal presisnya.
//
// CATATAN JUJUR PENTING: konversi Masehi -> Hijriah di bawah ini
// memakai algoritma tabular/aritmatika kalender sipil (dikenal luas,
// dipakai di banyak sistem kalender, kadang disebut "tabular Islamic
// calendar" / mirip algoritma Kuwaiti) -- BUKAN hasil rukyat/hisab
// resmi. Ini murni matematika kalender, bukan riset primbon, tapi
// hasilnya BISA meleset 1-2 hari dari kalender Hijriah resmi/rukyat.
// Untuk kebutuhan naktu tradisional ini biasanya cukup, tapi jangan
// dipakai untuk keperluan ibadah (awal Ramadan/Syawal) tanpa verifikasi
// tambahan.

// ---------- 1. Konversi Masehi -> Julian Day Number ----------
function gregorianToJDN(tahun, bulan, tanggal) {
  const a = Math.floor((14 - bulan) / 12);
  const y = tahun + 4800 - a;
  const m = bulan + 12 * a - 3;
  return (
    tanggal +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

// ---------- 2. Julian Day Number -> Hijriah (tabular/aritmatika) ----------
function jdnToHijri(jdn) {
  let l = jdn - 1948440 + 10632;
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
  const bulan = Math.floor((24 * l) / 709);
  const tanggal = l - Math.floor((709 * bulan) / 24);
  const tahun = 30 * n + j - 30;
  return { tahun, bulan, tanggal };
}

function masehiKeHijri(tahun, bulan, tanggal) {
  const jdn = gregorianToJDN(tahun, bulan, tanggal);
  return jdnToHijri(jdn);
}

// ---------- 3. Naktu Bulan (tetap, dari naskah hlm. 18-20) ----------
// Key: nomor bulan Hijriah (1-12). Nama Sunda sesuai naskah.
export const NAKTU_BULAN = {
  1: { nama: 'muharam', naktu: 7 },
  2: { nama: 'sapar', naktu: 2 },
  3: { nama: 'mulud', naktu: 3 }, // Rabiul Awal
  4: { nama: 'silih mulud', naktu: 5 }, // Rabiul Akhir
  5: { nama: 'jumadil awal', naktu: 6 },
  6: { nama: 'jumadil ahir', naktu: 1 },
  7: { nama: 'rajab', naktu: 2 },
  8: { nama: 'rewah', naktu: 4 }, // Syaban
  9: { nama: 'puasa', naktu: 5 }, // Ramadan
  10: { nama: 'sawal', naktu: 7 }, // Syawal
  11: { nama: 'hapit', naktu: 1 }, // Dzulqaidah
  12: { nama: 'reyagung', naktu: 3 }, // Dzulhijjah
};

// ---------- 4. Nama Tahun Windu dari AH mod 8 ----------
// Sisa 1=Wawu, 2=Jimakhir, 3=Alip, 4=Ehe, 5=Jimawal, 6=Je, 7=Dal, 0(8)=Be
// (formula kalender Jawa Sultan Agungan, dicek silang ke catatan
// naskah "1938 M = Jim Awal" -> cocok)
const URUTAN_WINDU_DARI_SISA = {
  1: 'wau',
  2: 'jim akhir',
  3: 'alip',
  4: 'he',
  5: 'jim awal',
  6: 'je',
  7: 'dal',
  0: 'be',
};

// ---------- 5. Naktu Tahun per nama windu (dari naskah hlm. 18-20) ----------
export const NAKTU_TAHUN = {
  alip: 1,
  he: 5,
  'jim awal': 3,
  je: 7,
  dal: 4,
  be: 2,
  wau: 6,
  'jim akhir': 3,
};

function namaWinduDariTahunHijri(tahunHijri) {
  const sisa = tahunHijri % 8;
  return URUTAN_WINDU_DARI_SISA[sisa];
}

/**
 * Menghitung Naktu Bulan & Naktu Tahun dari tanggal Masehi.
 * @param {number} tahun - tahun Masehi, mis. 2000
 * @param {number} bulan - bulan Masehi 1-12
 * @param {number} tanggal - tanggal 1-31
 */
export function hitungNaktuBulanTahun(tahun, bulan, tanggal) {
  const hijri = masehiKeHijri(tahun, bulan, tanggal);
  const bulanInfo = NAKTU_BULAN[hijri.bulan];
  const namaWindu = namaWinduDariTahunHijri(hijri.tahun);
  const naktuTahun = NAKTU_TAHUN[namaWindu];

  return {
    tanggalMasehi: { tahun, bulan, tanggal },
    hijri,
    bulan: {
      nama: bulanInfo.nama,
      naktu: bulanInfo.naktu,
    },
    tahunWindu: {
      nama: namaWindu,
      naktu: naktuTahun,
    },
    confidence: 'VERIFIED_ACADEMIC',
    catatan:
      'Nilai naktu bulan & tahun dari Paririmbon Sunda (Depdikbud 1992/1993, ' +
      'hlm. 18-20). Konversi Masehi->Hijriah memakai algoritma tabular/' +
      'aritmatika kalender sipil (bukan rukyat/hisab resmi) -- bisa meleset ' +
      '1-2 hari dari kalender Hijriah resmi.',
    sumber: [
      'Paririmbon Sunda (Jawa Barat), Depdikbud 1992/1993, hlm. 18-20 (naktu bulan & tahun)',
      'Formula nama tahun windu dari AH mod 8: kalender Jawa Sultan Agungan, dicek silang ke catatan naskah (1938 M = Jim Awal)',
    ],
  };
}
