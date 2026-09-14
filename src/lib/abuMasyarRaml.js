// Abu Ma'syar — Fasal Menghitung Jodoh (Raml)
// Formula: (nilai abjad nama A + nilai abjad nama B + 7) mod 9
// Nilai abjad per nama dihitung lewat hitungAbjad() di ./abjad.js — abjad kabir
// yang SAMA persis dipakai fitur Kepribadian, jadi nilainya konsisten di seluruh app.
// Sumber: Terjemah Abu Mashar Al-Falaki, Fasal Menghitung Jodoh/Pertemanan/Persaudaraan.
// Interpretasi budaya untuk edukasi & refleksi, bukan kepastian nasib.
const INTERPRETASI_RAML = {
  1: { nama: 'Sisa 1', kualitas: 'kurang', deskripsi: 'Menurut fasal ini tergolong rendah, kurang baik.' },
  2: { nama: 'Sisa 2', kualitas: 'baik', deskripsi: 'Menurut fasal ini tergolong bagus.' },
  3: { nama: 'Sisa 3', kualitas: 'netral', deskripsi: 'Awal baik, namun akhir kurang baik menurut fasal ini.' },
  4: { nama: 'Sisa 4', kualitas: 'netral', deskripsi: 'Menyenangkan pada awalnya, kemudian cenderung memburuk.' },
  5: { nama: 'Sisa 5', kualitas: 'baik', deskripsi: 'Menandakan kekeluargaan dan kerukunan.' },
  6: { nama: 'Sisa 6', kualitas: 'netral', deskripsi: 'Awal bagus, namun kemudian mengalami kesusahan.' },
  7: { nama: 'Sisa 7', kualitas: 'baik', deskripsi: 'Menurut fasal ini tergolong bagus.' },
  8: { nama: 'Sisa 8', kualitas: 'kurang', deskripsi: 'Menandakan banyak kerepotan.' },
  9: { nama: 'Sisa 9', kualitas: 'kurang', deskripsi: 'Menandakan potensi permusuhan/perpisahan.' },
};

export function fasalJodohAbuMasyar(nilaiAbjadA, nilaiAbjadB) {
  const totalGabungan = nilaiAbjadA + nilaiAbjadB + 7;
  const sisa = totalGabungan % 9 === 0 ? 9 : totalGabungan % 9;
  return { totalGabungan, sisa, ...INTERPRETASI_RAML[sisa] };
}
