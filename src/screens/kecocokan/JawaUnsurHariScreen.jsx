import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import ScreenHeader from './ScreenHeader';
import DateField from './DateField';
import PractitionerNote from './PractitionerNote';
import { hitungWeton } from '../../lib/weton';
import { UNSUR_HARI, buatNarasiUnsurHari } from '../../lib/dayUnsur';
import { colors, spacing } from './theme';

export default function JawaUnsurHariScreen({ onBack }) {
  const [tglPria, setTglPria] = useState(null);
  const [tglWanita, setTglWanita] = useState(null);
  const [hasil, setHasil] = useState(null);

  const bisaHitung = !!tglPria && !!tglWanita;

  function hitung() {
    const hariPria = hitungWeton(tglPria).hari;
    const hariWanita = hitungWeton(tglWanita).hari;
    const unsurPria = UNSUR_HARI[hariPria];
    const unsurWanita = UNSUR_HARI[hariWanita];
    const sama = unsurPria.unsur === unsurWanita.unsur;

    setHasil({ hariPria, hariWanita, unsurPria, unsurWanita, sama });
  }

  const narasi = hasil ? buatNarasiUnsurHari(hasil) : '';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Kecocokan Unsur Hari" onBack={onBack} palette={colors.jawa} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
        <Text style={styles.sectionTitle}>Data Kelahiran</Text>

        <DateField label="Tanggal lahir pria" value={tglPria} onChange={setTglPria} />
        <DateField label="Tanggal lahir wanita" value={tglWanita} onChange={setTglWanita} />

        <Pressable disabled={!bisaHitung} onPress={hitung} style={[styles.btn, { opacity: bisaHitung ? 1 : 0.5 }]}>
          <Text style={styles.btnText}>Hitung Kecocokan</Text>
        </Pressable>

        {hasil && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>
              Unsur {hasil.unsurPria.unsur} × Unsur {hasil.unsurWanita.unsur}
            </Text>

            <View style={styles.personBox}>
              <Text style={styles.personTitle}>Pria — {hasil.hariPria} ({hasil.unsurPria.unsur})</Text>
              <Text style={styles.personText}>Positif: {hasil.unsurPria.positif}</Text>
              <Text style={styles.personText}>Perhatian: {hasil.unsurPria.perhatian}</Text>
            </View>
            <View style={styles.personBox}>
              <Text style={styles.personTitle}>Wanita — {hasil.hariWanita} ({hasil.unsurWanita.unsur})</Text>
              <Text style={styles.personText}>Positif: {hasil.unsurWanita.positif}</Text>
              <Text style={styles.personText}>Perhatian: {hasil.unsurWanita.perhatian}</Text>
            </View>

            <PractitionerNote>{narasi}</PractitionerNote>
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
  resultLabel: { fontSize: 14, fontWeight: '700', color: colors.jawa.icon, marginBottom: spacing.sm, textAlign: 'center' },
  personBox: { backgroundColor: '#fff', borderRadius: 12, padding: spacing.sm, marginBottom: spacing.sm },
  personTitle: { fontSize: 13, fontWeight: '700', color: colors.cardText, marginBottom: 4 },
  personText: { fontSize: 12.5, color: colors.cardSubtext, lineHeight: 18 },
});
