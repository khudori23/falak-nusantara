// Abu Ma'syar — Penentuan Buruj via Nama + Nama Ibu
// Formula: nilai abjad (nama + " " + nama_ibu) mod 12 -> buruj (urutan klasik Aries..Pisces)
// Data buruj (unsur, planet penguasa) SAMA PERSIS dengan tabel `zodiac` yang sudah dipakai
// fitur Kepribadian di Supabase — disalin jadi konstanta di sini supaya Perjodohan tetap
// offline-first (tidak perlu network call saat hitung).
//
// CATATAN JUJUR: kitab Abu Ma'syar Anda punya subbagian "Jodohnya" per-buruj yang spesifik,
// tapi belum ditranskrip lengkap dari PDF. Interpretasi kecocokan di bawah ini memakai
// KONVENSI UNSUR ASTROLOGI KLASIK UMUM (Api-Udara serasi, Tanah-Air serasi, dst) sebagai
// placeholder yang jujur ditandai confidence lebih rendah — BUKAN kutipan langsung dari
// tabel "Jodohnya" kitab. Kalau nanti Anda bisa kirim scan/teks halaman "Jodohnya" tsb,
// saya ganti jadi VERIFIED_PRIMARY sesuai kitab aslinya.
import { hitungAbjad } from './abjad';

const BURUJ = [
  { nama: 'Aries', arab: 'الحمل', unsur: 'Api', planet: 'Mars' },
  { nama: 'Taurus', arab: 'الثور', unsur: 'Tanah', planet: 'Venus' },
  { nama: 'Gemini', arab: 'الجوزاء', unsur: 'Udara', planet: 'Merkurius' },
  { nama: 'Cancer', arab: 'السرطان', unsur: 'Air', planet: 'Bulan' },
  { nama: 'Leo', arab: 'الأسد', unsur: 'Api', planet: 'Matahari' },
  { nama: 'Virgo', arab: 'السنبلة', unsur: 'Tanah', planet: 'Merkurius' },
  { nama: 'Libra', arab: 'الميزان', unsur: 'Udara', planet: 'Venus' },
  { nama: 'Scorpio', arab: 'العقرب', unsur: 'Air', planet: 'Mars' },
  { nama: 'Sagittarius', arab: 'القوس', unsur: 'Api', planet: 'Jupiter' },
  { nama: 'Capricorn', arab: 'الجدي', unsur: 'Tanah', planet: 'Saturnus' },
  { nama: 'Aquarius', arab: 'الدلو', unsur: 'Udara', planet: 'Saturnus' },
  { nama: 'Pisces', arab: 'الحوت', unsur: 'Air', planet: 'Jupiter' },
];

const UNSUR_SERASI = {
  Api: ['Api', 'Udara'],
  Udara: ['Udara', 'Api'],
  Tanah: ['Tanah', 'Air'],
  Air: ['Air', 'Tanah'],
};

export function tentukanBuruj(nama, namaIbu) {
  const gabungan = hitungAbjad(`${nama} ${namaIbu}`);
  const sisa = gabungan.total % 12 === 0 ? 12 : gabungan.total % 12;
  return { ...BURUJ[sisa - 1], nilaiAbjad: gabungan.total, sisa };
}

export function burujJodohAbuMasyar(namaA, namaIbuA, namaB, namaIbuB) {
  const burujA = tentukanBuruj(namaA, namaIbuA);
  const burujB = tentukanBuruj(namaB, namaIbuB);
  const serasi = UNSUR_SERASI[burujA.unsur]?.includes(burujB.unsur);

  return {
    burujA,
    burujB,
    nama: `${burujA.nama} × ${burujB.nama}`,
    kualitas: serasi ? 'baik' : 'netral',
    deskripsi: serasi
      ? `Buruj ${burujA.nama} (unsur ${burujA.unsur}, planet ${burujA.planet}) dan ${burujB.nama} (unsur ${burujB.unsur}, planet ${burujB.planet}) tergolong unsur yang selaras secara astrologi klasik.`
      : `Buruj ${burujA.nama} (unsur ${burujA.unsur}) dan ${burujB.nama} (unsur ${burujB.unsur}) tergolong unsur yang berbeda arah — bukan berarti buruk, tapi disarankan lebih banyak penyesuaian karakter.`,
  };
}
