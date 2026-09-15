import { supabase } from '../supabase';

function toISODate(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return null;
  }

  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function normalizeReasons(reasons) {
  if (!reasons) return [];

  if (Array.isArray(reasons)) {
    return reasons.map(String);
  }

  if (typeof reasons === 'object') {
    return Object.entries(reasons).map(([key, value]) => {
      if (typeof value === 'boolean') {
        return `${key}: ${value ? 'Ya' : 'Tidak'}`;
      }

      return `${key}: ${String(value)}`;
    });
  }

  return [String(reasons)];
}

export async function evaluateAkadDate({
  namaPria,
  namaAyahPria = '',
  namaIbuPria,
  tglPria,
  namaWanita,
  namaAyahWanita = '',
  namaIbuWanita,
  tglWanita,
  plannedAkadDate,
  plannedAkadTime = null,
  tanggalMulai = null,
  tanggalSelesai = null,
  timezone = 'Asia/Jakarta',
  locationText = '',
}) {
  const plannedISO = toISODate(plannedAkadDate);

  if (!plannedISO) {
    throw new Error('Tanggal rencana akad wajib dipilih.');
  }

  const startDate = tanggalMulai || plannedAkadDate;
  const endDate = tanggalSelesai || addDays(plannedAkadDate, 60);

  const startISO = toISODate(startDate);
  const endISO = toISODate(endDate);

  if (!startISO || !endISO) {
    throw new Error('Rentang tanggal akad tidak valid.');
  }

  if (startISO > endISO) {
    throw new Error(
      'Tanggal mulai pencarian tidak boleh lebih besar dari tanggal selesai.'
    );
  }

  const diffDays =
    Math.round(
      (endDate.getTime() - startDate.getTime()) / 86400000
    ) + 1;

  if (diffDays > 366) {
    throw new Error('Rentang pencarian maksimal 366 hari.');
  }

  const { data, error } = await supabase.functions.invoke(
    'calculate-akad-date-v2',
    {
      body: {
        nama_pria: namaPria.trim(),
        nama_ayah_pria: namaAyahPria.trim() || null,
        nama_ibu_pria: namaIbuPria.trim(),
        tanggal_lahir_pria: toISODate(tglPria),

        nama_wanita: namaWanita.trim(),
        nama_ayah_wanita: namaAyahWanita.trim() || null,
        nama_ibu_wanita: namaIbuWanita.trim(),
        tanggal_lahir_wanita: toISODate(tglWanita),

        planned_akad_date: plannedISO,
        planned_akad_time: plannedAkadTime || null,

        tanggal_mulai: startISO,
        tanggal_selesai: endISO,

        timezone,
        location_text: locationText.trim() || null,
      },
    }
  );

  if (error) {
    console.error('calculate-akad-date-v2 error:', error);

    let serverError = null;

    try {
      if (error.context) {
        const response = error.context.clone
          ? error.context.clone()
          : error.context;

        const contentType =
          response.headers?.get?.('content-type') || '';

        if (contentType.includes('application/json')) {
          const body = await response.json();
          serverError =
            body?.error ||
            body?.message ||
            JSON.stringify(body);
        } else {
          serverError = await response.text();
        }
      }
    } catch (detailError) {
      console.warn(
        'Tidak dapat membaca detail error Edge Function:',
        detailError
      );
    }

    const detail =
      serverError ||
      error.message ||
      'Gagal menjalankan mesin evaluasi tanggal akad.';

    console.error(
      'calculate-akad-date-v2 DETAIL:',
      detail
    );

    throw new Error(String(detail));
  }

  if (!data) {
    throw new Error(
      'Server tidak mengembalikan hasil evaluasi tanggal akad.'
    );
  }

  return {
    ...data,

    plannedDate: data.planned_date || null,

    recommendations: Array.isArray(data.recommendations)
      ? data.recommendations.map((candidate) => ({
          ...candidate,
          reasons: normalizeReasons(candidate.reasons),
        }))
      : [],

    metadata: data.metadata || {},

    inputs: {
      namaPria,
      namaAyahPria,
      namaIbuPria,
      tglPria: toISODate(tglPria),

      namaWanita,
      namaAyahWanita,
      namaIbuWanita,
      tglWanita: toISODate(tglWanita),

      plannedAkadDate: plannedISO,
      plannedAkadTime,
      tanggalMulai: startISO,
      tanggalSelesai: endISO,
      timezone,
      locationText,
    },
  };
}

// Alias baru untuk pemanggil lama.
// Tidak lagi menjalankan mesin kecocokan pasangan.
export async function engineAkadNikah(params) {
  return evaluateAkadDate(params);
}
