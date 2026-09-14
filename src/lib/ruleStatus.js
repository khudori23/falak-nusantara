// Status keandalan sumber untuk setiap rule — dipakai lintas modul Hitungan Hari & Perjodohan.
// Kalau project sudah punya file serupa (dari kerjaan Hitungan Hari), GABUNGKAN manual, jangan dobel import.
export const RULE_STATUS = {
  VERIFIED_PRIMARY: 'VERIFIED_PRIMARY',       // langsung dari naskah asli, halaman jelas
  VERIFIED_ACADEMIC: 'VERIFIED_ACADEMIC',     // dirujuk studi akademik/terbit resmi
  SUPPORTED_SECONDARY: 'SUPPORTED_SECONDARY', // sumber sekunder tapi konsisten
  TRADITIONAL_LOCAL: 'TRADITIONAL_LOCAL',     // tradisi lisan/lokal, tak ada naskah terbuka
  UNVERIFIED: 'UNVERIFIED',                   // belum ada rujukan kuat
  CONFLICTING: 'CONFLICTING',                 // sumber saling bertentangan
  DEPRECATED: 'DEPRECATED',                   // sudah tidak dipakai, disimpan untuk riwayat
};

export function ruleMeta(status, sourceLabel, note) {
  return { status, sourceLabel, note: note || null };
}
