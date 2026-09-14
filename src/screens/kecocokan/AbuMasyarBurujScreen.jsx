import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import ScreenHeader from './ScreenHeader';
import PractitionerNote from './PractitionerNote';
import SumberDetail from './SumberDetail';
import { burujJodohAbuMasyar } from '../../lib/abuMasyarBuruj';
import { colors, spacing } from './theme';

export default function AbuMasyarBurujScreen({ onBack }) {
  const [namaPria, setNamaPria] = useState('');
  const [namaIbuPria, setNamaIbuPria] = useState('');
  const [namaWanita, setNamaWanita] = useState('');
  const [namaIbuWanita, setNamaIbuWanita] = useState('');
  const [hasil, setHasil] = useState(null);

  const bisaHitung =
    namaPria.trim() && namaIbuPria.trim() && namaWanita.trim() && namaIbuWanita.trim();

  function hitung() {
    setHasil(burujJodohAbuMasyar(namaPria, namaIbuPria, namaWanita, namaIbuWanita));
  }

  const narasi = hasil
    ? `Dari nama ${namaPria.trim()} yang saya padukan dengan nama ibunda, ${namaIbuPria.trim()}, buruj yang muncul adalah ${hasil.burujA.nama} — unsur ${hasil.burujA.unsur}, dinaungi planet ${hasil.burujA.planet}. Untuk ${namaWanita.trim()}, dengan ibunda ${namaIbuWanita.trim()}, buruj yang saya dapatkan adalah ${hasil.burujB.nama} — unsur ${hasil.burujB.unsur}, planet ${hasil.burujB.planet}.\n\n${
        hasil.kualitas === 'baik'
          ? `Kabar baiknya, unsur ${hasil.burujA.unsur} dan ${hasil.burujB.unsur} ini tergolong selaras menurut kaidah astrologi klasik — pasangan dengan kombinasi seperti ini relatif mudah menyatu, meski tetap perlu dirawat lewat komunikasi yang baik.`
          : `Unsur ${hasil.burujA.unsur} dan ${hasil.burujB.unsur} ini tergolong berbeda arah menurut kaidah astrologi klasik. Bukan berarti tidak cocok — hanya saja butuh lebih banyak penyesuaian karakter dari kedua belah pihak.`
      }\n\nSatu hal yang perlu saya sampaikan jujur: tabel "Jodohnya" khusus per-pasangan buruj dari kitab Abu Ma'syar sendiri belum saya temukan transkripsinya yang lengkap. Jadi bacaan di atas saya susun dari konvensi umum unsur astrologi klasik, bukan kutipan langsung kitab — anggap sebagai bahan renungan awal, bukan keputusan akhir.`
    : '';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Nama & Buruj" onBack={onBack} palette={colors.abu} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
        <Text style={styles.sectionTitle}>Data Pria</Text>
        <Text style={styles.label}>Nama lengkap pria</Text>
        <TextInput style={styles.input} value={namaPria} onChangeText={setNamaPria} placeholder="Nama pria" />
        <Text style={styles.label}>Nama ibu kandung pria</Text>
        <TextInput style={styles.input} value={namaIbuPria} onChangeText={setNamaIbuPria} placeholder="Nama ibu pria" />

        <Text style={styles.sectionTitle}>Data Wanita</Text>
        <Text style={styles.label}>Nama lengkap wanita</Text>
        <TextInput style={styles.input} value={namaWanita} onChangeText={setNamaWanita} placeholder="Nama wanita" />
        <Text style={styles.label}>Nama ibu kandung wanita</Text>
        <TextInput style={styles.input} value={namaIbuWanita} onChangeText={setNamaIbuWanita} placeholder="Nama ibu wanita" />

        <Pressable disabled={!bisaHitung} onPress={hitung} style={[styles.btn, { opacity: bisaHitung ? 1 : 0.5 }]}>
          <Text style={styles.btnText}>Hitung Kecocokan</Text>
        </Pressable>

        {hasil && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>{hasil.nama}</Text>

            <View style={styles.row}>
              <Text style={styles.rowKey}>Buruj pria</Text>
              <Text style={styles.rowVal}>{hasil.burujA.nama} — unsur {hasil.burujA.unsur}, planet {hasil.burujA.planet}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Buruj wanita</Text>
              <Text style={styles.rowVal}>{hasil.burujB.nama} — unsur {hasil.burujB.unsur}, planet {hasil.burujB.planet}</Text>
            </View>

            <PractitionerNote>{narasi}</PractitionerNote>

            <SumberDetail>
              Catatan sumber: tabel "Jodohnya" per-buruj dari kitab asli Abu Ma'syar belum ditranskrip.
              Interpretasi memakai konvensi unsur astrologi klasik umum (bukan kutipan langsung kitab) —
              status UNVERIFIED, bukan VERIFIED_PRIMARY.
            </SumberDetail>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.cardText, marginTop: spacing.sm, marginBottom: spacing.sm },
  label: { fontSize: 13, color: colors.cardSubtext, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: 12, marginBottom: spacing.md },
  btn: { backgroundColor: colors.abu.icon, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  resultCard: { backgroundColor: colors.abu.bg, borderRadius: 18, padding: spacing.md, marginBottom: spacing.xl },
  resultLabel: { fontSize: 14, fontWeight: '700', color: colors.abu.icon, marginBottom: spacing.sm, textAlign: 'center' },
  row: { marginBottom: 8 },
  rowKey: { fontSize: 11.5, color: colors.cardSubtext },
  rowVal: { fontSize: 13.5, color: colors.cardText, fontWeight: '600' },
});
