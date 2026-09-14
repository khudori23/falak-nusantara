import { supabase } from '../supabase';
import { hitungWeton } from '../weton';
import { hitungAbjad } from '../abjad';

export async function engineAkadNikah({ tglPria, tglWanita, namaPria, namaIbuPria, namaWanita, namaIbuWanita }) {
  const wetonPria = hitungWeton(tglPria);
  const wetonWanita = hitungWeton(tglWanita);

  const abjadPria = hitungAbjad(namaPria);
  const abjadWanita = hitungAbjad(namaWanita);
  const abjadIbuPria = hitungAbjad(namaIbuPria);
  const abjadIbuWanita = hitungAbjad(namaIbuWanita);

  const { data, error } = await supabase.rpc('fn_kecocokan_akad_nikah', {
    p_nweton_pria: wetonPria.totalNeptu,
    p_nweton_wanita: wetonWanita.totalNeptu,
    p_vnama_pria: abjadPria.total,
    p_vnama_wanita: abjadWanita.total,
    p_vibu_pria: abjadIbuPria.total,
    p_vibu_wanita: abjadIbuWanita.total,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Server tidak mengembalikan hasil perhitungan.');

  const jodohBaik = [2, 5, 7].includes(row.jodoh_r);
  const no23Baik = row.no23_status === 'baik';
  const adaHariBersama = (row.hari_baik_bersama?.length ?? 0) > 0;

  let status;
  if (no23Baik && jodohBaik && adaHariBersama) {
    status = 'SANGAT DIREKOMENDASIKAN';
  } else if (no23Baik && jodohBaik) {
    status = 'DIREKOMENDASIKAN';
  } else if (no23Baik || jodohBaik) {
    status = 'CUKUP BAIK';
  } else {
    status = 'PERLU DIPERTIMBANGKAN';
  }

  return {
    inputs: { wetonPria, wetonWanita, abjadPria, abjadWanita, abjadIbuPria, abjadIbuWanita },
    no22: { r: row.no22_r, label: row.no22_label, makna: row.no22_makna },
    no23: { r: row.no23_r, label: row.no23_label, status: row.no23_status },
    jodoh: { r: row.jodoh_r, makna: row.jodoh_makna, baik: jodohBaik },
    burujPria: { r: row.buruj_pria_r, nama: row.buruj_pria, hariBaik: row.buruj_pria_hari || [] },
    burujWanita: { r: row.buruj_wanita_r, nama: row.buruj_wanita, hariBaik: row.buruj_wanita_hari || [] },
    hariBaikBersama: row.hari_baik_bersama || [],
    status,
  };
}
