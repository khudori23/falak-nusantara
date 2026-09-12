import { supabase } from './supabase';

// Taksonomi disederhanakan jadi 9 activity_code datar sesuai kontrak
// backend v10 (Master Prompt). Kategori di bawah cuma pengelompokan UI,
// TIDAK dikirim ke API.
export const KATEGORI_USAHA = [
  { value: 'PERTANIAN', label: 'Bercocok Tanam' },
  { value: 'PETERNAKAN', label: 'Peternakan' },
  { value: 'PEMBANGUNAN', label: 'Pembangunan' },
  { value: 'PERNIAGAAN', label: 'Berdagang & Berlayar' },
];

export const KEGIATAN_PER_KATEGORI = {
  PERTANIAN: [
    { value: 'TANAM_BUAH', label: 'Tanam Buah-buahan' },
    { value: 'TANAM_UMBI', label: 'Tanam Umbi / Palawija' },
    { value: 'PANEN', label: 'Panen' },
    { value: 'SIMPAN_LUMBUNG', label: 'Simpan Hasil ke Lumbung' },
  ],
  PETERNAKAN: [
    { value: 'TERNAK', label: 'Kegiatan Ternak' },
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

export const GRADE_LABEL = {
  SANGAT_BAIK: 'Sangat Baik',
  NETRAL: 'Netral',
  HINDARI: 'Sebaiknya Dihindari',
};

export function gradeColor(colors, grade) {
  switch (grade) {
    case 'SANGAT_BAIK':
      return { bg: colors.successSoft, fg: colors.success };
    case 'NETRAL':
      return { bg: colors.primarySoft, fg: colors.primary };
    case 'HINDARI':
      return { bg: colors.dangerSoft, fg: colors.danger };
    default:
      return { bg: colors.surface, fg: colors.textSecondary };
  }
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

export async function hitungHariUsaha({ activityCode, tanggal, lokasi }) {
  const { data, error } = await supabase.functions.invoke('calculate-hari-baik-usaha', {
    body: {
      activity_code: activityCode,
      date: formatDate(tanggal),
      ...(lokasi ? { latitude: lokasi.lat, longitude: lokasi.lng } : {}),
    },
  });
  if (error) throw new Error(error.message || 'Gagal menghubungi mesin penghitung.');
  if (data?.meta?.status === 'error') throw new Error(data.error?.message || 'Gagal menghitung hari baik.');
  return data;
}

export async function cariHariTerbaik({ activityCode, mulai, jumlahHari, lokasi }) {
  const hasil = [];
  for (let i = 0; i < jumlahHari; i++) {
    const tanggal = new Date(mulai);
    tanggal.setDate(tanggal.getDate() + i);
    try {
      const r = await hitungHariUsaha({ activityCode, tanggal, lokasi });
      hasil.push({
        tanggal: formatDate(tanggal),
        ...r.data,
        spatial_advice: r.spatial_advice,
        breakdown: r.breakdown,
      });
    } catch (_e) {
      // lewati tanggal yang gagal dihitung, jangan hentikan seluruh pencarian
    }
  }
  return hasil.sort((a, b) => b.composite_score - a.composite_score);
}
