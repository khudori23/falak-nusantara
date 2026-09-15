-- Migration: wedding_candidates
-- Menyimpan hasil Fase 2 (generator kandidat tanggal akad) per Bagian 15 dokumen.
-- Berelasi ke calculation_results (hasil Fase 1: mesin kecocokan).

create table if not exists public.wedding_candidates (
  id uuid primary key default gen_random_uuid(),
  calculation_result_id uuid not null references public.calculation_results(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  date date not null,
  weekday text not null,
  javanese_date jsonb,          -- { bulanJawaNama, tanggalJawa?, tahunJawa? } atau null kalau belum tersedia
  filters jsonb not null default '{}'::jsonb,   -- { hard_filter: 'PASS' | 'FAIL' }
  scores jsonb not null default '{}'::jsonb,    -- { abu_day_intersection_match: boolean, ... }
  status text not null,         -- Bagian 14: SANGAT DIREKOMENDASIKAN | DIREKOMENDASIKAN | CUKUP BAIK | PERLU DIPERTIMBANGKAN | TIDAK DIREKOMENDASIKAN
  reasons jsonb not null default '[]'::jsonb,   -- array string alasan (transparansi, Bagian 19.6)

  created_at timestamptz not null default now()
);

-- Satu kombinasi (calculation_result_id, date) cukup satu baris — hindari duplikat
-- kalau endpoint dipanggil ulang untuk rentang tanggal yang tumpang tindih.
create unique index if not exists wedding_candidates_unique_date
  on public.wedding_candidates (calculation_result_id, date);

create index if not exists wedding_candidates_user_id_idx
  on public.wedding_candidates (user_id);

create index if not exists wedding_candidates_calc_result_idx
  on public.wedding_candidates (calculation_result_id);

-- RLS: ownership per user_id, sama seperti calculation_logs
alter table public.wedding_candidates enable row level security;

create policy "wedding_candidates_select_own"
  on public.wedding_candidates for select
  using (auth.uid() = user_id);

create policy "wedding_candidates_insert_own"
  on public.wedding_candidates for insert
  with check (auth.uid() = user_id);

create policy "wedding_candidates_delete_own"
  on public.wedding_candidates for delete
  using (auth.uid() = user_id);

-- Tidak ada policy UPDATE: kandidat tanggal dianggap hasil hitung ulang
-- (generate baru), bukan diedit manual. Kalau nanti butuh re-run untuk
-- rentang yang sama, hapus baris lama dulu (delete) baru insert lagi,
-- atau ganti unique index di atas jadi upsert kalau perlu.
