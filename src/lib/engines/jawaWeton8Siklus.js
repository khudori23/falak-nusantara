// Engine: Jawa - Petung Jodoh 8 Siklus (Pegat/Ratu/Jodoh/Topo/Tinari/Padu/Sujanan/Pesthi)
// Formula: total neptu (hari+pasaran) kedua mempelai, (total-1) mod 8
// Data hasil siklus diambil dari Supabase: compatibility_cycle_rules WHERE method_code='jawa_weton_8siklus'
import { supabase } from '../supabase';

const NEPTU_HARI = { 0: 5, 1: 4, 2: 3, 3: 7, 4: 8, 5: 6, 6: 9 }; // getUTCDay(): 0=Minggu..6=Sabtu
const NEPTU_PASARAN = [5, 9, 7, 4, 8]; // index: Legi, Pahing, Pon, Wage, Kliwon
const NAMA_PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'];
const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const EPOCH = Date.UTC(1970, 0, 1); // 1 Jan 1970 = Kamis Wage (konsisten dgn epoch v10 Hari Usaha)
const WAGE_INDEX = 3;

export function hitungWeton(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  const daysSinceEpoch = Math.floor((d.getTime() - EPOCH) / 86400000);
  const dayIdx = d.getUTCDay();
  const pasaranIdx = (((daysSinceEpoch + WAGE_INDEX) % 5) + 5) % 5;
  return {
    hari: NAMA_HARI[dayIdx],
    pasaran: NAMA_PASARAN[pasaranIdx],
    neptu: NEPTU_HARI[dayIdx] + NEPTU_PASARAN[pasaranIdx],
  };
}

export async function engineJawaWeton8Siklus(tanggalPria, tanggalWanita) {
  const wetonPria = hitungWeton(tanggalPria);
  const wetonWanita = hitungWeton(tanggalWanita);
  const total = wetonPria.neptu + wetonWanita.neptu;
  const sisa = ((total - 1) % 8) + 1;

  const { data, error } = await supabase
    .from('compatibility_cycle_rules')
    .select('symbol, interpretation, confidence')
    .eq('method_code', 'jawa_weton_8siklus')
    .eq('remainder', sisa)
    .single();

  if (error) throw error;

  return {
    tradition: 'jawa',
    method: 'weton_8siklus',
    version: 'v1',
    inputs: { weton_pria: wetonPria, weton_wanita: wetonWanita },
    calculation: { total_neptu: total, formula: '(total-1) mod 8' },
    remainder: sisa,
    symbol: data.symbol,
    interpretation: data.interpretation,
    confidence: data.confidence,
    source: { ref: 'Primbon Jawa - Petung Neptu 8 Siklus (VERIFIED_ACADEMIC)' },
  };
}
