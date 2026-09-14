import { cariHariNikahJawa } from './pancasudaHariNikah';
import { infoSundaHariNikah } from './sundaHariNikahInfo';
import { interpretasiPlanetHari } from './abuMasyarInterpretasi';
import { neptuTanggalKandidat } from './neptuHarian';

// Assembler — SENGAJA tidak menggabungkan 3 tradisi jadi satu skor.
export function cariTanggalNikah({ hitungWetonPria, hitungWetonWanita }, tanggalMulai, tanggalSelesai) {
  const jawa = cariHariNikahJawa({ hitungWetonPria, hitungWetonWanita }, tanggalMulai, tanggalSelesai);
  const sunda = infoSundaHariNikah(); // statis, tidak per-tanggal

  const abuMasyarPerTanggal = jawa.map((item) => {
    const kandidat = neptuTanggalKandidat(item.tanggal);
    return {
      tanggal: item.tanggal,
      interpretasi: interpretasiPlanetHari(kandidat.hari),
    };
  });

  return { jawa, sunda, abuMasyar: abuMasyarPerTanggal };
}
