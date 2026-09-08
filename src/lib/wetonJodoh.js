// Kecocokan hari lahir menurut Primbon Jawa — neptu (hari+pasaran) kedua orang
// dijumlahkan, dibagi 8, sisanya dicocokkan ke 8 kategori tradisional.
// Interpretasi budaya untuk edukasi & refleksi, bukan kepastian nasib.
const KATEGORI_WETON = {
  1: {
    nama: 'Pegat',
    kualitas: 'kurang',
    deskripsi: 'Secara tradisi dikaitkan dengan potensi rawan masalah, baik karena faktor ekonomi maupun perselisihan yang bisa berujung perpisahan.',
    saran: 'Bangun komunikasi terbuka sejak awal dan hindari menyimpan masalah keuangan sendirian.',
    nasehat: 'Perbanyak sedekah dan menjaga silaturahmi dengan keluarga dipercaya membantu meredam potensi ini — namun yang paling menentukan tetaplah ikhtiar, komunikasi, dan doa berdua.',
  },
  2: {
    nama: 'Ratu',
    kualitas: 'baik',
    deskripsi: 'Dipercaya membawa kehidupan yang disegani dan serba berkecukupan, namun perlu diwaspadai potensi kecemburuan dari lingkungan sekitar.',
    saran: 'Tetap rendah hati dan jangan biarkan pencapaian bersama menimbulkan kecemburuan orang lain.',
    nasehat: 'Kerendahan hati dan berbagi rezeki dengan sesama dipercaya menjaga keharmonisan yang sudah baik ini tetap bertahan lama.',
  },
  3: {
    nama: 'Jodoh',
    kualitas: 'baik',
    deskripsi: 'Menandakan pasangan yang serasi dan banyak kesamaan, dipercaya sebagai jodoh yang memang saling melengkapi.',
    saran: 'Jaga kesamaan visi ini dengan terus terbuka membicarakan rencana jangka panjang berdua.',
    nasehat: 'Kecocokan ini baik dijaga dengan terus belajar bersama, bukan berhenti berusaha karena merasa sudah cocok.',
  },
  4: {
    nama: 'Topo',
    kualitas: 'kurang',
    deskripsi: 'Secara tradisi digambarkan sebagai hubungan yang akan diuji dengan berbagai rintangan terlebih dahulu sebelum mencapai kestabilan.',
    saran: 'Bersabar di masa-masa awal dan hindari mengambil keputusan besar secara terburu-buru.',
    nasehat: 'Ujian di awal dipercaya akan berbuah manis jika dihadapi dengan sabar, saling mendukung, dan tidak saling menyalahkan.',
  },
  5: {
    nama: 'Tinari',
    kualitas: 'baik',
    deskripsi: 'Dipercaya membawa kelancaran rezeki dan keberuntungan yang mengalir dalam kehidupan berumah tangga.',
    saran: 'Kelola rezeki bersama dengan bijak dan tetap saling terbuka soal keuangan keluarga.',
    nasehat: 'Rezeki yang lancar sebaiknya diimbangi dengan rasa syukur dan kebiasaan menabung untuk masa depan.',
  },
  6: {
    nama: 'Padu',
    kualitas: 'kurang',
    deskripsi: 'Digambarkan sebagai hubungan yang rawan cekcok kecil, meski umumnya dipicu hal-hal sepele yang bisa diselesaikan bersama.',
    saran: 'Biasakan menyelesaikan masalah kecil sebelum menumpuk menjadi besar, dan hindari ego saat berdebat.',
    nasehat: 'Pertengkaran kecil bisa diminimalkan dengan membiasakan komunikasi tenang dan waktu khusus untuk membicarakan keluhan.',
  },
  7: {
    nama: 'Sujanan',
    kualitas: 'kurang',
    deskripsi: 'Secara tradisi dikaitkan dengan kerawanan terhadap godaan pihak ketiga dalam hubungan rumah tangga.',
    saran: 'Perkuat kepercayaan dan keterbukaan berdua, serta jaga batasan yang sehat dengan orang lain.',
    nasehat: 'Menjaga kejujuran dan waktu berkualitas berdua dipercaya menjadi benteng utama menghadapi kerawanan ini.',
  },
  0: {
    nama: 'Pesthi',
    kualitas: 'baik',
    deskripsi: 'Kategori yang dianggap paling baik — dipercaya membawa kehidupan rukun, tenteram, dan setia hingga tua.',
    saran: 'Jaga kebiasaan baik ini dengan terus merawat komunikasi dan rasa syukur berdua.',
    nasehat: 'Keharmonisan yang sudah baik tetap perlu dirawat aktif, bukan dianggap otomatis bertahan selamanya.',
  },
};

export function kecocokanWeton(totalNeptuA, totalNeptuB) {
  const gabungan = totalNeptuA + totalNeptuB;
  const sisa = gabungan % 8;
  return { totalGabungan: gabungan, ...KATEGORI_WETON[sisa] };
}
