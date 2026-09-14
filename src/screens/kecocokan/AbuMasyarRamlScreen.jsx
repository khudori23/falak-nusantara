import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import ScreenHeader from './ScreenHeader';
import PractitionerNote from './PractitionerNote';
import SumberDetail from './SumberDetail';
import { hitungAbjad } from '../../lib/abjad';
import { fasalJodohAbuMasyar } from '../../lib/abuMasyarRaml';
import { colors, spacing } from './theme';

export default function AbuMasyarRamlScreen({ onBack }) {
  const [namaPria, setNamaPria] = useState('');
  const [namaWanita, setNamaWanita] = useState('');
  const [hasil, setHasil] = useState(null);

  const bisaHitung = namaPria.trim().length > 0 && namaWanita.trim().length > 0;

  function hitung() {
    const abjadPria = hitungAbjad(namaPria);
    const abjadWanita = hitungAbjad(namaWanita);
    const fasal = fasalJodohAbuMasyar(abjadPria.total, abjadWanita.total);
    setHasil({ abjadPria, abjadWanita, fasal });
  }

  const narasi = hasil
    ? `Nama ${namaPria.trim()} punya nilai abjad ${hasil.abjadPria.total}, dan nama ${namaWanita.trim()} bernilai ${hasil.abjadWanita.total}. Saya jumlahkan keduanya ditambah 7, lalu saya bagi 9 — sisanya ${hasil.fasal.sisa}. Menurut Fasal Menghitung Jodoh, sisa ini menunjukkan: ${hasil.fasal.deskripsi}`
    : '';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Abjad & Raml" onBack={onBack} palette={colors.abu} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
        <Text style={styles.sectionTitle}>Data Nama</Text>
        <Text style={styles.label}>Nama lengkap pria</Text>
        <TextInput style={styles.input} value={namaPria} onChangeText={setNamaPria} placeholder="Contoh: Ahmad Fauzi" />

        <Text style={styles.label}>Nama lengkap wanita</Text>
        <TextInput style={styles.input} value={namaWanita} onChangeText={setNamaWanita} placeholder="Contoh: Siti Aminah" />

        <Pressable disabled={!bisaHitung} onPress={hitung} style={[styles.btn, { opacity: bisaHitung ? 1 : 0.5 }]}>
          <Text style={styles.btnText}>Hitung Kecocokan</Text>
        </Pressable>

        {hasil && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Fasal Menghitung Jodoh (Raml)</Text>

            <View style={styles.row}>
              <Text style={styles.rowKey}>Nilai abjad pria</Text>
              <Text style={styles.rowVal}>{hasil.abjadPria.total}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Nilai abjad wanita</Text>
              <Text style={styles.rowVal}>{hasil.abjadWanita.total}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Perhitungan</Text>
              <Text style={styles.rowVal}>
                ({hasil.abjadPria.total} + {hasil.abjadWanita.total} + 7) mod 9 = {hasil.fasal.sisa}
              </Text>
            </View>

            <View style={styles.symbolBox}>
              <Text style={styles.symbolText}>{hasil.fasal.nama}</Text>
            </View>

            <PractitionerNote>{narasi}</PractitionerNote>

            <SumberDetail>
              Sumber: Terjemah Abu Mashar Al-Falaki, Fasal Menghitung Jodoh — status VERIFIED_PRIMARY.
            </SumberDetail>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.cardText, marginBottom: spacing.md },
  label: { fontSize: 13, color: colors.cardSubtext, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: 12, marginBottom: spacing.md },
  btn: { backgroundColor: colors.abu.icon, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  resultCard: { backgroundColor: colors.abu.bg, borderRadius: 18, padding: spacing.md, marginBottom: spacing.xl },
  resultLabel: { fontSize: 13, fontWeight: '700', color: colors.abu.icon, marginBottom: spacing.sm },
  row: { marginBottom: 8 },
  rowKey: { fontSize: 11.5, color: colors.cardSubtext },
  rowVal: { fontSize: 13.5, color: colors.cardText, fontWeight: '600' },
  symbolBox: { alignItems: 'center', marginVertical: spacing.sm },
  symbolText: { fontSize: 20, fontWeight: '800', color: colors.abu.icon, textAlign: 'center' },
});
