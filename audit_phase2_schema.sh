#!/data/data/com.termux/files/usr/bin/bash

cd "$(dirname "$0")" || exit 1

echo "===== 1. MIGRATIONS ====="
find supabase/migrations -maxdepth 1 -type f -print | sort

echo
echo "===== 2. WEDDING CANDIDATES MIGRATION DENGAN NOMOR BARIS ====="
nl -ba supabase/migrations/20260915015004_create_wedding_candidates.sql

echo
echo "===== 3. SEMUA CREATE TABLE DI MIGRATION ====="
grep -RniE \
'^[[:space:]]*create table|^[[:space:]]*create table if not exists' \
supabase/migrations || true

echo
echo "===== 4. CALCULATION RESULTS ====="
grep -RniE \
'calculation_results|no22_r|no23_r|abu_jodoh|zodiac_a|zodiac_b|raw_result' \
supabase src \
--exclude='*.bak' \
--exclude='*.bak2' \
--exclude-dir=node_modules || true

echo
echo "===== 5. REFERENCE TABLES ====="
grep -RniE \
'reference|repok|betaljemur|abu.?jodoh|abu.?buruj|no22|no23' \
supabase/migrations supabase/functions src/lib \
--exclude='*.bak' \
--exclude='*.bak2' \
--exclude-dir=node_modules || true

echo
echo "===== 6. SUPABASE CONFIG ====="
if [ -f supabase/config.toml ]; then
  nl -ba supabase/config.toml
else
  echo "supabase/config.toml TIDAK ADA"
fi

echo
echo "===== 7. KALENDER JAWA ====="
nl -ba src/lib/kalenderJawa.js

echo
echo "===== 8. TEST / CHECKPOINT KALENDER ====="
grep -RniE \
'1936|1867|2052|Asapon|kalenderJawa|konversiMasehiKeJawa' \
. \
--exclude-dir=node_modules \
--exclude-dir=.git \
--exclude='*.bak' \
--exclude='*.bak2' \
--exclude='*.lock' || true

echo
echo "===== AUDIT SELESAI ====="
