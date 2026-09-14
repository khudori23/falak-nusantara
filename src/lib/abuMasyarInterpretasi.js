import { RULE_STATUS, ruleMeta } from './ruleStatus';

// EDUKATIF/INTERPRETATIF — BUKAN "hari baik nikah menurut Abu Ma'syar" (itu tidak ada di kitab manapun).
// Yang ditampilkan: planet penguasa hari (urutan Kaldea klasik) + watak singkatnya,
// dengan label jelas bahwa kaitan ke "cocok untuk nikah" adalah ekstrapolasi modern.

const PENGUASA_HARI = {
  minggu: { planet: 'Syams (Matahari)', watak: 'kekuasaan, kehormatan, vitalitas' },
  senin: { planet: 'Qamar (Bulan)', watak: 'perasaan, perubahan, kesuburan' },
  selasa: { planet: 'Mirrikh (Mars)', watak: 'keberanian, konflik, energi' },
  rabu: { planet: "Athärid (Merkurius)", watak: 'komunikasi, perdagangan, kecerdikan' },
  kamis: { planet: 'Al-Musytari (Jupiter)', watak: 'keberuntungan, hukum, kebijaksanaan' },
  jumat: { planet: 'Zuhroh (Venus)', watak: 'cinta, keindahan, kelembutan — sering diasosiasikan (bukan disebut eksplisit di kitab) cocok untuk pernikahan' },
  sabtu: { planet: 'Zuhal (Saturnus)', watak: 'keterbatasan, kesabaran, hal berat' },
};

export function interpretasiPlanetHari(hariNama) {
  const info = PENGUASA_HARI[hariNama];
  if (!info) return null;
  return {
    ...info,
    disclaimer: 'Ini interpretasi/ekstrapolasi dari watak planet klasik, bukan kutipan langsung dari kitab Abu Ma\'syar yang beredar di Nusantara — kitab tersebut tidak memuat tabel "hari baik untuk nikah".',
    _rule: ruleMeta(RULE_STATUS.TRADITIONAL_LOCAL, 'Astrologi Helenistik/Kaldea klasik, diadaptasi', 'Interpretive, bukan literal kitab.'),
  };
}
