import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import ScreenHeader from './ScreenHeader';
import DateField from './DateField';
import PractitionerNote from './PractitionerNote';
import SumberDetail from './SumberDetail';
import { hitungWeton } from '../../lib/weton';
import { salakiRabiDariNeptu } from '../../lib/petungSalakiRabi';
import { colors, spacing } from './theme';

export default function JawaSalakiRabiScreen({ onBack }) {
  const [tglPria, setTglPria] = useState(null);
  const [tglWanita, setTglWanita] = useState(null);
  const [hasil, setHasil] = useState(null);

  const bisaHitung = !!tglPria && !!tglWanita;

  function hitung() {
    const pria = hitungWeton(tglPria);
    const wanita = hitungWeton(tglWanita);
    const total = pria.totalNeptu + wanita.totalNeptu;
    const salaki = salakiRabiDariNeptu(total);
    setHasil({ pria, wanita, total, salaki });
  }

  const narasi = hasil
    ? `Total neptu gabungan kalian berdua adalah ${hasil.total}, yang menurut Petung Salaki Rabi jatuh pada golongan ${hasil.salaki.nama}. ${hasil.salaki.desc}`
    : '';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Petung Salaki Rabi" onBack={onBack} palette={colors.jawa} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
        <Text style={styles.sectionTitle}>Data Kelahiran</Text>

        <DateField label="Tanggal lahir pria" value={tglPria} onChange={setTglPria} />
        <DateField label="Tanggal lahir wanita" value={tglWanita} onChange={setTglWanita} />

        <Pressable disabled={!bisaHitung} onPress={hitung} style={[styles.btn, { opacity: bisaHitung ? 1 : 0.5 }]}>
          <Text style={styles.btnText}>Hitung Kecocokan</Text>
        </Pressable>

        {hasil && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Petung Salaki Rabi</Text>

            <View style={styles.row}>
              <Text style={styles.rowKey}>Weton pria</Text>
              <Text style={styles.rowVal}>{hasil.pria.hari} {hasil.pria.pasaran} (neptu {hasil.pria.totalNeptu})</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>Weton wanita</Text>
              <Text style={styles.rowVal}>{hasil.wanita.hari} {hasil.wanita.pasaran} (neptu {hasil.wanita.totalNeptu})</Text>
            </View>

            <View style={styles.symbolBox}>
              <Text style={styles.symbolText}>{hasil.salaki.nama}</Text>
            </View>

            <PractitionerNote>{narasi}</PractitionerNote>

            <SumberDetail>
              Sumber: Hartono, "Petung dalam Primbon Jawa" — status VERIFIED_ACADEMIC.
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
  resultCard: { backgroundColor: colors.jawa.bg, borderRadius: 18, padding: spacing.md, marginBottom: spacing.xl },
  resultLabel: { fontSize: 13, fontWeight: '700', color: colors.jawa.icon, marginBottom: spacing.sm },
  row: { marginBottom: 8 },
  rowKey: { fontSize: 11.5, color: colors.cardSubtext },
  rowVal: { fontSize: 13.5, color: colors.cardText, fontWeight: '600' },
  symbolBox: { alignItems: 'center', marginVertical: spacing.sm },
  symbolText: { fontSize: 22, fontWeight: '800', color: colors.jawa.icon, textAlign: 'center' },
});
