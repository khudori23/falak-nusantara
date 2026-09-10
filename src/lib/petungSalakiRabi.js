// Petung Salaki Rabi — tafsir rezeki & nasib gabungan pasangan berdasarkan
// jumlah neptu (hari + pasaran) kedua calon, dibagi 5.
// Sumber: Hartono, "Petung dalam Primbon Jawa" (versi 5 lambang yang paling
// konsisten dikutip lintas rujukan primbon). Sri, Dana, Lungguh = tanda baik;
// Lara, Pati = tanda kurang baik — bukan vonis mutlak, melainkan tradisi
// kehati-hatian leluhur.

const DAFTAR_SALAKI_RABI = {
  1: {
    nama: 'Sri',
    kualitas: 'baik',
    desc: 'Slamet lumintu rejekine — rezeki dipercaya mengalir lancar dan terus tumbuh. Pasangan ini diyakini akan dimudahkan dalam mencari nafkah.',
  },
  2: {
    nama: 'Dana',
    kualitas: 'baik',
    desc: 'Pertanda kecukupan harta dan kemudahan materi. Pasangan ini dipercaya akan berkecukupan dalam hal rezeki sepanjang rumah tangganya.',
  },
  3: {
    nama: 'Lara',
    kualitas: 'kurang',
    desc: 'Pertanda kangelan atau kesulitan yang mungkin muncul dalam perjalanan rumah tangga. Bukan vonis akhir — kesabaran dan komunikasi terbuka dipercaya bisa menetralkannya.',
  },
  4: {
    nama: 'Pati',
    kualitas: 'kurang',
    desc: 'Pertanda sangsara atau kerep kepaten (banyak putus/terhenti) menurut tradisi. Disarankan lebih berhati-hati dan memperkuat komunikasi sejak awal.',
  },
  5: {
    nama: 'Lungguh',
    kualitas: 'baik',
    desc: 'Duwe pangkat — melambangkan kehormatan. Pasangan ini diperkirakan dihormati dan dihargai oleh lingkungan sekitarnya.',
  },
};

export function salakiRabiDariNeptu(totalNeptuGabungan) {
  if (typeof totalNeptuGabungan !== 'number' || Number.isNaN(totalNeptuGabungan)) {
    return { nama: 'Tidak diketahui', kualitas: 'kurang', desc: 'Data neptu tidak valid.' };
  }
  const sisa = totalNeptuGabungan % 5;
  const kunci = sisa === 0 ? 5 : sisa;
  return DAFTAR_SALAKI_RABI[kunci];
}
