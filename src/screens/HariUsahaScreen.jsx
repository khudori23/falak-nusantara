import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Calendar as CalendarIcon,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sprout,
  PawPrint,
  Building2,
  Ship,
  Sparkles,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import BottomNav from '../components/BottomNav';
import { useFalakData } from '../hooks/useFalakData';
import {
  KATEGORI_USAHA,
  KEGIATAN_PER_KATEGORI,
  GRADE_LABEL,
  gradeColor,
  hitungHariUsaha,
  cariHariTerbaik,
} from '../lib/hariUsaha';

// -----------------------------------------------------------------------
// Breakpoints
// -----------------------------------------------------------------------
const BP_TABLET = 768;
const BP_DESKTOP = 1100;

const KATEGORI_ICON = {
  PERTANIAN: Sprout,
  PETERNAKAN: PawPrint,
  PEMBANGUNAN: Building2,
  PERNIAGAAN: Ship,
};

const TRADISI_LABEL = {
  jawa: 'Adat Jawa',
  sunda: 'Adat Sunda',
  abu_masyar: "Kitab Abu Ma'syar",
};

function formatTanggalPanjang(date) {
  return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTanggalPendek(date) {
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

// -----------------------------------------------------------------------
// Small building blocks
// -----------------------------------------------------------------------

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

function KategoriCard({ item, active, onPress }) {
  const Icon = KATEGORI_ICON[item.value] || Sprout;
  return (
    <TouchableOpacity
      style={[styles.kategoriCard, active && styles.kategoriCardActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.kategoriIconWrap, active && styles.kategoriIconWrapActive]}>
        <Icon size={18} color={active ? colors.accent : colors.textSecondary} />
      </View>
      <Text style={[styles.kategoriLabel, active && styles.kategoriLabelActive]}>{item.label}</Text>
    </TouchableOpacity>
  );
}

function SegmentedToggle({ options, value, onChange }) {
  return (
    <View style={styles.segmentTrack}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.segmentItem, active && styles.segmentItemActive]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.75}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// -----------------------------------------------------------------------
// Filter panel (full form + compact collapsed bar)
// -----------------------------------------------------------------------

function CompactFilterBar({
  kategoriLabel,
  kegiatanLabel,
  mode,
  tanggal,
  jumlahHari,
  onExpand,
}) {
  const subtitle =
    mode === 'cek'
      ? formatTanggalPendek(tanggal)
      : `Cari ${jumlahHari} hari dari ${formatTanggalPendek(tanggal)}`;
  return (
    <TouchableOpacity style={styles.compactBar} onPress={onExpand} activeOpacity={0.75}>
      <View style={styles.compactBarLeft}>
        <Text style={styles.compactBarTitle} numberOfLines={1}>
          {kegiatanLabel || kategoriLabel}
        </Text>
        <Text style={styles.compactBarSub} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.compactBarChevron}>
        <ChevronDown size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

function FullFilterForm({
  kategori,
  kegiatan,
  kegiatanOptions,
  mode,
  tanggal,
  showPicker,
  jumlahHari,
  location,
  locationStatus,
  loading,
  errorMsg,
  bisaHitung,
  collapsible,
  onPilihKategori,
  onPilihKegiatan,
  onSetMode,
  onOpenPicker,
  onChangePicker,
  onSetJumlahHari,
  onRefreshLocation,
  onSubmit,
  onCollapse,
}) {
  return (
    <View style={styles.filterCard}>
      <View style={styles.filterHeaderRow}>
        <View style={styles.filterHeaderIconWrap}>
          <Sparkles size={16} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Hari Baik untuk Usaha & Kegiatan</Text>
          <Text style={styles.cardDesc}>
            Sintesis Adat Jawa, Adat Sunda, dan Kitab Abu Ma'syar untuk pertanian, peternakan,
            pembangunan, dan perniagaan.
          </Text>
        </View>
        {collapsible && (
          <TouchableOpacity style={styles.collapseBtn} onPress={onCollapse}>
            <ChevronUp size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.fieldLabel}>Kategori</Text>
      <View style={styles.kategoriGrid}>
        {KATEGORI_USAHA.map((k) => (
          <KategoriCard key={k.value} item={k} active={kategori === k.value} onPress={() => onPilihKategori(k.value)} />
        ))}
      </View>

      {kategori && (
        <>
          <Text style={styles.fieldLabel}>Kegiatan</Text>
          <View style={styles.chipRow}>
            {kegiatanOptions.map((k) => (
              <Chip key={k.value} label={k.label} active={kegiatan === k.value} onPress={() => onPilihKegiatan(k.value)} />
            ))}
          </View>
        </>
      )}

      <Text style={styles.fieldLabel}>Mode</Text>
      <SegmentedToggle
        value={mode}
        onChange={onSetMode}
        options={[
          { value: 'cek', label: 'Cek Tanggal Ini' },
          { value: 'cari', label: 'Cari Hari Terbaik' },
        ]}
      />

      <Text style={styles.fieldLabel}>{mode === 'cek' ? 'Tanggal' : 'Mulai Pencarian Dari'}</Text>
      <TouchableOpacity style={styles.dateInput} onPress={onOpenPicker}>
        <CalendarIcon size={16} color={colors.textSecondary} />
        <Text style={styles.dateText}>{formatTanggalPanjang(tanggal)}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={tanggal}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangePicker}
        />
      )}

      {mode === 'cari' && (
        <>
          <Text style={styles.fieldLabel}>Cari Sejauh</Text>
          <View style={styles.chipRow}>
            <Chip label="7 hari" active={jumlahHari === 7} onPress={() => onSetJumlahHari(7)} />
            <Chip label="14 hari" active={jumlahHari === 14} onPress={() => onSetJumlahHari(14)} />
          </View>
        </>
      )}

      <TouchableOpacity style={styles.locationRow} onPress={onRefreshLocation}>
        <MapPin size={13} color={colors.textSecondary} />
        <Text style={styles.locationText}>
          {locationStatus === 'granted'
            ? `Lokasi: ${location?.label} (dikirim ke mesin penghitung)`
            : 'Aktifkan lokasi (opsional)'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryButton, !bisaHitung && styles.buttonDisabled]}
        disabled={!bisaHitung}
        onPress={onSubmit}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>{mode === 'cek' ? 'Hitung' : 'Cari Hari Baik Terbaik'}</Text>
        )}
      </TouchableOpacity>

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
    </View>
  );
}

