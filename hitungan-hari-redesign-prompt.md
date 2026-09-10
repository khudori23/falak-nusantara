# FALAK NUSANTARA
# SURGICAL REDESIGN — HALAMAN "HITUNGAN HARI"

## INSTRUKSI PALING PENTING

JANGAN MEMBUAT APLIKASI BARU.
JANGAN MEMBUAT HALAMAN "HITUNGAN HARI" DARI NOL.
JANGAN MENGHAPUS IMPLEMENTASI LAMA.
JANGAN MENGUBAH ROUTING APLIKASI.
JANGAN MENGUBAH HALAMAN LAIN.
JANGAN MERUSAK NAVIGASI YANG SUDAH ADA.

Lakukan SURGICAL REDESIGN hanya terhadap halaman:
"Hitungan Hari"

Gunakan komponen, state management, utility, theme, navigation,
dan calculation engine yang SUDAH ADA sejauh masih kompatibel.

Tujuan kita adalah meningkatkan halaman yang sekarang menjadi
pengalaman kalkulasi tradisional yang benar-benar menghasilkan
jawaban berdasarkan data dan formula, bukan sekadar template teks.

==================================================
## 1. KONDISI HALAMAN SEKARANG
==================================================

Halaman saat ini memiliki:

Header: "Hitungan Hari"
Subtitle: "Gabungan Adat Jawa & Abu Ma'syar"

Pilihan kegiatan:
- Bepergian
- Berdagang
- Bertani
- Berlayar
- Membangun Rumah
- Menikah

Tombol: "Hitung Hari Ini"

Pertahankan struktur dasar tersebut.
Jangan menghilangkan pilihan kegiatan.

==================================================
## 2. TUJUAN REDESIGN
==================================================

Halaman harus berubah dari:

PILIH KEGIATAN → KLIK HITUNG → HASIL STATIS

menjadi:

PILIH KEGIATAN → MESIN MENGHITUNG → HASIL → PENJELASAN
→ DETAIL RUMUS → PERBANDINGAN METODE → TINDAKAN LANJUTAN

Tetapi semuanya tetap berada dalam pengalaman halaman
"Hitungan Hari" yang sudah ada.

==================================================
## 3. JANGAN MEMAKSA SEMUA KEGIATAN MENGGUNAKAN RUMUS YANG SAMA
==================================================

Setiap kegiatan memiliki calculation profile sendiri.

bepergian        → Jawa + Sunda + Abu Ma'syar
berdagang        → Jawa + Sunda + Abu Ma'syar
bertani          → Jawa + Sunda + Abu Ma'syar
berlayar         → Jawa + Sunda + Abu Ma'syar
membangun_rumah  → Jawa + Sunda + Abu Ma'syar
menikah          → mesin pernikahan khusus

Jangan membuat:
calculate(activity) { return templateResult; }

Gunakan strategy/configuration.

==================================================
## 4. MODEL HASIL
==================================================

interface TraditionResult {
  source: "jawa" | "sunda" | "abu_masyar";
  method: string;
  verdict: "baik" | "netral" | "kurang_baik" | "campuran";
  headline: string;
  score?: number;
  formula?: string;
  explanation: string;
  calculationSteps: CalculationStep[];
  sourceNote?: string;
  limitations?: string[];
}

interface CalculationStep {
  label: string;
  expression?: string;
  value?: string | number;
  explanation?: string;
}

interface DayCalculationResult {
  activity: string;
  date: string;
  results: TraditionResult[];
  synthesis: {
    verdict: "baik" | "netral" | "kurang_baik" | "campuran";
    summary: string;
    supportingMethods: string[];
    cautionMethods: string[];
    conflicts: string[];
  };
}

JANGAN hard-code hasil berdasarkan nama kegiatan.

==================================================
## 5. TAMPILAN HASIL
==================================================

Setelah user menekan "Hitung Hari Ini", jangan hanya
menampilkan "Baik" atau "Netral". Tampilkan card hasil
lengkap (verdict besar, tanggal, icon kegiatan, ringkasan,
indikator per tradisi ●/○), lalu tab:

