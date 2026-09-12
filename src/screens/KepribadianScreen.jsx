import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react-native';
import { colors } from '../theme/colors';
import BottomNav from '../components/BottomNav';
import { hitungWeton } from '../lib/weton';
import { hitungAbjad } from '../lib/abjad';
import { interpretasiAbjad } from '../lib/abjadInterpretasi';
import { PLANET_HARI } from '../lib/abuMasyar';
import { UNSUR_HARI, HARI_NAAS } from '../lib/dayUnsur';
import { lakuDariNeptu } from '../lib/lakuNeptu';
import { supabase } from '../lib/supabase';
import { useFalakData } from '../hooks/useFalakData';

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildKesimpulanLengkap(hasil, consensus) {
  if (!consensus || !consensus.kesimpulan) return null;
  let teks = consensus.kesimpulan
    .replace(/Ingat,\s*ini pembacaan simbolik[^.]*\./g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (hasil?.laku) {
    teks += ` Secara watak, weton ini tergolong ${hasil.laku.nama} — ${hasil.laku.desc}`;
  }
  if (hasil?.planet) {
    teks += ` Dari sisi Abu Ma'syar, hari lahir Anda dinaungi planet ${hasil.planet.planet} berunsur ${hasil.planet.unsur}, yang cenderung membawa sifat ${hasil.planet.sifat}.`;
  }
  if (hasil?.unsur) {
    teks += ` Menurut Primbon Jawa, kelahiran pada hari berunsur ${hasil.unsur.unsur} ini membawa kecenderungan ${hasil.unsur.positif}, meski perlu diwaspadai sisi ${hasil.unsur.perhatian}. Bidang karier yang sering dikaitkan dengan unsur ini antara lain ${hasil.unsur.karier}.`;
  }
  if (hasil?.naas) {
    teks += ` Hari yang perlu lebih diwaspadai bagi weton ini adalah hari ${hasil.naas}.`;
  }
  return teks;
}
export default function KepribadianScreen({ onNavigate }) {
  const { location } = useFalakData();
  const [nama, setNama] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  function openDatePicker() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: tanggalLahir || new Date(2000, 0, 1),
        mode: 'date',
        maximumDate: new Date(),
        onChange: (event, selected) => {
          if (event.type === 'set' && selected) setTanggalLahir(selected);
        },
      });
    } else {
      setShowPicker(true);
    }
  }
  const [showFormula, setShowFormula] = useState(false);

  const bisaHitung = nama.trim().length > 0 && tanggalLahir !== null;
  const [hasil, setHasil] = useState(null);
  const [consensus, setConsensus] = useState(null);
  const [loadingConsensus, setLoadingConsensus] = useState(false);
  const [errorConsensus, setErrorConsensus] = useState(null);

  async function handleHitung() {
    if (!bisaHitung) return;
    const weton = hitungWeton(tanggalLahir);
    const abjad = hitungAbjad(nama);
    const planet = PLANET_HARI[weton.hari];
    const unsur = UNSUR_HARI[weton.hari];
    const naas = HARI_NAAS[weton.hari];
    const laku = lakuDariNeptu(weton.totalNeptu);
    const tafsirAbjad = interpretasiAbjad(abjad.total);
    setHasil({ weton, abjad, planet, unsur, naas, laku, tafsirAbjad });

    setConsensus(null);
    setErrorConsensus(null);
    setLoadingConsensus(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-traditional-natal', {
        body: {
          birth_date: fmtDate(tanggalLahir),
          timezone: 'Asia/Jakarta',
          latitude: location?.lat ?? null,
          longitude: location?.lng ?? null,
        },
      });
      if (error) throw error;
      setConsensus(data);
    } catch (e) {
      setErrorConsensus(e.message || 'Gagal memuat keberkahan multi-tradisi.');
    } finally {
      setLoadingConsensus(false);
    }
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
          <TouchableOpacity style={styles.dateInput} onPress={openDatePicker}>
            <CalendarIcon size={16} color={colors.textSecondary} />
            <Text style={styles.dateText}>
              {tanggalLahir ? tanggalLahir.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pilih tanggal lahir'}
            </Text>
          </TouchableOpacity>
          {showPicker && Platform.OS === 'ios' && (
            <DateTimePicker
              value={tanggalLahir || new Date(2000, 0, 1)}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(event, selected) => {
                setShowPicker(false);
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

            {loadingConsensus ? (
              <View style={styles.card}>
                <Text style={styles.resultLabel}>KEBERKAHAN & HARI BAIK (MULTI-TRADISI)</Text>
                <Text style={styles.resultDesc}>Menghitung Jawa, Sunda &amp; Abu Ma'syar…</Text>
              </View>
            ) : errorConsensus ? (
              <View style={styles.card}>
                <Text style={styles.resultLabel}>KEBERKAHAN & HARI BAIK (MULTI-TRADISI)</Text>
                <Text style={styles.resultDesc}>{errorConsensus}</Text>
              </View>
            ) : consensus ? (
              <View style={styles.card}>
                <Text style={styles.resultLabel}>KEBERKAHAN & HARI BAIK (MULTI-TRADISI)</Text>
                <View style={styles.consensusRow}>
                  <View style={styles.consensusItem}>
                    <Text style={styles.consensusScore}>{consensus.consensus.personality.score}</Text>
                    <Text style={styles.consensusLabel}>Kepribadian</Text>
                    <Text style={styles.consensusTag}>{consensus.consensus.personality.label}</Text>
                  </View>
                  <View style={styles.consensusItem}>
                    <Text style={styles.consensusScore}>{consensus.consensus.wealth.score}</Text>
                    <Text style={styles.consensusLabel}>Rezeki</Text>
                    <Text style={styles.consensusTag}>{consensus.consensus.wealth.label}</Text>
                  </View>
                  <View style={styles.consensusItem}>
                    <Text style={styles.consensusScore}>{consensus.consensus.lampah.score}</Text>
                    <Text style={styles.consensusLabel}>Lampah</Text>
                    <Text style={styles.consensusTag}>{consensus.consensus.lampah.label}</Text>
                  </View>
                </View>
                <Text style={styles.resultDesc}>
                  Sunda: {consensus.sunda.detail.hari} {consensus.sunda.detail.pasaran} · Naktu {consensus.sunda.detail.naktu_total} ({consensus.sunda.detail.day_quality})
                </Text>
                <Text style={styles.resultDesc}>
                  Abu Ma'syar: presisi {consensus.abu_mashar.precision === 'natal' ? 'lengkap (jam+lokasi)' : 'sebagian (tanpa jam/lokasi)'}
                  {consensus.abu_mashar.ascendant ? ` · Ascendant ${consensus.abu_mashar.ascendant.sign}` : ''}
                </Text>
                <Text style={styles.formulaTotal}>Skor gabungan 3 tradisi: {consensus.quality.score}/100 ({consensus.quality.status})</Text>
                <Text style={styles.disclaimer}>{consensus.disclaimer}</Text>
              </View>
            ) : null}
            {consensus && buildKesimpulanLengkap(hasil, consensus) && (
              <View style={styles.card}>
                <Text style={styles.resultLabel}>KESIMPULAN</Text>
                <Text style={styles.kesimpulanText}>{buildKesimpulanLengkap(hasil, consensus)}</Text>
              </View>
            )}


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
  kesimpulanText: { fontSize: 14, color: colors.textPrimary, marginTop: 6, lineHeight: 21 },
  disclaimer: { fontSize: 11, color: colors.textSecondary, marginTop: 4, marginBottom: 20, lineHeight: 16, fontStyle: 'italic', textAlign: 'center' },
  consensusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 10 },
  consensusItem: { alignItems: 'center', flex: 1 },
  consensusScore: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  consensusLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  consensusTag: { fontSize: 11, fontWeight: '700', color: colors.accent, marginTop: 2, textTransform: 'capitalize' },
});
