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

// Pasangan unsur yang punya catatan simbolis khusus di banyak primbon populer
// (Api x Air, dsb). Ini BUKAN rumus terverifikasi -- murni bumbu naratif ringan,
// tetap dalam koridor "ringkasan primbon umum, bukan kepastian".
const CATATAN_PASANGAN = {
  'Api|Air': 'Dalam simbolisme primbon, api dan air adalah dua unsur yang saling berlawanan tabiat, tapi justru karena itu keduanya sering digambarkan bisa saling meredam dan melengkapi -- yang satu memberi semangat, yang satu memberi ketenangan.',
  'Mega|Bunga': 'Mega dan bunga sama-sama unsur yang "ringan" dan terbuka, sehingga dalam banyak ringkasan primbon dua unsur ini digambarkan mudah nyambung dalam pergaulan sehari-hari.',
  'Bumi|Air': 'Bumi yang kokoh dan air yang mengalir sering digambarkan sebagai pasangan yang saling menopang -- satu memberi kestabilan, satu memberi kelenturan.',
};

export function catatanPasangan(unsurA, unsurB) {
  return CATATAN_PASANGAN[`${unsurA}|${unsurB}`] || CATATAN_PASANGAN[`${unsurB}|${unsurA}`] || null;
}

export function buatNarasiUnsurHari({ hariPria, unsurPria, hariWanita, unsurWanita, sama }) {
  const pembuka = sama
    ? `Melihat hari lahir keduanya, pria (${hariPria}) dan wanita (${hariWanita}) sama-sama membawa unsur ${unsurPria.unsur}. Kesamaan dasar karakter ini biasanya membuat komunikasi terasa lebih cepat nyambung sejak awal, karena keduanya cenderung memandang banyak hal dari sudut yang mirip.`
    : `Melihat hari lahir keduanya, pihak pria (${hariPria}) membawa unsur ${unsurPria.unsur}, sementara pihak wanita (${hariWanita}) membawa unsur ${unsurWanita.unsur}. Perbedaan unsur ini bukan berarti tidak cocok -- justru dua karakter yang berbeda seringkali saling mengisi kekurangan satu sama lain, asal keduanya mau saling memahami ritme masing-masing.`;

  const uraianPria = `Dari sisi pria, karakter unsur ${unsurPria.unsur} cenderung ${unsurPria.positif}. Yang perlu jadi perhatian bersama: ${unsurPria.perhatian}.`;
  const uraianWanita = `Dari sisi wanita, karakter unsur ${unsurWanita.unsur} cenderung ${unsurWanita.positif}. Yang perlu jadi perhatian bersama: ${unsurWanita.perhatian}.`;

  const catatan = !sama ? catatanPasangan(unsurPria.unsur, unsurWanita.unsur) : null;

  const penutup = sama
    ? `Dengan bekal karakter dasar yang serupa ini, tantangan terbesar biasanya bukan soal saling memahami, melainkan soal saling mengingatkan agar sisi yang perlu diperhatikan pada unsur ${unsurPria.unsur} tidak muncul berbarengan di saat yang sama.`
    : `Kombinasi ${unsurPria.unsur} dan ${unsurWanita.unsur} ini bisa berjalan baik selama keduanya sadar bahwa perbedaan cara merespons keadaan adalah hal yang wajar, bukan tanda ketidakcocokan.${catatan ? ' ' + catatan : ''}`;

  return [pembuka, uraianPria, uraianWanita, penutup].join('\n\n')
    + '\n\nCatatan: ini ringkasan primbon umum sebagai bahan refleksi, bukan kepastian atau vonis atas hubungan kalian.';
}
