import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import ScreenHeader from './ScreenHeader';
import DateField from './DateField';
import PractitionerNote from './PractitionerNote';
import SumberDetail from './SumberDetail';
import { engineJawaWeton8Siklus } from '../../lib/engines/jawaWeton8Siklus';
import { colors, spacing } from './theme';

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function JawaWetonScreen({ onBack }) {
  const [tglPria, setTglPria] = useState(null);
  const [tglWanita, setTglWanita] = useState(null);
  const [hasil, setHasil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bisaHitung = !!tglPria && !!tglWanita && !loading;

  async function hitung() {
    setError('');
    setLoading(true);
    try {
      const result = await engineJawaWeton8Siklus(toDateStr(tglPria), toDateStr(tglWanita));
      setHasil(result);
    } catch (e) {
      setError('Gagal mengambil interpretasi dari server. Coba lagi.');
      setHasil(null);
    } finally {
      setLoading(false);
    }
  }

  const narasi = hasil
    ? `Dari tanggal lahir pihak pria, weton yang saya dapatkan adalah ${hasil.inputs.weton_pria.hari} ${hasil.inputs.weton_pria.pasaran}, neptu ${hasil.inputs.weton_pria.neptu}. Dari pihak wanita, wetonnya ${hasil.inputs.weton_wanita.hari} ${hasil.inputs.weton_wanita.pasaran}, neptu ${hasil.inputs.weton_wanita.neptu}. Total neptu keduanya saya jumlahkan jadi ${hasil.calculation.total_neptu}, lalu saya ${hasil.calculation.formula}, hasilnya jatuh pada simbol ${hasil.symbol}.\n\n${hasil.interpretation}`
    : '';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Weton — Siklus 8" onBack={onBack} palette={colors.jawa} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
        <Text style={styles.sectionTitle}>Data Kelahiran</Text>

        <DateField label="Tanggal lahir pria" value={tglPria} onChange={setTglPria} />
        <DateField label="Tanggal lahir wanita" value={tglWanita} onChange={setTglWanita} />

        <Pressable disabled={!bisaHitung} onPress={hitung} style={[styles.btn, { opacity: bisaHitung ? 1 : 0.5 }]}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Hitung Kecocokan</Text>}
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {hasil && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Jawa — Weton Siklus 8</Text>

            <View style={styles.symbolBox}>
              <Text style={styles.symbolText}>{hasil.symbol}</Text>
            </View>

            <PractitionerNote>{narasi}</PractitionerNote>

            <SumberDetail>
              Status sumber: {hasil.confidence}. Sumber: {hasil.source?.ref}.
            </SumberDetail>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.cardText, marginBottom: spacing.md },
  btn: { backgroundColor: colors.jawa.icon, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  error: { color: '#B3261E', fontSize: 13, marginBottom: spacing.md, textAlign: 'center' },
  resultCard: { backgroundColor: colors.jawa.bg, borderRadius: 18, padding: spacing.md, marginBottom: spacing.xl },
  resultLabel: { fontSize: 13, fontWeight: '700', color: colors.jawa.icon, marginBottom: spacing.sm },
  symbolBox: { alignItems: 'center', marginVertical: spacing.sm },
  symbolText: { fontSize: 26, fontWeight: '800', color: colors.jawa.icon },
});
