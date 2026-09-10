import { supabase } from '../../lib/supabase';
import { QUALITY_RANK } from './shared';
import { hitungAdatJawa } from '../../traditions/jawa/pancasuda';
import { hitungAbuMasyar } from '../../traditions/classical/abuMasyarHari';

export async function getActivityTypes() {
  const { data, error } = await supabase
    .from('activity_types')
    .select('id, code, title, icon, description, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

function tentukanMetodePalingHatiHati(ditemukan) {
  return ditemukan.reduce(function (paling, kandidat) {
    return QUALITY_RANK[kandidat.quality_rating] < QUALITY_RANK[paling.quality_rating] ? kandidat : paling;
  });
}

export function gabungkanKesimpulan(hasilPerMetode) {
  const ditemukan = hasilPerMetode.filter(function (h) { return h.found; });
  if (ditemukan.length === 0) return null;

  const semuaSepakat = ditemukan.every(function (h) { return h.quality_rating === ditemukan[0].quality_rating; });
  const adaPantang = ditemukan.some(function (h) { return h.quality_rating === 'pantang'; });

  let quality_rating;
  let alasanSintesis;
  let sumberPenentu = null;

  if (semuaSepakat) {
    quality_rating = ditemukan[0].quality_rating;
    alasanSintesis = 'Semua metode (' + ditemukan.length + ') yang ditemukan sepakat: ' + quality_rating + '.';
  } else {
    const palingHatiHati = tentukanMetodePalingHatiHati(ditemukan);
    sumberPenentu = palingHatiHati.methodTitle;
    if (adaPantang) {
      quality_rating = 'pantang';
      alasanSintesis = 'Salah satu metode tradisional menyatakan pantang untuk tanggal ini; prinsip kehati-hatian diterapkan meski metode lain menyatakan berbeda.';
    } else {
      quality_rating = 'campuran';
      alasanSintesis = 'Metode-metode tradisional memberi penilaian berbeda untuk tanggal ini, tanpa ada yang menyatakan pantang.';
    }
  }

  return {
    quality_rating,
    semuaSepakat,
    adaPantang,
    sumberPenentu,
    alasanSintesis,
    rincianPerMetode: ditemukan.map(function (h) {
      return { methodCode: h.methodCode, methodTitle: h.methodTitle, quality_rating: h.quality_rating, confidenceStatus: h.confidenceStatus ?? null };
    }),
    jumlahMetodeDitemukan: ditemukan.length,
  };
}

export async function hitungKualitasHari(date, activityCode) {
  const [adatJawa, abuMasyar] = await Promise.all([
    hitungAdatJawa(date, activityCode),
    hitungAbuMasyar(date, activityCode),
  ]);
  const hasilPerMetode = [adatJawa, abuMasyar];
  const kesimpulan = gabungkanKesimpulan(hasilPerMetode);
  return { found: !!kesimpulan, kesimpulan, hasilPerMetode, pancasuda: adatJawa.pancasuda };
}

export async function simpanHasilHitungan(result, options) {
  const userId = (options && options.userId) || null;
  const locationId = (options && options.locationId) || null;
  if (!result || !result.found) return null;
  const pancasuda = result.pancasuda;
  const kesimpulan = result.kesimpulan;
  const hasilPerMetode = result.hasilPerMetode;
  const dasar = hasilPerMetode.find(function (h) { return h.found; });

  const { data, error } = await supabase
    .from('day_calculation_runs')
    .insert({
      user_id: userId,
      activity_type_id: dasar.activityType.id,
      method_id: dasar.method.id,
      planned_date: pancasuda.dateISO,
      location_id: locationId,
      pasaran_result: pancasuda.pasaran,
      weton_result: pancasuda.hari + ' ' + pancasuda.pasaran,
      quality_rating: kesimpulan.quality_rating,
      result_json: {
        kesimpulan: kesimpulan,
        hasilPerMetode: hasilPerMetode.map(function (h) {
          return { methodCode: h.methodCode, found: h.found, quality_rating: h.quality_rating, confidenceStatus: h.confidenceStatus ?? null, rule_key: h.rule_key };
        }),
      },
      disclaimer_shown: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