[ Jawa ] [ Sunda ] [ Abu Ma'syar ] [ Gabungan ]

Gunakan tab/chip yang mengikuti desain aplikasi yang sudah ada.
Jangan mengganti seluruh design system aplikasi.

==================================================
## 6. TAB JAWA
==================================================

Tampilkan: neptu hari, neptu pasaran, total, operasi modulo,
sisa, nama hasil, interpretasi.

Contoh: Rabu = 7, Wage = 4 → 7+4=11 → 11%5=1 → 1 = Sri
→ "Sri secara tradisional dikaitkan dengan rezeki atau
kemakmuran."

Tambahkan toggle "[ Bagaimana dihitung? ▾ ]" yang menampilkan
calculation trace saat dibuka. Jangan membuat angka atau hasil
secara random.

==================================================
## 7. TAB SUNDA
==================================================

Tambahkan mesin Sunda apabila engine sudah tersedia. Jika
belum, JANGAN mengarang hasil — tampilkan status "Metode
Sunda sedang disiapkan".

Naktu hari: Ahad=5, Senén=4, Salasa=3, Rebo=7, Kemis=8,
Jumaah=6, Saptu=9
Pasaran: Manis/Legi=5, Pahing=9, Pon=7, Wage=4, Kaliwon=8

Pisahkan Sunda Palintangan dari Sunda Repok/Babasan. Jangan
mencampurkan keduanya.

==================================================
## 8. TAB ABU MA'SYAR
==================================================

Jangan membuat Abu Ma'syar sekadar "Rabu = Merkurius = baik".
Jika engine sekarang hanya punya penguasa planet berdasarkan
hari, pertahankan fungsi lama tapi refactor agar dapat
diperluas.

Minggu→Matahari, Senin→Bulan, Selasa→Mars, Rabu→Merkurius,
Kamis→Jupiter, Jumat→Venus, Sabtu→Saturnus

Gunakan sifat tradisional planet untuk kegiatan yang relevan,
tapi JANGAN mengklaim ini analisis natal lengkap. Label jujur:
"Indikator Planetary Tradisional". Jika data kelahiran tidak
tersedia, jangan pura-pura melakukan natal chart.

==================================================
## 9. KHUSUS KEGIATAN "MENIKAH"
==================================================

Menikah membutuhkan dua lapisan:
LAPISAN A — Analisis hari/tanggal pernikahan.
LAPISAN B — Analisis kecocokan pasangan (minta data pasangan
hanya ketika user memilih fitur "Analisis Pasangan").

Jika dipilih, minta data:
PRIA: Nama, Tanggal lahir, Jam lahir (opsional), Tempat lahir (opsional)
WANITA: Nama, Tanggal lahir, Jam lahir (opsional), Tempat lahir (opsional)

==================================================
## 10. MESIN JAWA UNTUK PASANGAN
==================================================

Hari: Minggu=5, Senin=4, Selasa=3, Rabu=7, Kamis=8, Jumat=6, Sabtu=9
Pasaran: Legi=5, Pahing=9, Pon=7, Wage=4, Kliwon=8

neptuA = hariA + pasaranA
neptuB = hariB + pasaranB
total = neptuA + neptuB

Petung Jodoh 8: remainder = total % 8 (jika 0, gunakan indeks 8)

Mapping: 1 Pegat, 2 Ratu, 3 Jodoh, 4 Topo, 5 Tinari, 6 Padu,
7 Sujanan, 8 Pesthi

WAJIB menampilkan calculation trace.

==================================================
## 11. MESIN SUNDA PASANGAN
==================================================

Pisahkan Sunda Repok/Babasan dari Sunda Palintangan.

Jika menggunakan Babasan:
1 Pisang Punggel, 2 Lumbung Gumilang, 3 Tunggak Kasemi,
4 Satria Lalaku, 5 Sangga Waringin, 6 Paparingan Kebek,
7 Ratu Sabdaning Pandita

Formula input HARUS mengikuti sumber yang sudah diverifikasi.
Jika sumber tidak cukup jelas, JANGAN MENGARANG — tandai
[NEEDS SOURCE VERIFICATION].

==================================================
## 12. ABU MA'SYAR UNTUK PASANGAN
==================================================

Jangan membuat skor persentase (87%, 91%, dst) — kesan presisi
palsu.

Jika data lahir lengkap tersedia, bangun arsitektur untuk
analisis: rumah ke-7, penguasa rumah ke-7, Venus, Bulan,
planet di rumah ke-7, Lot of Marriage, penguasa Lot,
aspek/testimony, dignity jika engine mendukung.

Jika waktu/tempat lahir tidak tersedia, jelaskan
keterbatasannya. Jangan mengklaim analisis lengkap.

==================================================
## 13. HASIL GABUNGAN
==================================================

DILARANG melakukan rata-rata skor (mis. Jawa=80, Sunda=70,
Abu Ma'syar=90 → 240/3 = 80%).

Gunakan Agreement Analysis: kumpulkan verdict tiap tradisi,
lalu jelaskan kesimpulan dalam kalimat (bukan skor), dengan
daftar "METODE YANG MENDUKUNG" dan "METODE DENGAN CATATAN".

==================================================
## 14. CTA
==================================================

Setelah hasil tampil: [ Simpan Hasil ] [ Bagikan ] [ Cek Tanggal Lain ]

Untuk "Cek Tanggal Lain", gunakan date picker yang sudah ada.
Jangan membuat sistem navigasi baru jika sudah tersedia.

==================================================
## 15. PROGRESSIVE DISCLOSURE
==================================================

Default: hasil ringkas. Detail: collapsed di balik tombol
"Bagaimana ini dihitung?". Saat ditekan, tampilkan formula
lengkap step-by-step. User awam tidak dibanjiri matematika,
user yang ingin belajar bisa melihat semuanya.

==================================================
## 16. UX
==================================================

Pertahankan: header, back button, gear/settings, activity
chips, primary button, font family, spacing system, warna
utama, navigation.

Tingkatkan: hierarchy, result card, icon kegiatan, verdict,
explanation, tabs, expandable calculation.

Jangan melakukan redesign global.

==================================================
## 17. LOADING STATE
==================================================

Saat tombol ditekan: "Sedang menghitung..." lalu tahapan
singkat (Menghitung kalender → Jawa → Sunda → indikator Abu
Ma'syar → Menyusun hasil). Jangan membuat delay palsu yang
tidak diperlukan.

==================================================
## 18. ERROR STATE
==================================================

Tangani: tanggal invalid, tanggal di luar range, kalender
gagal, data tidak lengkap, calculation engine error, metode
tidak tersedia. Jangan crash.

==================================================
## 19. SOURCE TRANSPARENCY
==================================================

Setiap metode harus dapat menunjukkan: nama metode, sumber
tradisi, formula, keterangan, variasi pakem, keterbatasan.
Jangan mengklaim formula sebagai "Abu Ma'syar asli" jika
belum diverifikasi.

==================================================
## 20. DISCLAIMER
==================================================

Di bagian paling bawah:
"Perhitungan ini merupakan penyajian tradisi dan pengetahuan
budaya untuk edukasi dan refleksi. Hasilnya bukan kepastian
tentang masa depan dan tidak menggantikan pertimbangan nyata,
musyawarah, maupun nasihat profesional."

Untuk hasil pernikahan, tambahkan:
"Keputusan pernikahan sebaiknya tetap didasarkan pada agama,
karakter, komunikasi, kesiapan, dan pertimbangan keluarga
serta kehidupan nyata."

==================================================
## 21. IMPLEMENTASI MELALUI TERMUX
==================================================

Saya bekerja menggunakan Android/Termux. Jika perlu membuat
file baru, gunakan HEREDOC dan pastikan path ada di dalam
home directory Termux (mis. project folder), BUKAN di /tmp
(read-only di Termux).

Contoh:
cat > src/engines/traditional/jawa/petung-jodoh-8.ts <<'CODE'
...
CODE

Semua command harus bisa langsung dipaste ke Termux.

==================================================
## 22. ATURAN MODIFIKASI FILE
==================================================

SEBELUM EDIT: cari file halaman Hitungan Hari menggunakan
find/grep/rg atau metode audit repository yang tersedia.
Cari: nama component, route, calculation functions, activity
constants, result components, existing styles, existing
database calls. Jangan menebak nama file.

==================================================
## 23. URUTAN KERJA
==================================================

1. Audit repository
2. Temukan file Hitungan Hari
3. Temukan calculation engine lama
4. Jelaskan struktur sekarang
5. Buat rencana perubahan MINIMAL
6. Refactor calculation result jika diperlukan
7. Implementasikan hasil generik
8. Redesign UI halaman Hitungan Hari
9. Tambahkan calculation trace
10. Tambahkan metode Sunda tanpa merusak Jawa/Abu Ma'syar
11. Khusus "Menikah", tambahkan jalur analisis pasangan
12. Test
13. Build/check

==================================================
## 24. ATURAN EMAS
==================================================

JANGAN MEMBUAT TEMPLATE HASIL. Hasil harus diturunkan dari:
INPUT → DATA REFERENSI → FORMULA → CALCULATION →
INTERPRETATION → SYNTHESIS

Jika user mengubah tanggal/hari/pasaran/nama/tanggal lahir/
pasangan, maka hasil harus benar-benar dihitung ulang, dan
alasan perubahan harus dapat dijelaskan.

==================================================
## 25. PRIORITAS
==================================================

1. Jangan merusak halaman yang sekarang
2. Buat mesin hasil benar-benar dinamis
3. Tampilkan proses perhitungan
4. Tambahkan Sunda secara modular
5. Perkuat analisis pernikahan
6. Pertahankan Abu Ma'syar secara jujur sesuai data yang tersedia

==================================================
## KONSEP UTAMA — SATU RANGKUMAN DARI BANYAK TRADISI
==================================================

Ini prinsip utama fitur Hitungan Hari: user TIDAK boleh
mendapatkan tiga/empat jawaban terpisah yang membingungkan.

Mesin boleh menghitung menggunakan banyak tradisi secara
terpisah di BACKEND, tetapi hasil akhirnya WAJIB disintesis
menjadi SATU RANGKUMAN UTAMA untuk user.

Tradisi sumber: Adat Jawa, Adat Sunda, Abu Ma'syar, kitab
klasik lain yang sudah diverifikasi, metode tradisional lain
yang nantinya ditambahkan.

ALUR:
INPUT → JAWA ENGINE → SUNDA ENGINE → CLASSICAL ENGINE →
ABU MASHAR ENGINE → SEMUA HASIL DIKUMPULKAN → SYNTHESIS ENGINE
→ SATU RANGKUMAN → USER

==================================================
## JANGAN MENAMPILKAN BANYAK KESIMPULAN UTAMA
==================================================

Jangan membuat UI yang menampilkan Jawa/Sunda/Abu Ma'syar
sebagai kesimpulan terpisah lalu membiarkan user menyimpulkan
sendiri — itu tugas mesin.

Contoh: JAWA→Baik, SUNDA→Baik, ABU MA'SYAR→Campuran
Maka: combinedVerdict = "CENDERUNG BAIK", dengan summary yang
menjelaskan kecenderungan positif namun ada catatan dari
pendekatan klasik.

==================================================
## SYNTHESIS ENGINE
==================================================

Buat TraditionalSynthesisEngine.

Input: TraditionResult[]

Output:
interface SynthesizedResult {
  verdict: "sangat_mendukung" | "cenderung_mendukung" | "netral"
    | "cenderung_menantang" | "perlu_kehati_hatian" | "data_tidak_cukup";
  headline: string;
  summary: string;
  reasons: string[];
  positiveIndicators: string[];
  cautionIndicators: string[];
  dominantPattern: string;
  calculationSources: string[];
  detailedTrace: TraditionResult[];
}

==================================================
## CARA MENYIMPULKAN
==================================================

Jangan sekadar menghitung jumlah verdict lalu ambil mayoritas.
Synthesis Engine harus memahami konteks hasil dan merangkum
secara kualitatif (mis. "Cenderung mendukung, dengan beberapa
catatan"), bukan angka persentase seperti "100% baik".

==================================================
## JIKA HASIL BERTENTANGAN
==================================================

Jika hasil antar tradisi bertentangan (mis. Jawa→Baik,
Sunda→Kurang Baik, Abu Ma'syar→Netral), jangan memilih salah
satu secara sembarangan. Kategorikan sebagai "CAMPURAN" dan
jelaskan posisi masing-masing tradisi secara singkat.

==================================================
## HASIL UTAMA UI
==================================================

User cukup melihat satu card hasil: verdict gabungan besar,
ringkasan singkat, dan indikator per tradisi (✓/~/dsb).

Di bawahnya, tombol "Kenapa hasilnya demikian?" — saat ditekan
baru tampilkan detail Jawa/Sunda/Abu Ma'syar/referensi klasik.

Jadi: USER MELIHAT SATU JAWABAN. MESIN TETAP TRANSPARAN.

==================================================
## HASIL HARUS DINAMIS
==================================================

Rangkuman tidak boleh berupa teks statis — harus dibentuk dari
hasil calculation engine. Jika input berubah (tanggal, hari,
pasaran, kegiatan, data pasangan), maka hasil tiap tradisi
berubah, Synthesis Engine menghitung ulang, dan rangkuman
berubah.

==================================================
## KHUSUS MENIKAH
==================================================

Untuk "Menikah", rangkuman juga harus menjadi SATU:
"RANGKUMAN PASANGAN" dengan verdict gabungan (mis. "CENDERUNG
SELARAS"), lalu daftar "Yang mendukung:" dan "Yang perlu
diperhatikan:", lalu tombol "Bagaimana perhitungannya?" untuk
detail per tradisi.

==================================================
## PENTING
==================================================

Jangan membuat satu formula matematika baru yang mencampurkan
Jawa + Sunda + Abu Ma'syar. Yang digabung adalah HASIL DAN
INTERPRETASINYA, bukan rumusnya. Jawa tetap pakem Jawa, Sunda
tetap pakem Sunda, Abu Ma'syar tetap pendekatan klasiknya.

==================================================
## TUJUAN AKHIR
==================================================

Falak Nusantara harus terasa seperti punya SATU "MESIN
PENJAWAB". User tidak perlu memahami neptu, naktu, modulo,
planet, rumah astrologi, sisa pembagian, dll. — cukup dapat
jawaban: Apa hasilnya? Kenapa? Apa yang mendukung? Apa yang
perlu diperhatikan? Bagaimana cara melihat perhitungannya?

JANGAN MEMBUAT JAWABAN TEMPLATE. Rangkuman harus dibentuk dari
data hasil perhitungan sebenarnya.

==================================================
## 26. ALUR FINAL (RINGKASAN)
==================================================

INPUT USER
   ↓
MESIN PERHITUNGAN (Jawa, Sunda, Kitab klasik,
Abu Ma'syar, referensi lain) — berjalan
terpisah, masing-masing pakem sendiri
   ↓
HASIL MENTAH MASING-MASING TRADISI
   ↓
SYNTHESIS ENGINE
mencari: kesamaan, perbedaan, kecenderungan,
peringatan, alasan
   ↓
SATU JAWABAN UTAMA UNTUK USER
   ↓
(detail tiap tradisi tetap bisa dibuka via
"Bagaimana ini dihitung?")

==================================================
## 27. KUALITAS VISUAL — WAJIB DIPERHATIKAN
==================================================

Redesign ini BUKAN cuma soal logika perhitungan. Tampilan
akhir harus terasa premium, nyaman dipandang, dan tidak
generik.

- Hierarchy jelas: verdict utama jadi focal point terbesar di
  card hasil, bukan bersaing dengan detail teknis.
- Spacing lega, jangan padat — terutama di card hasil dan area
  calculation trace.
- Warna verdict konsisten dan bermakna (hijau lembut untuk
  "cenderung baik", kuning/abu untuk "campuran", jangan pakai
  merah tegas untuk hasil budaya — kesannya terlalu
  menghakimi).
- Icon kegiatan & icon tradisi (Jawa/Sunda/Abu Ma'syar)
  konsisten satu family style, jangan campur icon set.
- Transisi antar tab dan expand/collapse "Bagaimana ini
  dihitung?" harus smooth, bukan lompat kasar.
- Tipografi: judul hasil besar & tegas, penjelasan pakai body
  text nyaman dibaca, calculation trace boleh pakai font
  monospace/tabular biar angka rapi.
- Tetap ikuti design system aplikasi yang sudah ada (warna
  utama, font family, spacing scale) — redesign ini
  meningkatkan HALAMAN INI, bukan membuat bahasa desain baru
  untuk seluruh app.

JANGAN korbankan kenyamanan visual demi menjejalkan semua
informasi sekaligus. Progressive disclosure (bagian 15)
berlaku juga untuk visual, bukan cuma struktur data.

==================================================

MULAI SEKARANG. JANGAN LANGSUNG CODING.

PERTAMA, audit repository dan laporkan:
1. file halaman Hitungan Hari
2. calculation engine yang digunakan
3. komponen UI
4. fungsi Jawa
5. fungsi Abu Ma'syar
6. apakah sudah ada mesin Sunda
7. database/reference yang sudah ada
8. bagian yang dapat digunakan kembali
9. bagian yang perlu diperbaiki
10. rencana perubahan minimal

SETELAH AUDIT BARU IMPLEMENTASIKAN.

INGAT: INI REDESIGN HALAMAN YANG SUDAH ADA, BUKAN MEMBUAT
APLIKASI DARI NOL.
