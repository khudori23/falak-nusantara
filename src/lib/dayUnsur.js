// Ringkasan tradisi primbon Jawa per hari lahir — dipadukan dari beberapa
// rujukan primbon umum, ditulis ulang ringkas untuk keperluan edukasi.
export const UNSUR_HARI = {
  Senin: {
    unsur: 'Bunga', positif: 'ramah, karismatik, suka menolong, pekerja keras',
    perhatian: 'kadang keras kepala', karier: 'pemerintahan, dunia korporat',
  },
  Selasa: {
    unsur: 'Api', positif: 'berjiwa sosial, berani, penuh semangat',
    perhatian: 'mudah terpancing emosi', karier: 'militer, kelautan, lapangan',
  },
  Rabu: {
    unsur: 'Daun', positif: 'tenang, bijaksana, penyayang keluarga',
    perhatian: 'kadang kurang percaya pada orang lain', karier: 'hukum, seni musik',
  },
  Kamis: {
    unsur: 'Angin', positif: 'gigih, mudah beradaptasi, pandai bergaul',
    perhatian: 'mudah curiga, senang dipuji', karier: 'keagamaan, pertanian',
  },
  Jumat: {
    unsur: 'Air', positif: 'berwibawa, bijaksana, suka belajar hal baru',
    perhatian: 'kadang keras kepala dan merasa paling benar', karier: 'perdagangan, pertanian',
  },
  Sabtu: {
    unsur: 'Bumi', positif: 'berpendirian kuat, pekerja keras, optimis',
    perhatian: 'kadang merasa benar sendiri', karier: 'sastra, jurnalistik',
  },
  Minggu: {
    unsur: 'Mega', positif: 'mudah bergaul, tulus, pandai bicara',
    perhatian: 'mudah tersinggung dan larut dalam kesedihan', karier: 'seni rupa, arsitektur',
  },
};

export const HARI_NAAS = {
  Minggu: 'Rabu', Senin: 'Sabtu', Selasa: 'Senin', Rabu: 'Jumat',
  Kamis: 'Minggu', Jumat: 'Selasa', Sabtu: 'Kamis',
};
