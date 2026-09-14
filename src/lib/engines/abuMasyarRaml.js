// Engine: Abu Ma'syar - Fasal Menghitung Jodoh (Raml)
// Formula: (nilai_abjad_pria + nilai_abjad_wanita + 7) mod 9
// Nilai abjad diambil dari Supabase: abjad_letters (jumal kabir, sudah ada di DB Anda)
// PENTING: fungsi transliterasi nama Latin -> huruf hijaiyah BELUM saya kunci di sini.
// Kalau repo Anda sudah punya abjadUtils.ts (dipakai fitur Kepribadian), pakai fungsi
// transliterasi yang SAMA di sana supaya nilai abjad konsisten di seluruh app —
// jangan bikin logic transliterasi kedua yang berbeda hasil.
import { supabase } from '../supabase';

export async function hitungNilaiAbjad(nama, transliterasiKeArab) {
  const huruf = transliterasiKeArab(nama); // array huruf hijaiyah, mis. ['ا','ح','م','د']
  const { data, error } = await supabase
    .from('abjad_letters')
    .select('letter, value')
    .in('letter', huruf);
  if (error) throw error;
  const nilaiMap = Object.fromEntries(data.map(r => [r.letter, r.value]));
  return huruf.reduce((sum, h) => sum + (nilaiMap[h] || 0), 0);
}

export async function engineAbuMasyarRaml(namaPria, namaWanita, transliterasiKeArab) {
  const nilaiPria = await hitungNilaiAbjad(namaPria, transliterasiKeArab);
  const nilaiWanita = await hitungNilaiAbjad(namaWanita, transliterasiKeArab);
  const total = nilaiPria + nilaiWanita + 7;
  const sisa = total % 9 === 0 ? 9 : total % 9;

  const { data, error } = await supabase
    .from('compatibility_cycle_rules')
    .select('interpretation, confidence')
    .eq('method_code', 'abu_masyar_raml_jodoh')
    .eq('remainder', sisa)
    .single();
  if (error) throw error;

  return {
    tradition: 'abu_masyar',
    method: 'raml_jodoh',
    version: 'v1',
    inputs: { namaPria, namaWanita },
    calculation: { nilai_pria: nilaiPria, nilai_wanita: nilaiWanita, total, formula: '(pria+wanita+7) mod 9' },
    remainder: sisa,
    interpretation: data.interpretation,
    confidence: data.confidence,
    source: { ref: "Terjemah Abu Mashar Al-Falaki - Fasal Menghitung Jodoh (VERIFIED_PRIMARY)" },
  };
}
