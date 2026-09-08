import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react-native';
import { colors } from '../theme/colors';
import BottomNav from '../components/BottomNav';
import { hitungWeton } from '../lib/weton';
import { hitungAbjad } from '../lib/abjad';
import { interpretasiAbjad } from '../lib/abjadInterpretasi';
import { PLANET_HARI } from '../lib/abuMasyar';
import { UNSUR_HARI, HARI_NAAS } from '../lib/dayUnsur';
import { lakuDariNeptu } from '../lib/lakuNeptu';

export default function KepribadianScreen({ onNavigate }) {
  const [nama, setNama] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  const bisaHitung = nama.trim().length > 0 && tanggalLahir !== null;
  const [hasil, setHasil] = useState(null);

  function handleHitung() {
    if (!bisaHitung) return;
    const weton = hitungWeton(tanggalLahir);
    const abjad = hitungAbjad(nama);
    const planet = PLANET_HARI[weton.hari];
    const unsur = UNSUR_HARI[weton.hari];
    const naas = HARI_NAAS[weton.hari];
    const laku = lakuDariNeptu(weton.totalNeptu);
    const tafsirAbjad = interpretasiAbjad(abjad.total);
    setHasil({ weton, abjad, planet, unsur, naas, laku, tafsirAbjad });
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate?.('Eksplorasi')}>
          <ArrowLeft size={18} color={colors.textPrimary} />
          <Text style={styles.backText}>Eksplorasi</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>🌙</Text>
          <Text style={styles.cardTitle}>Kepribadian Tradisional</Text>
          <Text style={styles.cardDesc}>
            Gabungan Abjad nama, weton (hari + pasaran), dan penguasa planet hari kelahiran
            menurut tradisi Abu Ma'syar.
          </Text>

          <Text style={styles.fieldLabel}>Nama Lengkap</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Muhammad Fadhil"
            placeholderTextColor="#A6A49C"
            value={nama}
            onChangeText={setNama}
          />

          <Text style={styles.fieldLabel}>Tanggal Lahir</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
            <CalendarIcon size={16} color={colors.textSecondary} />
            <Text style={styles.dateText}>
              {tanggalLahir ? tanggalLahir.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pilih tanggal lahir'}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={tanggalLahir || new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(event, selected) => {
                setShowPicker(Platform.OS === 'ios');
                if (selected) setTanggalLahir(selected);
              }}
            />
          )}

          <TouchableOpacity
            style={[styles.primaryButton, !bisaHitung && styles.buttonDisabled]}
            disabled={!bisaHitung}
            onPress={handleHitung}
          >
            <Text style={styles.primaryButtonText}>Lihat Kepribadian</Text>
          </TouchableOpacity>
        </View>

        {hasil && (
          <>
            <View style={styles.card}>
              <Text style={styles.resultLabel}>WETON ANDA</Text>
              <Text style={styles.resultBig}>{hasil.weton.hari} {hasil.weton.pasaran}</Text>
              <Text style={styles.resultSub}>Total Neptu: {hasil.weton.totalNeptu} · {hasil.laku.nama}</Text>
              <Text style={styles.resultDesc}>{hasil.laku.desc}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.resultLabel}>UNSUR HARI LAHIR (PRIMBON JAWA)</Text>
              <Text style={styles.resultBig}>{hasil.weton.hari} · Unsur {hasil.unsur.unsur}</Text>
              <Text style={styles.resultDesc}>
                Kecenderungan positif: {hasil.unsur.positif}. Perlu diwaspadai: {hasil.unsur.perhatian}.
              </Text>
              <Text style={styles.resultSub}>Karier yang sering dikaitkan: {hasil.unsur.karier}</Text>
              <Text style={styles.resultSub}>Hari yang perlu lebih waspada (hari naas): {hasil.naas}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.resultLabel}>PLANET PENGUASA HARI (ABU MA'SYAR)</Text>
              <Text style={styles.resultBig}>{hasil.planet.planet} · Unsur {hasil.planet.unsur}</Text>
              <Text style={styles.resultDesc}>Cenderung membawa sifat {hasil.planet.sifat}.</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.resultLabel}>NILAI ABJAD NAMA</Text>
                <TouchableOpacity onPress={() => setShowFormula(!showFormula)}>
                  <Text style={styles.formulaToggle}>{showFormula ? 'Sembunyikan' : 'Bagaimana ini dihitung?'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.resultBig}>{hasil.abjad.total}</Text>
              <Text style={styles.resultSub}>Unsur {hasil.tafsirAbjad.nama}</Text>
              <Text style={styles.resultDesc}>{hasil.tafsirAbjad.deskripsi}</Text>
              {showFormula && (
                <View style={styles.formulaBox}>
                  {hasil.abjad.breakdown.map((b, i) => (
                    <Text key={i} style={styles.formulaLine}>
                      {b.latin.toUpperCase()} → {b.hijaiyah || '—'} = {b.value}
                    </Text>
                  ))}
                  <Text style={styles.formulaTotal}>Total = {hasil.abjad.total} (normalisasi: {hasil.abjad.normalisasi})</Text>
                </View>
              )}
            </View>

            <Text style={styles.disclaimer}>
              Hasil di atas adalah interpretasi tradisional untuk edukasi dan refleksi,
              bukan kepastian atau ramalan masa depan.
            </Text>
          </>
        )}
      </ScrollView>
      <BottomNav active="Eksplorasi" onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: colors.surfaceBorder },
  cardIcon: { fontSize: 22, marginBottom: 6 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: colors.textSecondary, marginBottom: 14, lineHeight: 18 },
  fieldLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginBottom: 6, marginTop: 6 },
  input: { backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.surfaceBorder, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.textPrimary },
  dateInput: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.surfaceBorder, paddingHorizontal: 14, paddingVertical: 12 },
  dateText: { fontSize: 14, color: colors.textPrimary },
  primaryButton: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.4 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  resultBig: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  resultSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  resultDesc: { fontSize: 13, color: colors.textPrimary, marginTop: 8, lineHeight: 18 },
  formulaToggle: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  formulaBox: { marginTop: 10, backgroundColor: colors.background, borderRadius: 10, padding: 12 },
  formulaLine: { fontSize: 12, color: colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  formulaTotal: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginTop: 8 },
  disclaimer: { fontSize: 11, color: colors.textSecondary, marginTop: 4, marginBottom: 20, lineHeight: 16, fontStyle: 'italic', textAlign: 'center' },
});
