#!/bin/bash
URL="https://zwaziqlhiotcmkqgxtsl.supabase.co/functions/v1/calculate-hari-baik-usaha"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXppcWxoaW90Y21rcWd4dHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1ODkxMzMsImV4cCI6MjEwNDE2NTEzM30.DztA04Caqv7mvdxmWutqzbPgL2xm_95GpUJtsRh-Nco"
DATE="2026-09-15"

for ACT in TANAM_BUAH TANAM_UMBI PANEN SIMPAN_LUMBUNG TERNAK BANGUN_RUMAH BANGUN_TEMPAT_USAHA BERDAGANG BERLAYAR; do
  echo "=== $ACT ==="
  curl -s -X POST "$URL" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"date\":\"$DATE\",\"activity_code\":\"$ACT\"}" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); b=d['breakdown']; print('composite:', d['data']['composite_score'], '| sunda:', b['sunda']['score'], b['sunda']['formula_mode'], '| abu:', b['abu_masyar']['score'], f\"w={b['abu_masyar']['weight_element']}/{b['abu_masyar']['weight_lunar']}\")"
  echo
done
