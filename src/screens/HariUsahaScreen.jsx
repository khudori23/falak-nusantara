import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, Calendar as CalendarIcon, CloudRain, Wind, MapPin } from 'lucide-react-native';
import { colors } from '../theme/colors';
import BottomNav from '../components/BottomNav';
import { useFalakData } from '../hooks/useFalakData';
import {
  KATEGORI_USAHA,
  KEGIATAN_PER_KATEGORI,
  METODE_TRADISI,
  GRADE_LABEL,
  gradeColor,
  hitungHariUsaha,
  cariHariTerbaik,
} from '../lib/hariUsaha';

function Chip({ label, active, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive, disabled && styles.chipDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function formatTanggalPanjang(date) {
  return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HariUsahaScreen({ onNavigate }) {
  const { location, locationStatus, refreshLocation } = useFalakData();

  const [kategori, setKategori] = useState(null);
  const [kegiatan, setKegiatan] = useState(null);
  const [metode, setMetode] = useState('GABUNGAN');
  const [mode, setMode] = useState('cek'); // 'cek' | 'cari'
  const [tanggal, setTanggal] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [jumlahHari, setJumlahHari] = useState(7);
  const [showDetail, setShowDetail] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasil, setHasil] = useState(null); // { assessment, breakdown }
  const [hasilList, setHasilList] = useState(null); // array untuk mode cari

  const kegiatanOptions = kategori ? KEGIATAN_PER_KATEGORI[kategori] : [];
  const bisaHitung = kategori !== null && kegiatan !== null && !loading;

  function pilihKategori(k) {
    setKategori(k);
    setKegiatan(null);
    setHasil(null);
    setHasilList(null);
  }

  async function handleCek(tanggalOverride) {
    if (!bisaHitung) return;
    setLoading(true);
    setErrorMsg('');
    setHasil(null);
    setHasilList(null);
    try {
      const target = tanggalOverride || tanggal;
      const r = await hitungHariUsaha({ kategori, kegiatan, metode, tanggal: target, lokasi: location });
      setHasil(r);
      setTanggal(target);
      setMode('cek');
    } catch (e) {
      setErrorMsg(e.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCari() {
    if (!bisaHitung) return;
    setLoading(true);
    setErrorMsg('');
    setHasil(null);
    setHasilList(null);
    try {
      const list = await cariHariTerbaik({ kategori, kegiatan, metode, mulai: tanggal, jumlahHari, lokasi: location });
      if (list.length === 0) setErrorMsg('Tidak ada tanggal yang berhasil dihitung. Coba lagi.');
      setHasilList(list);
    } catch (e) {
      setErrorMsg(e.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  }

  const gc = hasil ? gradeColor(colors, hasil.assessment.grade) : null;
  const bd = hasil?.breakdown;
  const cuaca = bd?.realtime_validation?.weather_detail;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate?.('Beranda')}>
          <ArrowLeft size={18} color={colors.textPrimary} />
          <Text style={styles.backText}>Beranda</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>🌾</Text>
          <Text style={styles.cardTitle}>Hari Baik untuk Usaha & Kegiatan</Text>
          <Text style={styles.cardDesc}>
            Gabungan tradisi Sunda, Jawa, dan Kitab Abu Ma'syar, divalidasi dengan data cuaca
            terkini untuk pertanian, peternakan, pembangunan, dan perniagaan.
          </Text>

          <Text style={styles.fieldLabel}>Kategori</Text>
          <View style={styles.chipRow}>
            {KATEGORI_USAHA.map((k) => (
              <Chip key={k.value} label={k.label} active={kategori === k.value} onPress={() => pilihKategori(k.value)} />
            ))}
          </View>

          {kategori && (
            <>
              <Text style={styles.fieldLabel}>Kegiatan</Text>
              <View style={styles.chipRow}>
                {kegiatanOptions.map((k) => (
                  <Chip key={k.value} label={k.label} active={kegiatan === k.value} onPress={() => setKegiatan(k.value)} />
                ))}
              </View>
            </>
          )}

          <Text style={styles.fieldLabel}>Metode / Tradisi</Text>
          <View style={styles.chipRow}>
            {METODE_TRADISI.map((m) => (
              <Chip key={m.value} label={m.label} active={metode === m.value} onPress={() => setMetode(m.value)} />
            ))}
          </View>

          <Text style={styles.fieldLabel}>Mode</Text>
          <View style={styles.chipRow}>
            <Chip label="Cek Tanggal Ini" active={mode === 'cek'} onPress={() => setMode('cek')} />
            <Chip label="Cari Hari Terbaik" active={mode === 'cari'} onPress={() => setMode('cari')} />
          </View>

          <Text style={styles.fieldLabel}>{mode === 'cek' ? 'Tanggal' : 'Mulai Pencarian Dari'}</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
            <CalendarIcon size={16} color={colors.textSecondary} />
            <Text style={styles.dateText}>{formatTanggalPanjang(tanggal)}</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={tanggal}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selected) => {
                setShowPicker(Platform.OS === 'ios');
                if (selected) setTanggal(selected);
              }}
            />
          )}

          {mode === 'cari' && (
            <>
              <Text style={styles.fieldLabel}>Cari Sejauh</Text>
              <View style={styles.chipRow}>
                <Chip label="7 hari" active={jumlahHari === 7} onPress={() => setJumlahHari(7)} />
                <Chip label="14 hari" active={jumlahHari === 14} onPress={() => setJumlahHari(14)} />
              </View>
            </>
          )}

          <TouchableOpacity style={styles.locationRow} onPress={refreshLocation}>
            <MapPin size={13} color={colors.textSecondary} />
            <Text style={styles.locationText}>
              {locationStatus === 'granted' ? `Lokasi: ${location?.label} (cuaca ikut divalidasi)` : 'Aktifkan lokasi untuk validasi cuaca'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, !bisaHitung && styles.buttonDisabled]}
            disabled={!bisaHitung}
            onPress={mode === 'cek' ? () => handleCek() : handleCari}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>{mode === 'cek' ? 'Hitung' : 'Cari Hari Baik Terbaik'}</Text>
            )}
          </TouchableOpacity>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        </View>

        {hasilList && (
          <View style={styles.card}>
            <Text style={styles.resultLabel}>HASIL REKOMENDASI ({hasilList.length} tanggal dihitung)</Text>
            {hasilList.slice(0, 5).map((h) => {
              const c = gradeColor(colors, h.grade);
              return (
                <TouchableOpacity
                  key={h.tanggal}
                  style={styles.rankRow}
                  onPress={() => handleCek(new Date(h.tanggal))}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rankDate}>{formatTanggalPanjang(new Date(h.tanggal))}</Text>
                    <Text style={styles.rankSub}>{h.actionable_insights?.execution_window}</Text>
                  </View>
                  <View style={[styles.gradeBadge, { backgroundColor: c.bg }]}>
                    <Text style={[styles.gradeBadgeText, { color: c.fg }]}>{h.composite_score}%</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <Text style={styles.tapHint}>Ketuk tanggal untuk lihat rincian lengkap</Text>
          </View>
        )}

        {hasil && (
          <>
            <View style={[styles.card, { borderColor: gc.fg, borderWidth: 1.5 }]}>
              <Text style={styles.resultLabel}>SKOR KEBERKAHAN — {formatTanggalPanjang(tanggal)}</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreBig}>{hasil.assessment.composite_score}%</Text>
                <View style={[styles.gradeBadge, { backgroundColor: gc.bg }]}>
                  <Text style={[styles.gradeBadgeText, { color: gc.fg }]}>{GRADE_LABEL[hasil.assessment.grade]}</Text>
                </View>
              </View>
              <Text style={styles.resultSub}>Metode: {METODE_TRADISI.find((m) => m.value === hasil.assessment.method_used)?.label}</Text>
              {hasil.assessment.actionable_insights?.execution_window && (
                <Text style={styles.resultDesc}>Waktu terbaik: {hasil.assessment.actionable_insights.execution_window}</Text>
              )}
              {hasil.assessment.actionable_insights?.spatial_orientation && (
                <Text style={styles.resultDesc}>
                  Arah mulai: {hasil.assessment.actionable_insights.spatial_orientation.replace(/_/g, ' ').toLowerCase()}
                </Text>
              )}
              {hasil.assessment.actionable_insights?.mitigation_required && (
                <View style={styles.mitigationBox}>
                  <Text style={styles.mitigationText}>
                    Skor tergolong rendah — pertimbangkan menunda kegiatan, atau gunakan penawar tradisional
                    (mis. berdoa dan memilih arah mulai alternatif) jika terpaksa dilakukan.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.resultLabel}>RINCIAN PER TRADISI</Text>
                <TouchableOpacity onPress={() => setShowDetail(!showDetail)}>
                  <Text style={styles.formulaToggle}>{showDetail ? 'Sembunyikan' : 'Bagaimana ini dihitung?'}</Text>
                </TouchableOpacity>
              </View>

              {[
                { key: 'sunda_engine', label: 'Adat Sunda' },
                { key: 'jawa_engine', label: 'Adat Jawa' },
                { key: 'abu_masyar_engine', label: "Kitab Abu Ma'syar" },
              ].map(({ key, label }) => {
                const e = bd?.[key];
                if (!e) return null;
                return (
                  <View key={key} style={styles.engineRow}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.engineLabel}>{label}</Text>
                      <Text style={styles.engineScore}>{e.score}%</Text>
                    </View>
                    {showDetail && (
                      <View style={styles.formulaBox}>
                        {Object.entries(e)
                          .filter(([k]) => !['score', 'implementation_rule', 'rule_version', 'pasaran_epoch_rule_version', 'zodiak_metode'].includes(k))
                          .map(([k, v]) => (
                            <Text key={k} style={styles.formulaLine}>
                              {k.replace(/_/g, ' ')}: {v === null || v === undefined || v === '' ? '—' : String(v)}
                            </Text>
                          ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <View style={styles.card}>
              <Text style={styles.resultLabel}>VALIDASI CUACA REAL-TIME</Text>
              {cuaca?.status === 'OK' ? (
                <>
                  <View style={styles.weatherRow}>
                    <CloudRain size={16} color={cuaca.hujan_ekstrem_terdeteksi ? colors.danger : colors.textSecondary} />
                    <Text style={styles.resultSub}>
                      {cuaca.hujan_ekstrem_terdeteksi ? 'Potensi hujan ekstrem terdeteksi' : 'Tidak ada potensi hujan ekstrem'}
                    </Text>
                  </View>
                  <View style={styles.weatherRow}>
                    <Wind size={16} color={cuaca.angin_kencang_terdeteksi ? colors.danger : colors.textSecondary} />
                    <Text style={styles.resultSub}>
                      {cuaca.angin_kencang_terdeteksi ? 'Potensi angin kencang terdeteksi' : 'Tidak ada potensi angin kencang'}
                    </Text>
                  </View>
                  <Text style={styles.resultSub}>Jendela dicek: {cuaca.jendela_dicek}</Text>
                </>
              ) : (
                <Text style={styles.resultDesc}>
                  {cuaca?.status === 'TIDAK_TERSEDIA'
                    ? 'Data cuaca belum tersedia untuk tanggal/lokasi ini (di luar jangkauan prakiraan 5 hari, atau lokasi belum aktif).'
                    : 'Data cuaca tidak dapat diambil saat ini.'}
                </Text>
              )}
              <Text style={styles.disclaimerSmall}>
                Validasi posisi bulan presisi (ephemeris astronomis) belum tersedia — perhitungan saat ini
                memakai pendekatan tabular tradisional.
              </Text>
            </View>

            <Text style={styles.disclaimer}>
              Hasil di atas adalah interpretasi tradisional untuk edukasi dan refleksi pertanian/peternakan,
              bukan kepastian atau ramalan. Keputusan akhir tetap ada di tangan Anda, dengan mempertimbangkan
              kondisi lapangan yang sebenarnya.
            </Text>
          </>
        )}
      </ScrollView>
      <BottomNav active="Beranda" onNavigate={onNavigate} />
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
  fieldLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.surfaceBorder, backgroundColor: colors.background },
  chipActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipDisabled: { opacity: 0.4 },
  chipText: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  chipTextActive: { color: colors.accent },
  dateInput: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.surfaceBorder, paddingHorizontal: 14, paddingVertical: 12 },
  dateText: { fontSize: 14, color: colors.textPrimary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  locationText: { fontSize: 12, color: colors.textSecondary },
  primaryButton: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.4 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  errorText: { color: colors.danger, fontSize: 13, marginTop: 10, textAlign: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  scoreBig: { fontSize: 32, fontWeight: '800', color: colors.textPrimary },
  gradeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  gradeBadgeText: { fontSize: 12, fontWeight: '800' },
  resultSub: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },
  resultDesc: { fontSize: 13, color: colors.textPrimary, marginTop: 4, lineHeight: 18 },
  mitigationBox: { marginTop: 12, backgroundColor: '#FFF3DD', borderRadius: 10, padding: 12 },
  mitigationText: { fontSize: 12, color: '#8A6300', lineHeight: 17 },
  engineRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.surfaceBorder },
  engineLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  engineScore: { fontSize: 14, fontWeight: '800', color: colors.accent },
  formulaToggle: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  formulaBox: { marginTop: 8, backgroundColor: colors.background, borderRadius: 10, padding: 12 },
  formulaLine: { fontSize: 12, color: colors.textSecondary, marginBottom: 3, textTransform: 'capitalize' },
  weatherRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  disclaimerSmall: { fontSize: 11, color: colors.textSecondary, marginTop: 12, lineHeight: 15, fontStyle: 'italic' },
  disclaimer: { fontSize: 11, color: colors.textSecondary, marginTop: 4, marginBottom: 20, lineHeight: 16, fontStyle: 'italic', textAlign: 'center' },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.surfaceBorder },
  rankDate: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  rankSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  tapHint: { fontSize: 11, color: colors.textSecondary, marginTop: 8, textAlign: 'center', fontStyle: 'italic' },
});
