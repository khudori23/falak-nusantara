// Orkestrator multi-engine Perjodohan.
// PRINSIP: setiap tradisi/metode dihitung TERPISAH dan ditampilkan apa adanya —
// TIDAK digabung jadi satu skor/persentase (lihat catatan riset: bobot gabungan
// adalah karangan modern, bukan bobot yang diberikan sumber tradisional).
import { hitungWeton } from './weton';
import { kecocokanWeton } from './wetonJodoh';
import { salakiRabiDariNeptu } from './petungSalakiRabi';
import { kecocokanWedal } from './wedalSunda';
import { hitungAbjad } from './abjad';
import { UNSUR_HARI, buatNarasiUnsurHari } from './dayUnsur';
import { fasalJodohAbuMasyar } from './abuMasyarRaml';
import { kecocokanNaktuHariLahir } from './sundaNaktu';

export function hitungSemuaEngine(namaA, namaB, tanggalA, tanggalB) {
  const wetonA = hitungWeton(tanggalA);
  const wetonB = hitungWeton(tanggalB);
  const unsurA = UNSUR_HARI[wetonA.hari];
  const unsurB = UNSUR_HARI[wetonB.hari];
  const abjadA = hitungAbjad(namaA);
  const abjadB = hitungAbjad(namaB);

  const salaki = salakiRabiDariNeptu(wetonA.totalNeptu + wetonB.totalNeptu);
  const unsurSama = unsurA.unsur === unsurB.unsur;
  const naktu = kecocokanNaktuHariLahir(wetonA.totalNeptu, wetonB.totalNeptu);
  // Konvensi: A = pihak pria, B = pihak wanita (mengikuti kalkulator jodoh yang sudah ada)
  const narasiUnsur = buatNarasiUnsurHari({
    hariPria: wetonA.hari, unsurPria: unsurA,
    hariWanita: wetonB.hari, unsurWanita: unsurB,
    sama: unsurSama,
  });

  return [
    {
      id: 'jawa_weton_8siklus',
      tradition: 'Jawa',
      metode: 'Weton — 8 Siklus',
      hasil: kecocokanWeton(wetonA.totalNeptu, wetonB.totalNeptu),
      meta: { wetonA, wetonB },
      confidence: 'VERIFIED_ACADEMIC',
      sumber: 'Primbon Jawa — Petung Neptu 8 Siklus',
    },
    {
      id: 'jawa_salaki_rabi',
      tradition: 'Jawa',
      metode: 'Petung Salaki Rabi (Rezeki & Nasib)',
      hasil: { nama: salaki.nama, kualitas: salaki.kualitas, deskripsi: salaki.desc },
      meta: { totalNeptuGabungan: wetonA.totalNeptu + wetonB.totalNeptu },
      confidence: 'VERIFIED_ACADEMIC',
      sumber: 'Hartono, "Petung dalam Primbon Jawa"',
    },
    {
      id: 'wedal_jawa_sunda',
      tradition: 'Wedal (akulturasi Jawa–Sunda)',
      metode: 'Kecocokan Hari Lahir',
      hasil: kecocokanWedal(wetonA.hari, wetonB.hari),
      meta: {},
      confidence: 'UNVERIFIED',
      sumber: 'Primbon Jodoh Sunda (populer) — bukan Kolénjér Baduy; nilai berbagi akar dgn Saptawara Jawa',
    },
    {
      id: 'sunda_naktu_hari',
      tradition: 'Sunda',
      metode: 'Naktu — Hari Lahir',
      hasil: { nama: naktu.nama, kualitas: naktu.kualitas, deskripsi: naktu.deskripsi },
      meta: { jumlah: naktu.jumlah, sisa: naktu.sisa },
      confidence: naktu.confidence,
      sumber: naktu.sumber,
    },
    {
      id: 'unsur_hari_jawa',
      tradition: 'Jawa',
      metode: 'Kecocokan Unsur Hari',
      hasil: {
        nama: unsurSama ? `Sama-sama Unsur ${unsurA.unsur}` : `Unsur ${unsurA.unsur} × ${unsurB.unsur}`,
        kualitas: unsurSama ? 'baik' : 'netral',
        deskripsi: narasiUnsur,
      },
      meta: { unsurA, unsurB },
      confidence: 'UNVERIFIED',
      sumber: 'Ringkasan primbon umum',
    },
    {
      id: 'abu_masyar_raml',
      tradition: "Abu Ma'syar",
      metode: 'Fasal Menghitung Jodoh (Raml)',
      hasil: fasalJodohAbuMasyar(abjadA.total, abjadB.total),
      meta: { abjadA, abjadB },
      confidence: 'VERIFIED_PRIMARY',
      sumber: 'Terjemah Abu Mashar Al-Falaki — Fasal Menghitung Jodoh',
    },
  ];
}

export function ringkasanLintasTradisi(semuaEngine) {
  const baik = semuaEngine.filter((e) => e.hasil.kualitas === 'baik').length;
  const kurang = semuaEngine.filter((e) => e.hasil.kualitas === 'kurang').length;
  const total = semuaEngine.length;
  const narasi =
    `Dari ${total} metode yang dihitung, ${baik} metode menunjukkan kecenderungan baik dan ${kurang} ` +
    `metode memberi catatan yang perlu diperhatikan. Setiap tradisi berdiri dengan dasar perhitungannya ` +
    `sendiri — hasil yang berbeda antar-metode bukan berarti salah satunya keliru, melainkan cara pandang ` +
    `budaya yang berbeda. Gunakan sebagai bahan refleksi bersama, bukan vonis pasti.`;
  return { baik, kurang, netral: total - baik - kurang, total, narasi };
}
