import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import BottomNav from '../components/BottomNav';

function openCorrectionEmail() {
  const subject = encodeURIComponent('Masukan/Koreksi Metodologi - Falak Nusantara');
  const body = encodeURIComponent(
    'Halo tim Falak Nusantara,\n\nSaya ingin memberi masukan/koreksi terkait metode perhitungan berikut:\n\n[Tulis detail masukan Anda di sini]\n'
  );
  Linking.openURL(`mailto:bogadori15@gmail.com?subject=${subject}&body=${body}`);
}

function Section({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function EngineBlock({ nama, dasar, catatan }) {
  return (
    <View style={styles.engineBlock}>
      <Text style={styles.engineName}>{nama}</Text>
      <Text style={styles.engineDasar}>{dasar}</Text>
      {catatan ? <Text style={styles.engineCatatan}>{catatan}</Text> : null}
    </View>
  );
}

export default function MetodologiScreen({ onNavigate }) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backRow} onPress={() => onNavigate?.('Settings')}>
          <ChevronLeft size={20} color={colors.primary} />
          <Text style={styles.backText}>Kembali ke Pengaturan</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Metodologi & Transparansi</Text>
        <Text style={styles.intro}>
          Halaman ini menjelaskan bagaimana setiap skor dan rekomendasi di Falak Nusantara dihitung, dari mana
          asalnya, dan mana bagian yang bersifat ilmiah versus interpretasi tradisi.
        </Text>

        <Section title="Prinsip Dasar">
          <Text style={styles.bodyText}>
            Kami memisahkan tegas dua lapisan: lapisan ILMIAH (posisi matahari/bulan, waktu salat, arah kiblat)
            yang mengikuti kaidah astronomi/falak, dan lapisan TRADISI (weton, neptu, Paca Opat, elemen Abu
            Ma'syar) yang ditampilkan sebagai interpretasi budaya turun-temurun — bukan fakta ilmiah atau kepastian.
          </Text>
        </Section>

        <Section title="Tiga Engine Tradisional">
          <EngineBlock
            nama="Adat Jawa"
            dasar="Neptu (nilai hari + pasaran), Pancasuda, dan aturan hari larangan Tali/Sampar Wangke."
            catatan="Epoch, tabel neptu, dan penalti Tali Wangke mengikuti rujukan yang dikunci sesuai spesifikasi tim; bisa diverifikasi silang secara manual."
          />
          <EngineBlock
            nama="Adat Sunda"
            dasar="Siklus Paca Opat (Sri, Kala, Naga, Numpi) untuk menilai kecocokan hari terhadap jenis kegiatan."
            catatan="Arah spasial yang direkomendasikan adalah konvensi implementasi kami sendiri untuk menjaga hasil tetap konsisten dan bisa diaudit — bukan klaim rumus historis baku."
          />
          <EngineBlock
            nama="Kitab Abu Ma'syar & Falak"
            dasar="Fase bulan (estimasi siklus sinodis ±29,53 hari) dan elemen harian (Tanah/Air/Udara/Api) yang dicocokkan dengan kebutuhan kegiatan."
            catatan="Perhitungan bulan di sini bersifat estimasi matematis, sengaja tidak diganti posisi bulan presisi astronomis, supaya metode kitab tetap otentik dan bisa dicek langsung oleh praktisi ilmu falak."
          />
        </Section>

        <Section title="Integrasi Cuaca & Astronomi Real-time">
          <Text style={styles.bodyText}>
            Skor akhir tiap tradisi dikalikan multiplier cuaca real-time (dari data prakiraan cuaca) untuk
            kegiatan yang secara wajar dipengaruhi kondisi lapangan — seperti membangun, bertani, beternak, dan
            berlayar. Kegiatan non-fisik seperti berdagang tetap menampilkan info cuaca untuk transparansi, tapi
            skornya tidak diubah oleh cuaca.
          </Text>
          <Text style={styles.bodyText}>
            Prakiraan cuaca hanya tersedia untuk tanggal dalam rentang beberapa hari ke depan. Di luar rentang
            itu, multiplier cuaca otomatis netral dan kondisi ini ditampilkan apa adanya, bukan disembunyikan.
          </Text>
        </Section>

        <Section title="Dewan Peninjau Praktisi">
          <Text style={styles.bodyText}>
            Kami sedang membentuk dewan peninjau berisi praktisi ilmu falak dan budayawan Jawa/Sunda untuk
            memvalidasi logika tiap engine secara berkala. Modul yang sudah ditinjau akan diberi tanda "Ditinjau
            oleh" di halaman hasil. Belum ada peninjau terdaftar publik saat ini.
          </Text>
        </Section>

        <Section title="Laporkan Koreksi atau Masukan">
          <Text style={styles.bodyText}>
            Kalau Anda seorang praktisi, budayawan, atau ahli falak dan menemukan hal yang perlu dikoreksi dari
            metode yang kami gunakan, kami sangat terbuka terhadap masukan.
          </Text>
          <TouchableOpacity style={styles.emailBtn} onPress={openCorrectionEmail}>
            <Text style={styles.emailBtnText}>Kirim Masukan via Email</Text>
          </TouchableOpacity>
        </Section>

        <Text style={styles.footerNote}>
          Seluruh hasil di aplikasi ini adalah interpretasi untuk edukasi dan refleksi, bukan kepastian atau
          ramalan. Keputusan akhir tetap ada di tangan Anda.
        </Text>
      </ScrollView>
      <BottomNav active="Settings" onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 80 },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backText: { color: colors.primary, fontSize: 14, fontWeight: '600', marginLeft: 2 },
  header: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 },
  intro: { fontSize: 14, color: colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.primary, marginBottom: 10 },
  bodyText: { fontSize: 13.5, color: colors.textPrimary, lineHeight: 20, marginBottom: 8 },
  engineBlock: { marginBottom: 12 },
  engineName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  engineDasar: { fontSize: 13, color: colors.textPrimary, lineHeight: 19, marginBottom: 3 },
  engineCatatan: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic', lineHeight: 17 },
  emailBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  emailBtnText: { color: colors.textOnPrimary, fontWeight: '600', fontSize: 14 },
  footerNote: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
  },
});
