// Jadwal Sholat via Aladhan API, method=20 (Kementerian Agama Republik
// Indonesia — Fajr 20°, Isha 18°, standar resmi Bimas Islam Kemenag).
// Tidak butuh API key, terima lat/lon langsung, otomatis handle timezone
// WIB/WITA/WIT berdasarkan koordinat.

const ALADHAN_METHOD_KEMENAG = 20;

function formatDateForAladhan(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function stripTimezoneSuffix(value) {
  return (value || '').split(' ')[0];
}

export async function getJadwalSholat({ latitude, longitude, date = new Date() }) {
  if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
    throw new Error('Lokasi belum tersedia untuk menghitung jadwal sholat.');
  }

  const dateStr = formatDateForAladhan(date);
  const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${ALADHAN_METHOD_KEMENAG}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Gagal mengambil jadwal sholat dari server.');
  const json = await res.json();
  if (json.code !== 200 || !json.data?.timings) {
    throw new Error(json.data?.message || 'Gagal mengambil jadwal sholat.');
  }

  const t = json.data.timings;
  return {
    imsak: stripTimezoneSuffix(t.Imsak),
    subuh: stripTimezoneSuffix(t.Fajr),
    terbit: stripTimezoneSuffix(t.Sunrise),
    dzuhur: stripTimezoneSuffix(t.Dhuhr),
    ashar: stripTimezoneSuffix(t.Asr),
    maghrib: stripTimezoneSuffix(t.Maghrib),
    isya: stripTimezoneSuffix(t.Isha),
    timezone: json.data.meta?.timezone ?? null,
    dateStr,
  };
}

export const PRAYER_ORDER = [
  { key: 'subuh', label: 'Subuh' },
  { key: 'terbit', label: 'Terbit' },
  { key: 'dzuhur', label: 'Dzuhur' },
  { key: 'ashar', label: 'Ashar' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isya', label: 'Isya' },
];

function toMinutes(hhmm) {
  const [h, m] = (hhmm || '0:0').split(':').map(Number);
  return h * 60 + m;
}

// Sholat wajib berikutnya (Terbit dikecualikan karena bukan waktu sholat wajib).
export function getNextPrayer(jadwal) {
  if (!jadwal) return null;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const wajib = PRAYER_ORDER.filter((p) => p.key !== 'terbit');

  for (const p of wajib) {
    const mins = toMinutes(jadwal[p.key]);
    if (mins > nowMinutes) {
      return { ...p, time: jadwal[p.key], minutesUntil: mins - nowMinutes };
    }
  }

  const subuhMins = toMinutes(jadwal.subuh);
  return { key: 'subuh', label: 'Subuh (besok)', time: jadwal.subuh, minutesUntil: 24 * 60 - nowMinutes + subuhMins };
}
