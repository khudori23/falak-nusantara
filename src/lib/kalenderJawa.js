// src/lib/kalenderJawa.js
// Konversi Masehi -> Jawa, Kurup Asapon (berlaku 24 Maret 1936 - 25 Agustus 2052).
// Sumber: H. Djanudji, "Penanggalan Jawa 120 Tahun Kuruf Asapon", Dahara Prize, 2013;
// R. Bratakesawa, "Almanak Atusan Taun", Penjebar Semangat, 1968.
// Di luar rentang Kurup Asapon, fungsi ini melempar error -- bukan menebak.

const EPOCH_GREGORIAN = { y: 1936, m: 3, d: 24 }; // = 1 Sura 1867 AJ
const EPOCH_TAHUN_JAWA = 1867;
const KURUP_ASAPON_END = { y: 2052, m: 8, d: 25 };

export const NAMA_BULAN_JAWA = [
  'Sura', 'Sapar', 'Mulud', 'Bakda Mulud', 'Jumadilawal', 'Jumadilakir',
  'Rejeb', 'Ruwah', 'Pasa', 'Sawal', 'Sela', 'Besar',
];
export const NAMA_WARSA = ['Alip', 'Ehe', 'Jimawal', 'Je', 'Dal', 'Be', 'Wawu', 'Jumakir'];

const UMUR_TAHUN = [354, 355, 354, 355, 354, 354, 354, 355]; // indeks = Warsa (0-7)
const TAHUN_KABISAT_WARSA = [1, 3, 7]; // Ehe, Je, Jumakir -> bulan Besar 30 hari

function toJDN(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return (
    d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 +
    Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045
  );
}

export function konversiMasehiKeJawa(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const jdnTarget = toJDN(y, m, d);
  const jdnEpoch = toJDN(EPOCH_GREGORIAN.y, EPOCH_GREGORIAN.m, EPOCH_GREGORIAN.d);
  const jdnEnd = toJDN(KURUP_ASAPON_END.y, KURUP_ASAPON_END.m, KURUP_ASAPON_END.d);

  if (jdnTarget < jdnEpoch || jdnTarget > jdnEnd) {
    throw new Error(
      `Tanggal ${isoDate} di luar rentang Kurup Asapon (24 Maret 1936 - 25 Agustus 2052) -- konversi belum didukung.`
    );
  }

  const jarak = (jdnTarget - jdnEpoch) + 1;
  const windu = Math.floor(jarak / 2835);
  let sisaHari = jarak - windu * 2835;

  let warsa = 0;
  while (sisaHari - UMUR_TAHUN[warsa] > 0) {
    sisaHari -= UMUR_TAHUN[warsa];
    warsa += 1;
  }
  const tahunJawa = warsa + windu * 8 + EPOCH_TAHUN_JAWA;

  const umurBulan = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  if (TAHUN_KABISAT_WARSA.includes(warsa)) umurBulan[11] = 30;

  let wulan = 0;
  while (sisaHari - umurBulan[wulan] > 0) {
    sisaHari -= umurBulan[wulan];
    wulan += 1;
  }

  return {
    tanggal: sisaHari,
    bulan: wulan + 1,
    bulanNama: NAMA_BULAN_JAWA[wulan],
    tahun: tahunJawa,
    warsa: NAMA_WARSA[warsa],
    windu,
  };
}
