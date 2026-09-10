// Epoch tervalidasi: 1970-01-01 = Kamis Legi (posisi 0 dalam siklus pasaran)
const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'];
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jumat", 'Sabtu'];

const NEPTU_HARI = { Minggu: 5, Senin: 4, Selasa: 3, Rabu: 7, Kamis: 8, Jumat: 6, Sabtu: 9 };
const NEPTU_PASARAN = { Legi: 5, Pahing: 9, Pon: 7, Wage: 4, Kliwon: 8 };

const EPOCH = new Date(1970, 0, 1); // Kamis Wage (dikoreksi dari Legi)
const EPOCH_PASARAN_POS = 3; // Wage

export function hitungWeton(date) {
  const oneDay = 86400000;
  const diffDays = Math.round(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(EPOCH.getFullYear(), EPOCH.getMonth(), EPOCH.getDate())) / oneDay
  );
  const pasaranIdx = (((EPOCH_PASARAN_POS + diffDays) % 5) + 5) % 5;
  const pasaran = PASARAN[pasaranIdx];
  const hari = HARI[date.getDay()];
  const neptuHari = NEPTU_HARI[hari];
  const neptuPasaran = NEPTU_PASARAN[pasaran];
  return {
    hari,
    pasaran,
    neptuHari,
    neptuPasaran,
    totalNeptu: neptuHari + neptuPasaran,
  };
}

export function watakDariNeptu(total) {
  // Interpretasi umum berbasis rentang total neptu (tradisi primbon, disederhanakan)
  if (total <= 8) return 'Cenderung tenang, hati-hati, dan suka merenung sebelum bertindak.';
  if (total <= 11) return 'Cenderung ramah, mudah bergaul, dan menyukai keharmonisan.';
  if (total <= 14) return 'Cenderung berkemauan kuat, pekerja keras, dan tegas.';
  if (total <= 17) return 'Cenderung memiliki jiwa pemimpin dan berani mengambil risiko.';
  return 'Cenderung penuh pertimbangan, bijaksana, dan dihormati lingkungan sekitar.';
}
