#!/data/data/com.termux/files/usr/bin/bash
echo "== Kecocokan Unsur Hari (Gambar 1) =="
grep -rl "Kecocokan Unsur Hari" src/ 2>/dev/null
echo ""
echo "== Toggle detail sumber (Gambar 2, 5, 6) =="
grep -rl "Sembunyikan detail sumber\|Lihat detail sumber" src/ 2>/dev/null
echo ""
echo "== Sunda-Naktu & Sunda-Repok (Gambar 3, 4) =="
grep -rl "Sunda – Naktu\|Sunda – Repok\|Sedang diaudit" src/ 2>/dev/null
echo ""
echo "== Hub halaman Petung/Hitungan Hari (Gambar 7) =="
grep -rl "Menjaga tradisi, merawat cinta" src/ 2>/dev/null
echo ""
echo "== Abjad & Raml (Gambar 5, 6) =="
grep -rl "Abjad & Raml\|Fasal Menghitung Jodoh" src/ 2>/dev/null
