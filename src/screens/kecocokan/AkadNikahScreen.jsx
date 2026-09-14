import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import ScreenHeader from './ScreenHeader';
import DateField from './DateField';
import PractitionerNote from './PractitionerNote';
import SumberDetail from './SumberDetail';
import { engineAkadNikah } from '../../lib/engines/akadNikah';
import { colors, spacing } from './theme';

export default function AkadNikahScreen({ onBack }) {
  const [namaPria, setNamaPria] = useState('');
  const [namaIbuPria, setNamaIbuPria] = useState('');
  const [tglPria, setTglPria] = useState(null);
  const [namaWanita, setNamaWanita] = useState('');
  const [namaIbuWanita, setNamaIbuWanita] = useState('');
  const [tglWanita, setTglWanita] = useState(null);
  const [hasil, setHasil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bisaHitung =
    namaPria.trim() && namaIbuPria.trim() && tglPria &&
    namaWanita.trim() && namaIbuWanita.trim() && tglWanita && !loading;

  async function hitung() {
    setError('');
    setLoading(true);
    try {
      const result = await engineAkadNikah({
        tglPria, tglWanita, namaPria, namaIbuPria, namaWanita, namaIbuWanita,
      });
      setHasil(result);
    } catch (e) {
      setError('Gagal menghitung. Periksa koneksi lalu coba lagi.');
      setHasil(null);
    } finally {
      setLoading(false);
    }
  }

  const narasi = hasil
    ? `Weton ${namaPria.trim()}: ${hasil.inputs.wetonPria.hari} ${hasil.inputs.wetonPria.pasaran} (neptu ${hasil.inputs.wetonPria.totalNeptu}). Weton ${namaWanita.trim()}: ${hasil.inputs.wetonWanita.hari} ${hasil.inputs.wetonWanita.pasaran} (neptu ${hasil.inputs.wetonWanita.totalNeptu}).\n\nMenurut Betaljemur No.22, kombinasi ini jatuh pada golongan ${hasil.no22.label} — ${hasil.no22.makna}. Menurut No.23, golongannya ${hasil.no23.label} (tergolong ${hasil.no23.status}).\n\nDari sisi Abu Ma'syar, nilai jodoh nama menunjukkan sisa ${hasil.jodoh.r}: ${hasil.jodoh.makna}. Buruj ${namaPria.trim()} adalah ${hasil.burujPria.nama} (hari baik: ${hasil.burujPria.hariBaik.join(', ')}), sedangkan buruj ${namaWanita.trim()} adalah ${hasil.burujWanita.nama} (hari baik: ${hasil.burujWanita.hariBaik.join(', ')}).${hasil.hariBaikBersama.length ? `\n\nHari yang sekaligus masuk daftar baik kedua buruj: ${hasil.hariBaikBersama.join(', ')}.` : '\n\nTidak ada hari yang sekaligus masuk daftar baik kedua buruj — pertimbangkan dua mesin lain di atas untuk memilih hari.'}`
    : '';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Akad Nikah" onBack={onBack} palette={colors.abu} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
        <Text style={styles.sectionTitle}>Data Pria</Text>
        <Text style={styles.label}>Nama lengkap pria</Text>
        <TextInput style={styles.input} value={namaPria} onChangeText={setNamaPria} placeholder="Nama pria" />
        <Text style={styles.label}>Nama ibu kandung pria</Text>
        <TextInput style={styles.input} value={namaIbuPria} onChangeText={setNamaIbuPria} placeholder="Nama ibu pria" />
        <DateField label="Tanggal lahir pria" value={tglPria} onChange={setTglPria} />

        <Text style={styles.sectionTitle}>Data Wanita</Text>
        <Text style={styles.label}>Nama lengkap wanita</Text>
        <TextInput style={styles.input} value={namaWanita} onChangeText={setNamaWanita} placeholder="Nama wanita" />
        <Text style={styles.label}>Nama ibu kandung wanita</Text>
        <TextInput style={styles.input} value={namaIbuWanita} onChangeText={setNamaIbuWanita} placeholder="Nama ibu wanita" />
        <DateField label="Tanggal lahir wanita" value={tglWanita} onChange={setTglWanita} />

        <Pressable disabled={!bisaHitung} onPress={hitung} style={[styles.btn, { opacity: bisaHitung ? 1 : 0.5 }]}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Hitung Kecocokan</Text>}
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {hasil && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Ensemble: Jawa (No.22/23) + Abu Ma'syar</Text>

            <View style={styles.symbolBox}>
              <Text style={styles.symbolText}>{hasil.status}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowKey}>Betaljemur No.22</Text>
              <Text style={styles.rowVal}>{hasil.no22.label}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Betaljemur No.23</Text>
              <Text style={styles.rowVal}>{hasil.no23.label} ({hasil.no23.status})</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Jodoh Nama (Abu Ma'syar)</Text>
              <Text style={styles.rowVal}>Sisa {hasil.jodoh.r} — {hasil.jodoh.makna}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Buruj pria</Text>
              <Text style={styles.rowVal}>{hasil.burujPria.nama} · hari baik: {hasil.burujPria.hariBaik.join(', ')}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Buruj wanita</Text>
              <Text style={styles.rowVal}>{hasil.burujWanita.nama} · hari baik: {hasil.burujWanita.hariBaik.join(', ')}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Repok Sunda</Text>
              <Text style={styles.rowVal}>Belum tersedia — tabel aksara Hanacaraka/Cacarakan belum ada di sistem</Text>
            </View>

            <PractitionerNote>{narasi}</PractitionerNote>

            <SumberDetail>
              Sumber: Algoritma Final Penentuan Hari Nikah (Jawa/Sunda/Abu Ma'syar), status VERIFIED_PRIMARY untuk No.22/No.23/Jodoh/Buruj+hari baik. Ini tradisi petungan budaya — bukan jaminan ilmiah atas keberhasilan pernikahan.
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
  error: { color: '#B3261E', fontSize: 13, marginBottom: spacing.md, textAlign: 'center' },
  resultCard: { backgroundColor: colors.abu.bg, borderRadius: 18, padding: spacing.md, marginBottom: spacing.xl },
  resultLabel: { fontSize: 13, fontWeight: '700', color: colors.abu.icon, marginBottom: spacing.sm, textAlign: 'center' },
  row: { marginBottom: 8 },
  rowKey: { fontSize: 11.5, color: colors.cardSubtext },
  rowVal: { fontSize: 13.5, color: colors.cardText, fontWeight: '600' },
  symbolBox: { alignItems: 'center', marginVertical: spacing.sm },
  symbolText: { fontSize: 16, fontWeight: '800', color: colors.abu.icon, textAlign: 'center' },
});
