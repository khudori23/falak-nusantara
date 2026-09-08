// Kategori "laku" dari total neptu weton — interpretasi tradisional primbon Jawa,
// ditulis ulang ringkas untuk keperluan edukasi, bukan prediksi pasti.
const DAFTAR_LAKU = [
  {
    nama: 'Lakuning Geni',
    desc: 'Semangat menyala dan cepat bertindak. Baik untuk memulai hal baru, namun perlu dijaga agar tidak tergesa-gesa.',
  },
  {
    nama: 'Lakuning Banyu',
    desc: 'Mudah menyesuaikan diri dan mengalir dengan keadaan. Cenderung tenang, tapi kadang kurang tegas mengambil keputusan.',
  },
  {
    nama: 'Lakuning Angin',
    desc: 'Gesit, mudah bergaul, dan cepat menangkap peluang. Perlu dijaga agar tetap fokus pada satu tujuan.',
  },
  {
    nama: 'Lakuning Bumi',
    desc: 'Berpijak kuat, sabar, dan dapat diandalkan. Kecenderungan bekerja perlahan namun konsisten.',
  },
  {
    nama: 'Lakuning Lintang',
    desc: 'Punya daya tarik dan sering jadi sorotan. Baik dalam relasi sosial, namun perlu menjaga kerendahan hati.',
  },
  {
    nama: 'Lakuning Rembulan',
    desc: 'Lembut, penuh pertimbangan, dan peka terhadap perasaan orang lain. Kadang perlu lebih percaya diri.',
  },
  {
    nama: 'Lakuning Srengenge',
    desc: 'Berwibawa dan menjadi panutan di lingkungannya. Perlu menjaga keseimbangan agar tidak terkesan mendominasi.',
  },
];

export function lakuDariNeptu(totalNeptu) {
  if (typeof totalNeptu !== 'number' || Number.isNaN(totalNeptu)) {
    return { nama: 'Tidak diketahui', desc: 'Data neptu tidak valid.' };
  }
  const index = totalNeptu % DAFTAR_LAKU.length;
  return DAFTAR_LAKU[index];
}
