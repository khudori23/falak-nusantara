import { hitungWeton } from './weton';
import { UNSUR_HARI } from './dayUnsur';
import { salakiRabiDariNeptu } from '../traditions/jawa/petungSalakiRabi';
import { kecocokanWeton } from './wetonJodoh';
import { kecocokanWedal } from './wedalSunda';
import { hitungAbjad } from './abjad';

function skorDariKualitas(kualitas) {
  return kualitas === 'baik' ? 85 : 45;
}

export function hitungPerjodohanLengkap(namaA, namaB, tanggalA, tanggalB, metode) {
  const wetonA = hitungWeton(tanggalA);
  const wetonB = hitungWeton(tanggalB);
  const unsurA = UNSUR_HARI[wetonA.hari];
  const unsurB = UNSUR_HARI[wetonB.hari];
  const abjadA = hitungAbjad(namaA);
  const abjadB = hitungAbjad(namaB);

  const hariLahir = metode === 'sunda'
    ? kecocokanWedal(wetonA.hari, wetonB.hari)
    : kecocokanWeton(wetonA.totalNeptu, wetonB.totalNeptu);

  const unsurSama = unsurA.unsur === unsurB.unsur;
  const unsurSkor = unsurSama ? 85 : 60;

  const diffAbjad = Math.abs(abjadA.total - abjadB.total);
  const maxAbjad = Math.max(abjadA.total, abjadB.total, 1);
  const abjadSkor = Math.round((1 - Math.min(diffAbjad / maxAbjad, 1)) * 100);

  const hariSkor = skorDariKualitas(hariLahir.kualitas);
  const persentase = Math.round((hariSkor + unsurSkor + abjadSkor) / 3);

  const rezekiGabungan = salakiRabiDariNeptu(wetonA.totalNeptu + wetonB.totalNeptu);

  return {
    wetonA, wetonB, unsurA, unsurB, abjadA, abjadB,
    hariLahir,
    unsur: {
      sama: unsurSama,
      deskripsi: unsurSama
        ? `Sama-sama unsur ${unsurA.unsur} — cenderung lebih mudah saling memahami karena berbagi karakter dasar yang serupa.`
        : `Unsur ${unsurA.unsur} bertemu unsur ${unsurB.unsur} — perlu penyesuaian lebih, namun perbedaan karakter juga bisa saling melengkapi.`,
    },
    persentase,
    rezekiGabungan,
    penjelasan: hariLahir.deskripsi,
    saran: hariLahir.saran,
    nasehat: hariLahir.kualitas === 'kurang' ? hariLahir.nasehat : null,
  };
}
