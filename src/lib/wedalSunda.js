// Kecocokan hari lahir menurut Primbon Sunda — nilai wedal (hari lahir) kedua
// orang dijumlahkan, dibagi 7, sisanya dicocokkan ke 7 kode babasan tradisional.
// Interpretasi budaya untuk edukasi & refleksi, bukan kepastian nasib.
export const NILAI_WEDAL = {
  Minggu: 5, Senin: 4, Selasa: 3, Rabu: 7, Kamis: 8, Jumat: 6, Sabtu: 9,
};

const KATEGORI_WEDAL = {
  1: {
    nama: 'Pinang Nugel',
    kualitas: 'kurang',
    deskripsi: 'Diibaratkan seperti pinang yang terpotong — dipercaya membawa hubungan yang harus melewati cukup banyak rintangan.',
    saran: 'Perkuat komunikasi dan saling pengertian sejak masa awal hubungan.',
    nasehat: 'Rintangan yang digambarkan bisa diminimalkan dengan kesabaran, keterbukaan, dan dukungan dari keluarga kedua belah pihak.',
  },
  2: {
    nama: 'Lumbung Gumilang',
    kualitas: 'kurang',
    deskripsi: 'Dipercaya membawa dinamika naik-turun dalam hal rezeki dan kestabilan rumah tangga.',
    saran: 'Kelola keuangan bersama secara hati-hati dan siapkan tabungan untuk masa-masa sulit.',
    nasehat: 'Kestabilan bisa dijaga dengan perencanaan keuangan yang disiplin dan saling terbuka soal kebutuhan keluarga.',
  },
  3: {
    nama: 'Tunggak Kasemi',
    kualitas: 'kurang',
    deskripsi: 'Digambarkan seperti tunggak yang bertunas kembali — awalnya berat, namun berpotensi tumbuh membaik seiring waktu.',
    saran: 'Bersabar menghadapi fase awal yang menantang, karena secara tradisi dipercaya bisa membaik seiring berjalannya waktu.',
    nasehat: 'Ketekunan dan sikap tidak mudah menyerah dipercaya menjadi kunci melewati fase awal yang berat ini.',
  },
  4: {
    nama: 'Satria Lalaku',
    kualitas: 'baik',
    deskripsi: 'Dipercaya membawa perjalanan hubungan yang penuh perjuangan namun berujung pada hasil yang membanggakan.',
    saran: 'Hadapi setiap tantangan bersama sebagai tim, karena perjuangan itu sendiri dipercaya membentuk kekuatan hubungan.',
    nasehat: 'Kegigihan yang ditempuh berdua dipercaya akan membuahkan hasil yang setimpal di kemudian hari.',
  },
  5: {
    nama: 'Sangga Waringin',
    kualitas: 'baik',
    deskripsi: 'Diibaratkan seperti pohon beringin yang kokoh — dipercaya membawa perlindungan dan tempat bernaung bagi keluarga.',
    saran: 'Jadikan rumah tangga sebagai tempat berlindung yang nyaman bagi seluruh anggota keluarga.',
    nasehat: 'Sikap saling melindungi dan menjadi sandaran satu sama lain dipercaya memperkuat makna baik dari kategori ini.',
  },
  6: {
    nama: 'Paparingan Kebek',
    kualitas: 'baik',
    deskripsi: 'Dipercaya membawa keberkahan dan kecukupan yang melimpah dalam kehidupan berumah tangga.',
    saran: 'Syukuri kecukupan yang ada dan biasakan berbagi dengan sesama.',
    nasehat: 'Rasa syukur dan kebiasaan berbagi dipercaya menjaga keberkahan ini tetap mengalir.',
  },
  0: {
    nama: 'Ratu Sabdaning Pandita',
    kualitas: 'baik',
    deskripsi: 'Kode yang dianggap paling baik dalam tradisi ini — melambangkan kebijaksanaan dan keseimbangan yang mendalam dalam hubungan.',
    saran: 'Jaga kebijaksanaan dalam menghadapi setiap persoalan rumah tangga, sebagaimana makna dari kategori ini.',
    nasehat: 'Keseimbangan yang sudah baik ini tetap perlu dirawat dengan komunikasi yang matang dan saling menghormati.',
  },
};

export function kecocokanWedal(hariA, hariB) {
  const nilaiA = NILAI_WEDAL[hariA] ?? 0;
  const nilaiB = NILAI_WEDAL[hariB] ?? 0;
  const gabungan = nilaiA + nilaiB;
  const sisa = gabungan % 7;
  return { nilaiA, nilaiB, totalGabungan: gabungan, ...KATEGORI_WEDAL[sisa] };
}