// -----------------------------------------------------------------------
// Main screen
// -----------------------------------------------------------------------

export default function HariUsahaScreen({ onNavigate }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= BP_TABLET;
  const isDesktop = width >= BP_DESKTOP;
  const isWide = isTablet; // tablet & desktop pakai layout sidebar

  const { location, locationStatus, refreshLocation } = useFalakData();

  const [kategori, setKategori] = useState(null);
  const [kegiatan, setKegiatan] = useState(null);
  const [mode, setMode] = useState('cek'); // 'cek' | 'cari'
  const [tanggal, setTanggal] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [jumlahHari, setJumlahHari] = useState(7);
  const [showDetail, setShowDetail] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasil, setHasil] = useState(null); // { meta, data, spatial_advice, breakdown, executive_summary }
  const [hasilList, setHasilList] = useState(null); // array untuk mode cari

  const [filterExpanded, setFilterExpanded] = useState(true);

  const kegiatanOptions = kategori ? KEGIATAN_PER_KATEGORI[kategori] : [];
  const bisaHitung = kategori !== null && kegiatan !== null && !loading;
  const resultShown = !!(hasil || hasilList);

  // Setelah hitungan baru berhasil, otomatis ciutkan panel filter di layar
  // sempit (HP) supaya hasil dapat ruang penuh dan filter tidak ikut
  // ter-scroll. Di layar lebar (tablet/desktop) filter tetap sebagai
  // sidebar penuh sepanjang waktu.
  useEffect(() => {
    if (!isWide && resultShown) {
      setFilterExpanded(false);
    }
  }, [hasil, hasilList]); // eslint-disable-line react-hooks/exhaustive-deps

  function pilihKategori(k) {
    setKategori(k);
    setKegiatan(null);
    setHasil(null);
    setHasilList(null);
  }

  async function handleCek(tanggalOverride) {
    if (kategori === null || kegiatan === null || loading) return;
    setLoading(true);
    setErrorMsg('');
    setHasil(null);
    setHasilList(null);
    try {
      const target = tanggalOverride || tanggal;
      const r = await hitungHariUsaha({ activityCode: kegiatan, tanggal: target, lokasi: location });
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
      const list = await cariHariTerbaik({ activityCode: kegiatan, mulai: tanggal, jumlahHari, lokasi: location });
      if (list.length === 0) setErrorMsg('Tidak ada tanggal yang berhasil dihitung. Coba lagi.');
      setHasilList(list);
    } catch (e) {
      setErrorMsg(e.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  }

  const data = hasil?.data;
  const spatial = hasil?.spatial_advice;
  const bd = hasil?.breakdown;
  const gc = data ? gradeColor(colors, data.grade) : null;
  const perluMitigasi = data?.grade === 'HINDARI' || bd?.jawa?.is_tali_wangke === true;

  const kategoriLabel = KATEGORI_USAHA.find((k) => k.value === kategori)?.label || 'Pilih kategori';
  const kegiatanLabel = kegiatanOptions.find((k) => k.value === kegiatan)?.label || '';

  const effectiveExpanded = isWide ? true : filterExpanded;

  const filterPanel = effectiveExpanded ? (
    <FullFilterForm
      kategori={kategori}
      kegiatan={kegiatan}
      kegiatanOptions={kegiatanOptions}
      mode={mode}
      tanggal={tanggal}
      showPicker={showPicker}
      jumlahHari={jumlahHari}
      location={location}
      locationStatus={locationStatus}
      loading={loading}
      errorMsg={errorMsg}
      bisaHitung={bisaHitung}
      collapsible={!isWide && resultShown}
      onPilihKategori={pilihKategori}
      onPilihKegiatan={setKegiatan}
      onSetMode={setMode}
      onOpenPicker={() => setShowPicker(true)}
      onChangePicker={(event, selected) => {
        setShowPicker(Platform.OS === 'ios');
        if (selected) setTanggal(selected);
      }}
      onSetJumlahHari={setJumlahHari}
      onRefreshLocation={refreshLocation}
      onSubmit={mode === 'cek' ? () => handleCek() : handleCari}
      onCollapse={() => setFilterExpanded(false)}
    />
  ) : (
    <CompactFilterBar
      kategoriLabel={kategoriLabel}
      kegiatanLabel={kegiatanLabel}
      mode={mode}
      tanggal={tanggal}
      jumlahHari={jumlahHari}
      onExpand={() => setFilterExpanded(true)}
    />
  );

  const resultsMaxWidth = isDesktop ? 720 : isTablet ? 560 : undefined;

  const resultsBody = (
    <>
      {hasilList && (
        <View style={styles.card}>
          <Text style={styles.resultLabel}>HASIL REKOMENDASI ({hasilList.length} tanggal dihitung)</Text>
          {hasilList.slice(0, 5).map((h) => {
            const c = gradeColor(colors, h.grade);
            return (
              <TouchableOpacity key={h.tanggal} style={styles.rankRow} onPress={() => handleCek(new Date(h.tanggal))}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rankDate}>{formatTanggalPanjang(new Date(h.tanggal))}</Text>
                  <Text style={styles.rankSub}>{h.spatial_advice?.recommended_time}</Text>
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

      {hasil && data && (
        <>
          <View style={[styles.card, styles.scoreCard, { borderLeftColor: gc.fg }]}>
            <Text style={styles.resultLabel}>SKOR KEBERKAHAN — {formatTanggalPanjang(tanggal)}</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreBig}>{data.composite_score}%</Text>
              <View style={[styles.gradeBadge, { backgroundColor: gc.bg }]}>
                <Text style={[styles.gradeBadgeText, { color: gc.fg }]}>{GRADE_LABEL[data.grade]}</Text>
              </View>
            </View>
            {spatial?.recommended_time && <Text style={styles.resultDesc}>Waktu terbaik: {spatial.recommended_time}</Text>}
            {spatial?.starting_direction && (
              <Text style={styles.resultDesc}>
                Arah mulai: {String(spatial.starting_direction).replace(/_/g, ' ').toLowerCase()}
              </Text>
            )}
            {perluMitigasi && (
              <View style={styles.mitigationBox}>
                <Text style={styles.mitigationText}>
                  Skor tergolong rendah{bd?.jawa?.is_tali_wangke ? ' dan terkena penalti Tali/Sampar Wangke' : ''} —
                  pertimbangkan menunda kegiatan, atau gunakan penawar tradisional (mis. berdoa dan memilih arah
                  mulai alternatif) jika terpaksa dilakukan.
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

            {['jawa', 'sunda', 'abu_masyar'].map((key) => {
              const e = bd?.[key];
              if (!e) return null;
              return (
                <View key={key} style={styles.engineRow}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.engineLabel}>{TRADISI_LABEL[key]}</Text>
                    <Text style={styles.engineScore}>{e.score}%</Text>
                  </View>
                  {showDetail && (
                    <View style={styles.formulaBox}>
                      {Object.entries(e)
                        .filter(([k]) => k !== 'score')
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

            {hasil.weather && (
              <View style={styles.engineRow}>
                <View style={styles.rowBetween}>
                  <Text style={styles.engineLabel}>Cuaca Real-time</Text>
                  <Text style={styles.engineScore}>
                    {hasil.weather.applied ? `×${hasil.weather.multiplier.toFixed(2)}` : '—'}
                  </Text>
                </View>
                {showDetail && (
                  <View style={styles.formulaBox}>
                    <Text style={styles.formulaLine}>kondisi: {hasil.weather.condition}</Text>
                    {!hasil.weather.applied && (
                      <Text style={styles.formulaLine}>
                        catatan:{' '}
                        {hasil.weather.source === 'OUT_OF_FORECAST_RANGE'
                          ? 'tanggal di luar jangkauan prakiraan (maks. 5 hari)'
                          : hasil.weather.source === 'NO_LOCATION'
                          ? 'lokasi tidak tersedia'
                          : hasil.weather.source === 'NO_API_KEY'
                          ? 'integrasi cuaca belum aktif'
                          : hasil.weather.source === 'OPENWEATHERMAP_NOT_APPLIED'
                          ? 'kegiatan ini tidak dipengaruhi cuaca'
                          : 'multiplier netral'}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>

          {hasil.executive_summary && (
            <View style={styles.card}>
              <Text style={styles.resultLabel}>RINGKASAN</Text>
              <Text style={styles.resultDesc}>{hasil.executive_summary}</Text>
              <Text style={styles.disclaimerSmall}>
                Perhitungan lunar Abu Ma'syar bersifat estimasi matematis, bukan posisi bulan astronomis presisi.
              </Text>
              {hasil.weather?.applied && (
                <Text style={styles.disclaimerSmall}>
                  Skor dasar tradisional {hasil.calculation_audit?.raw_score}% × multiplier cuaca real-time (
                  {hasil.weather.condition}, ×{hasil.weather.multiplier.toFixed(2)}) = skor akhir {data.composite_score}%.
                </Text>
              )}
            </View>
          )}

          <Text style={styles.disclaimer}>
            Hasil di atas adalah interpretasi tradisional untuk edukasi dan refleksi pertanian/peternakan, bukan
            kepastian atau ramalan. Keputusan akhir tetap ada di tangan Anda, dengan mempertimbangkan kondisi
            lapangan yang sebenarnya.
          </Text>
        </>
      )}

      {!resultShown && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Pilih kategori dan kegiatan di {isWide ? 'panel sebelah kiri' : 'atas'}, lalu tekan Hitung untuk melihat
            skor keberkahan.
          </Text>
        </View>
      )}
    </>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={[styles.body, isWide && styles.bodyWide]}>
        <View style={[styles.filterColumn, isWide && { width: isDesktop ? 360 : 320 }]}>
          {filterPanel}
        </View>

        <ScrollView
          style={styles.resultsColumn}
          contentContainerStyle={[
            styles.resultsContent,
            isWide && { alignItems: 'center' },
            { paddingBottom: insets.bottom + 84 },
          ]}
        >
          <View style={[{ width: '100%' }, resultsMaxWidth && { maxWidth: resultsMaxWidth }]}>{resultsBody}</View>
        </ScrollView>
      </View>

      <View style={styles.bottomNavWrap}>
        <BottomNav active="Beranda" onNavigate={onNavigate} />
      </View>
    </View>
  );
}

// -----------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  bottomNavWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.background },
  body: { flex: 1, flexDirection: 'column' },
  bodyWide: { flexDirection: 'row' },

  filterColumn: { paddingHorizontal: 16, paddingTop: 12 },
  resultsColumn: { flex: 1 },
  resultsContent: { paddingHorizontal: 16, paddingTop: 12 },

  // --- Full filter card ---
  filterCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 12,
  },
  filterHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 4 },
  filterHeaderIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  collapseBtn: { padding: 4 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 3 },
  cardDesc: { fontSize: 12.5, color: colors.textSecondary, lineHeight: 17 },

  fieldLabel: { fontSize: 11.5, color: colors.textSecondary, fontWeight: '700', marginBottom: 7, marginTop: 14, letterSpacing: 0.3, textTransform: 'uppercase' },

  // --- Kategori grid (2 kolom kartu berikon) ---
  kategoriGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kategoriCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.background,
  },
  kategoriCardActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  kategoriIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kategoriIconWrapActive: { backgroundColor: '#FFFFFF' },
  kategoriLabel: { fontSize: 12.5, fontWeight: '600', color: colors.textPrimary, flexShrink: 1 },
  kategoriLabelActive: { color: colors.accent },

  // --- Chip (kegiatan / cari-sejauh) ---
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.surfaceBorder, backgroundColor: colors.background },
  chipActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipDisabled: { opacity: 0.4 },
  chipText: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  chipTextActive: { color: colors.accent },

  // --- Mode segmented toggle ---
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 3,
  },
  segmentItem: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  segmentItemActive: { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  segmentText: { fontSize: 12.5, fontWeight: '600', color: colors.textSecondary },
  segmentTextActive: { color: colors.accent, fontWeight: '700' },

  dateInput: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.surfaceBorder, paddingHorizontal: 14, paddingVertical: 12 },
  dateText: { fontSize: 14, color: colors.textPrimary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  locationText: { fontSize: 12, color: colors.textSecondary, flexShrink: 1 },
  primaryButton: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.4 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  errorText: { color: colors.danger, fontSize: 13, marginTop: 10, textAlign: 'center' },

  // --- Compact filter bar (mobile, muncul setelah ada hasil) ---
  compactBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  compactBarLeft: { flex: 1, marginRight: 8 },
  compactBarTitle: { fontSize: 13.5, fontWeight: '700', color: colors.textPrimary },
  compactBarSub: { fontSize: 11.5, color: colors.textSecondary, marginTop: 1 },
  compactBarChevron: { width: 26, height: 26, borderRadius: 8, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },

  // --- Result cards ---
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.surfaceBorder },
  scoreCard: { borderLeftWidth: 3 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  scoreBig: { fontSize: 32, fontWeight: '800', color: colors.textPrimary },
  gradeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  gradeBadgeText: { fontSize: 12, fontWeight: '800' },
  resultDesc: { fontSize: 13, color: colors.textPrimary, marginTop: 4, lineHeight: 18 },
  mitigationBox: { marginTop: 12, backgroundColor: '#FFF3DD', borderRadius: 10, padding: 12 },
  mitigationText: { fontSize: 12, color: '#8A6300', lineHeight: 17 },
  engineRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.surfaceBorder },
  engineLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  engineScore: { fontSize: 14, fontWeight: '800', color: colors.accent },
  formulaToggle: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  formulaBox: { marginTop: 8, backgroundColor: colors.background, borderRadius: 10, padding: 12 },
  formulaLine: { fontSize: 12, color: colors.textSecondary, marginBottom: 3, textTransform: 'capitalize' },
  disclaimerSmall: { fontSize: 11, color: colors.textSecondary, marginTop: 12, lineHeight: 15, fontStyle: 'italic' },
  disclaimer: { fontSize: 11, color: colors.textSecondary, marginTop: 4, marginBottom: 8, lineHeight: 16, fontStyle: 'italic', textAlign: 'center' },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.surfaceBorder },
  rankDate: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  rankSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  tapHint: { fontSize: 11, color: colors.textSecondary, marginTop: 8, textAlign: 'center', fontStyle: 'italic' },

  emptyState: { paddingVertical: 40, paddingHorizontal: 20, alignItems: 'center' },
  emptyStateText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 19 },
});
