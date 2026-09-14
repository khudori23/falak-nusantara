// Kecocokan Sunda-Naktu (bagian hari lahir).
// Sumber rumus pembanding: Rosinansis, Rineka (2019), skripsi UMMI,
// "Analisis Élmu Palak pada Materi Matematika SMA" — BAB V poin 1.f:
// naktu hari lahir A + naktu hari lahir B, dibagi 7, sisa 2 = cocok.
// "Naktu hari lahir" di sini memakai nilai neptu hari+pasaran yang sama
// dengan yang sudah dipakai di fitur Petung Salaki Rabi (sumber Hartono).
//
// CATATAN JUJUR: bagian naktu BULAN/TAHUN (Sasih Kala Caka Sunda) BELUM
// bisa disambungkan ke sini karena butuh konversi kalender Hijriah/Masehi
// ke Sasih Kala Caka Sunda yang belum ada sumbernya — lihat SundaNaktuScreen.

export function kecocokanNaktuHariLahir(totalNeptuA, totalNeptuB) {
  const jumlah = totalNeptuA + totalNeptuB;
  const sisa = jumlah % 7;
  const cocok = sisa === 2;

  return {
    jumlah,
    sisa,
    kualitas: cocok ? 'baik' : 'netral',
    nama: cocok ? 'Sisa 2 — Selaras' : `Sisa ${sisa} — Perlu Penyesuaian`,
    deskripsi: cocok
      ? `Naktu hari lahir keduanya, dijumlahkan lalu dibagi 7, bersisa 2 — menurut rumus pembanding ini, itu tandanya waktu kelahiran keduanya berada dalam hitungan yang selaras.`
      : `Naktu hari lahir keduanya, dijumlahkan lalu dibagi 7, bersisa ${sisa} — bukan sisa yang jadi patokan "cocok" di rumus ini (yang dicari adalah sisa 2), tapi ini bukan vonis buruk, hanya penanda perlu penyesuaian lebih di waktu-waktu tertentu.`,
    confidence: 'VERIFIED_ACADEMIC',
    sumber: 'Rosinansis (2019), Skripsi UMMI — rumus pembanding naktu hari lahir, mod 7',
  };
}
