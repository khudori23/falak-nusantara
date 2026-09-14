import { RULE_STATUS, ruleMeta } from './ruleStatus';

// INFO-ONLY — tidak ada kalkulasi otomatis untuk Sunda soal hari nikah.
// Alasan: 3 lapis sumber Sunda punya keandalan sangat berbeda, jangan dipaksa jadi satu rumus.
export const LAPIS_SUNDA_HARI_NIKAH = [
  {
    id: 'naktu-populer',
    judul: 'Naktu/Neptu ala-Sunda (populer)',
    isi: 'Rumus mirip Jawa (Sri/Dana/Lara/Pati/Lungguh) dengan label "Sunda". Kemungkinan besar re-label sistem Jawa, bukan sistem Sunda otentik.',
    bisaDihitung: false,
    _rule: ruleMeta(RULE_STATUS.UNVERIFIED, 'Sumber populer, tanpa rujukan naskah eksplisit',
      'Sengaja tidak diimplementasikan sebagai "hasil Sunda" untuk hindari klaim palsu.'),
  },
  {
    id: 'kolenjer',
    judul: 'Kolenjer (Baduy/Sunda asli)',
    isi: '10 alat kalender adat fungsi-spesifik. Rumus & tabel nilai dirahasiakan kokolot adat — tidak ada versi terbuka yang bisa diverifikasi publik.',
    bisaDihitung: false,
    _rule: ruleMeta(RULE_STATUS.TRADITIONAL_LOCAL, 'Tradisi lisan, dijaga ahli adat',
      'Tidak dapat diimplementasikan karena rumus tidak dipublikasikan.'),
  },
  {
    id: 'paririmbon',
    judul: 'Paririmbon Sunda (naskah, ed. Suryaatmana dkk. 1992)',
    isi: 'Memuat neptu Sunda sendiri & naas bulanan, tapi rujukan khusus hari-nikah belum terdokumentasi selengkap versi Jawa.',
    bisaDihitung: false,
    _rule: ruleMeta(RULE_STATUS.UNVERIFIED, 'Paririmbon Sunda ed. 1992',
      'Ada naskah asli, tapi bagian hari-nikah spesifik belum cukup terverifikasi untuk dijadikan rumus.'),
  },
];

export function infoSundaHariNikah() {
  return LAPIS_SUNDA_HARI_NIKAH;
}
