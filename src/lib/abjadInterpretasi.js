// Tafsir watak dari total nilai Abjad — metode "4 Unsur" dalam ilmu huruf klasik:
// huruf hijaiyah dikelompokkan ke 4 unsur (api, angin, air, tanah), dan total nilai
// Abjad sebuah nama menunjukkan unsur dominan penyusunnya. Interpretasi tradisional
// untuk edukasi & refleksi, bukan kepastian watak seseorang.
const UNSUR_ABJAD = {
  1: {
    nama: 'Api',
    deskripsi: 'Cenderung penuh semangat dan hangat dalam menyayangi, namun perlu menjaga diri agar tidak mudah cemburu atau meledak-ledak.',
  },
  2: {
    nama: 'Angin',
    deskripsi: 'Cenderung tenang namun sulit ditebak, menyukai hal-hal spiritual, dan terkadang keras kepala pada pendiriannya.',
  },
  3: {
    nama: 'Air',
    deskripsi: 'Cenderung mengalir mengikuti keadaan, tidak mudah putus asa, dan senang membantu orang lain meski kadang terlalu perfeksionis.',
  },
  0: {
    nama: 'Tanah',
    deskripsi: 'Cenderung teguh pendirian, berani, dan sabar, meski kadang bersikap tak acuh terhadap keadaan sekitar.',
  },
};

export function interpretasiAbjad(totalAbjad) {
  if (typeof totalAbjad !== 'number' || Number.isNaN(totalAbjad)) {
    return { nama: 'Tidak diketahui', deskripsi: 'Data tidak dapat ditafsirkan.' };
  }
  const sisa = totalAbjad % 4;
  return UNSUR_ABJAD[sisa];
}
