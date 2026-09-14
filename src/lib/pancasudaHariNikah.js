import { RULE_STATUS, ruleMeta } from './ruleStatus';
import { neptuTanggalKandidat, tanggalHijriahApprox } from './neptuHarian';

// Adapter — SESUAIKAN ke bentuk return asli hitungWeton() di weton.js Anda.
// Contoh asumsi saat ini: hitungWeton(date) -> { hari, pasaran, neptuHari, neptuPasaran, neptuTotal }
function _adaptWeton(hasilHitungWeton) {
  return hasilHitungWeton.neptuTotal; // <-- ganti kalau nama field beda
}

const HASIL_PANCASUDA = {
  1: { nama: 'Sri', baik: true, arti: 'kemakmuran, rezeki' },
  2: { nama: 'Lungguh', baik: true, arti: 'kedudukan, jabatan baik' },
  3: { nama: 'Gedhong', baik: true, arti: 'harta, rumah, kekayaan' },
  4: { nama: 'Lara', baik: false, arti: 'sering sakit/kesulitan' },
  0: { nama: 'Pati', baik: false, arti: 'kematian/musibah — dihindari' },
};

// Bulan pantang & bulan baik — VERIFIED_ACADEMIC (Betaljemur Adammakna hlm. ~8-21)
const BULAN_PANTANG_TANGGAL = { 1: [1, 6, 11, 17, 27] }; // Suro (bulan Hijriah #1)
const BULAN_DIREKOMENDASIKAN = [11, 12]; // Apit (Dzulqa'dah), Besar (Dzulhijjah)

export function cekBulanNikah(date) {
  const h = tanggalHijriahApprox(date);
  const pantangTanggal = BULAN_PANTANG_TANGGAL[h.bulan] || [];
  let ditolak = false;
  let alasan = null;

  if (pantangTanggal.includes(h.tanggal)) {
    ditolak = true;
    alasan = `Tanggal ${h.tanggal} ${h.namaBulan} termasuk hari pantang di bulan Suro.`;
  }
  // Kasus khusus: 14 Suro dianggap pantang HANYA jika jatuh Rabu Pahing
  if (h.bulan === 1 && h.tanggal === 14) {
    const c = neptuTanggalKandidat(date);
    if (c.hari === 'rabu' && c.pasaran === 'pahing') {
      ditolak = true;
      alasan = '14 Suro jatuh pada Rabu Pahing — dipantang.';
    }
  }

  const direkomendasikan = BULAN_DIREKOMENDASIKAN.includes(h.bulan);
  return {
    hijriah: h,
    ditolak,
    alasan,
    direkomendasikan,
    catatanBulan: direkomendasikan
      ? `Bulan ${h.namaBulan} dianggap membawa keberkahan.`
      : null,
    _rule: ruleMeta(RULE_STATUS.VERIFIED_ACADEMIC, 'Betaljemur Adammakna (jilid Lukmanakim), hlm. ~8-21'),
  };
}

// Rumus B — Pancasuda: (neptu weton pria + neptu weton wanita + neptu hari kandidat) mod 5
export function pancasudaHariKandidat({ hitungWetonPria, hitungWetonWanita }, tanggalKandidat) {
  const neptuPria = _adaptWeton(hitungWetonPria);
  const neptuWanita = _adaptWeton(hitungWetonWanita);
  const kandidat = neptuTanggalKandidat(tanggalKandidat);
  const totalNeptu = neptuPria + neptuWanita + kandidat.neptuTotal;
  const sisa = totalNeptu % 5;
  const hasil = HASIL_PANCASUDA[sisa];

  return {
    tanggal: tanggalKandidat,
    neptuPria,
    neptuWanita,
    neptuKandidat: kandidat,
    totalNeptu,
    sisa,
    hasil,
    _rule: ruleMeta(RULE_STATUS.VERIFIED_ACADEMIC, 'Betaljemur Adammakna — Rumus Pancasuda/Pancajodho'),
  };
}

// Fungsi utama: cari tanggal baik dalam rentang, gabungkan filter bulan + rumus hari
export function cariHariNikahJawa({ hitungWetonPria, hitungWetonWanita }, tanggalMulai, tanggalSelesai) {
  const hasil = [];
  const cur = new Date(tanggalMulai);
  while (cur <= tanggalSelesai) {
    const bulanInfo = cekBulanNikah(cur);
    if (!bulanInfo.ditolak) {
      const pancasuda = pancasudaHariKandidat({ hitungWetonPria, hitungWetonWanita }, new Date(cur));
      hasil.push({
        tanggal: new Date(cur),
        layak: pancasuda.hasil.baik,
        pancasuda,
        bulanInfo,
      });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return hasil;
}
