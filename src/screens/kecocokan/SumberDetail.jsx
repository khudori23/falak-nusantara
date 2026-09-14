import React from 'react';

// 2026-09: toggle "detail sumber" (confidence_status, nama sumber, dll) dimatikan
// dari tampilan sesuai permintaan — datanya TIDAK dihapus dari Supabase/backend,
// komponen ini cuma tidak lagi merender apa pun ke layar.
// Kalau suatu saat mau dimunculkan lagi (mis. mode "developer"/"praktisi"),
// tinggal kembalikan isi lama dari git history file ini.
export default function SumberDetail() {
  return null;
}
