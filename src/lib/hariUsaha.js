import { supabase } from './supabase';

export const KATEGORI_USAHA = [
  { value: 'PERTANIAN', label: 'Bercocok Tanam' },
  { value: 'PETERNAKAN', label: 'Peternakan' },
  { value: 'PEMBANGUNAN', label: 'Pembangunan' },
  { value: 'PERNIAGAAN', label: 'Berdagang & Berlayar' },
];

export const KEGIATAN_PER_KATEGORI = {
  PERTANIAN: [
    { value: 'OLAH_TANAH', label: 'Olah Tanah' },
    { value: 'TANAM_BIBIT', label: 'Tanam Bibit' },
    { value: 'PANEN', label: 'Panen' },
    { value: 'SIMPAN_HASIL', label: 'Simpan Hasil' },
  ],
  PETERNAKAN: [
    { value: 'BELI_TERNAK', label: 'Beli Ternak' },
    { value: 'JUAL_TERNAK', label: 'Jual Ternak' },
    { value: 'MENGAWINKAN_TERNAK', label: 'Mengawinkan Ternak' },
    { value: 'PINDAH_KANDANG', label: 'Pindah Kandang' },
  ],
  PEMBANGUNAN: [
    { value: 'BANGUN_RUMAH', label: 'Bangun Rumah Tinggal' },
    { value: 'BANGUN_TEMPAT_USAHA', label: 'Bangun Tempat Usaha' },
  ],
  PERNIAGAAN: [
    { value: 'BERDAGANG', label: 'Berdagang / Buka Usaha' },
    { value: 'BERLAYAR', label: 'Berlayar / Perjalanan Jauh' },
  ],
};

export const METODE_TRADISI = [
  { value: 'GABUNGAN', label: 'Gabungan (Rekomendasi)' },
  { value: 'SUNDA', label: 'Adat Sunda' },
  { value: 'JAWA', label: 'Adat Jawa' },
  { value: 'ABU_MASYAR', label: "Kitab Abu Ma'syar" },
];

export const GRADE_LABEL = {
  OPTIMAL_EXCELLENCE: 'Sangat Optimal',
  SANGAT_BAIK: 'Sangat Baik',
  BAIK: 'Baik',
  NETRAL: 'Netral',
  KURANG_BAIK: 'Kurang Baik',
  HINDARI: 'Sebaiknya Dihindari',
};

export function gradeColor(colors, grade) {
  switch (grade) {
    case 'OPTIMAL_EXCELLENCE':
    case 'SANGAT_BAIK':
      return { bg: colors.successSoft, fg: colors.success };
    case 'BAIK':
      return { bg: colors.primarySoft, fg: colors.primary };
    case 'KURANG_BAIK':
      return { bg: '#FFF3DD', fg: '#B8860B' };
    case 'HINDARI':
      return { bg: colors.dangerSoft, fg: colors.danger };
    default:
      return { bg: colors.surface, fg: colors.textSecondary };
  }
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

export async function hitungHariUsaha({ kategori, kegiatan, metode, tanggal, lokasi }) {
  const { data, error } = await supabase.functions.invoke('calculate-hari-baik-usaha', {
    body: {
      kategori,
      kegiatan,
      metode,
      target_date: formatDate(tanggal),
      ...(lokasi ? { latitude: lokasi.lat, longitude: lokasi.lng } : {}),
    },
  });
  if (error) throw new Error(error.message || 'Gagal menghubungi mesin penghitung.');
  if (data?.meta?.status === 'error') throw new Error(data.message || 'Gagal menghitung hari baik.');
  return data;
}

export async function cariHariTerbaik({ kategori, kegiatan, metode, mulai, jumlahHari, lokasi }) {
  const hasil = [];
  for (let i = 0; i < jumlahHari; i++) {
    const tanggal = new Date(mulai);
    tanggal.setDate(tanggal.getDate() + i);
    try {
      const r = await hitungHariUsaha({ kategori, kegiatan, metode, tanggal, lokasi });
      hasil.push({ tanggal: formatDate(tanggal), ...r.assessment });
    } catch (_e) {
      // lewati tanggal yang gagal dihitung, jangan hentikan seluruh pencarian
    }
  }
  return hasil.sort((a, b) => b.composite_score - a.composite_score);
}
