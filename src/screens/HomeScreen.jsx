import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Moon, Compass, Calendar, Heart, Sprout, Clock, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useBreakpoint } from '../theme/responsive';
import { useFalakData } from '../hooks/useFalakData';
import AppShell from '../components/AppShell';
import { supabase } from '../lib/supabase';
import { getJadwalSholat, getNextPrayer } from '../lib/jadwalSholat';
import WeatherRow from '../components/WeatherRow';

const MENU = [
  { key: 'arah', icon: Compass, title: 'Arah Kiblat', desc: 'Temukan arah kiblat dengan mudah', bg: '#DDF1E8', fg: '#238A69', route: 'Arah' },
  { key: 'kalender', icon: Calendar, title: 'Kalender Hijriah', desc: 'Lihat tanggal penting Islam', bg: '#E5ECFF', fg: '#3869D8', route: 'Kalender' },
  { key: 'kepribadian', icon: Moon, title: 'Kepribadian', desc: 'Ketahui sifat dan potensi diri', bg: '#EEE6FB', fg: '#6943A9', route: 'Kepribadian' },
  { key: 'jodoh', icon: Heart, title: 'Perjodohan', desc: 'Temukan pasangan terbaik', bg: '#FDE6E5', fg: '#D95A58', route: 'Perjodohan' },
  { key: 'hari_usaha', icon: Sprout, title: 'Hari Baik Usaha', desc: 'Pilih waktu terbaik untuk memulai usaha', bg: '#E0F5E9', fg: '#20A56B', route: 'HariUsaha' },
  { key: 'akad_nikah', icon: Calendar, title: 'Akad Nikah', desc: 'Persiapkan pernikahan dengan matang', bg: '#EEE6FB', fg: '#7146AD', route: 'AkadNikah' },
];

const CATEGORY_LABELS = {
  kiblat: 'Kiblat',
  kalender_hijriah: 'Kalender Hijriah',
  perjodohan: 'Perjodohan',
  kepribadian: 'Kepribadian',
  planet: "Abu Ma'syar",
};

const ALL_PRAYER_ROWS = [
  { key: 'imsak', label: 'Imsak' },
  { key: 'subuh', label: 'Subuh' },
  { key: 'terbit', label: 'Terbit' },
  { key: 'dzuhur', label: 'Dzuhur' },
  { key: 'ashar', label: 'Ashar' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isya', label: 'Isya' },
];

const DEFAULT_MENU_COUNT = 4;

export default function HomeScreen({ onNavigate }) {
  const { columns } = useBreakpoint();
  const { hariLabel, tanggalMasehi, hijriLabel, location, locationStatus, astro, refreshLocation } = useFalakData();
  const [sholatJadwal, setSholatJadwal] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [loadingSholat, setLoadingSholat] = useState(true);
  const [errorSholat, setErrorSholat] = useState(null);
  const [sholatExpanded, setSholatExpanded] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);

  useEffect(() => {
    if (!location?.lat || !location?.lng) return;
    let active = true;
    setLoadingSholat(true);
    setErrorSholat(null);
    getJadwalSholat({ latitude: location.lat, longitude: location.lng })
      .then((result) => {
        if (!active) return;
        setSholatJadwal(result);
        setNextPrayer(getNextPrayer(result));
      })
      .catch((e) => { if (active) setErrorSholat(e.message || 'Gagal memuat jadwal sholat.'); })
      .finally(() => { if (active) setLoadingSholat(false); });
    return () => { active = false; };
  }, [location?.lat, location?.lng]);

  useEffect(() => {
    if (!sholatJadwal) return;
    const interval = setInterval(() => setNextPrayer(getNextPrayer(sholatJadwal)), 60000);
    return () => clearInterval(interval);
  }, [sholatJadwal]);

  const tileWidth = columns >= 4 ? '23%' : columns === 3 ? '31%' : '47%';
  const canToggleMenu = columns < 3 && MENU.length > DEFAULT_MENU_COUNT;
  const visibleMenu = canToggleMenu && !menuExpanded ? MENU.slice(0, DEFAULT_MENU_COUNT) : MENU;

  const [dailyContent, setDailyContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    async function fetchDailyContent() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('daily_content')
          .select('fact_text, category')
          .eq('date', today)
          .single();
        if (!error && data) {
          setDailyContent(data);
        }
      } catch (e) {
        console.log('Gagal mengambil daily_content:', e);
      } finally {
        setLoadingContent(false);
      }
    }
    fetchDailyContent();
  }, []);

  const badgeLabel = dailyContent ? (CATEGORY_LABELS[dailyContent.category] || 'Tradisional') : "Abu Ma'syar";
  const fallbackQuote = `Hari ${hariLabel} di bawah naungan unsur angin memberikan kebaikan untuk memulai perjalanan dan musyawarah penting. Tetap kedepankan ikhtiar terbaik.`;

  const heroHeader = (
    <>
      <LinearGradient
        colors={['#347BA8', '#2E658D', '#173F48']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.rowBetween}>
          {locationStatus === 'granted' ? (
            <View style={styles.locationBadge}>
              <View style={styles.locationIconWrap}>
                <MapPin size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.locationText}>{location?.label}</Text>
            </View>
          ) : locationStatus === 'loading' ? (
            <View style={styles.locationBadge}>
              <View style={styles.locationIconWrap}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
              <Text style={styles.locationText}>Mendeteksi lokasi…</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.locationBadge} onPress={refreshLocation}>
              <View style={styles.locationIconWrap}>
                <MapPin size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.locationText}>Aktifkan lokasi</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.date}>{hariLabel}, {tanggalMasehi}</Text>
        <Text style={styles.hijri}>{hijriLabel}</Text>
        <Text style={styles.method}>Hisab Klasik Nusantara (estimasi tabular)</Text>

        <View style={styles.heroDivider} />
        <WeatherRow />
      </LinearGradient>

      <View style={styles.card}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.titleLeft}>
            <View style={styles.titleIconWrap}>
              <Clock size={18} color="#14786C" />
            </View>
            <Text style={styles.cardTitle}>Jadwal Sholat</Text>
          </View>
        </View>

        {locationStatus !== 'granted' ? (
          <Text style={styles.subInfo}>Aktifkan lokasi untuk melihat jadwal sholat.</Text>
        ) : loadingSholat ? (
          <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 10 }} />
        ) : errorSholat ? (
          <Text style={styles.subInfo}>{errorSholat}</Text>
        ) : (
          <>
            <TouchableOpacity
              style={styles.nextPrayerBox}
              activeOpacity={0.8}
              onPress={() => setSholatExpanded((v) => !v)}
            >
              <View style={styles.nextPrayerRow}>
                <View>
                  <Text style={styles.nextPrayerBoxLabel}>SHOLAT BERIKUTNYA</Text>
                  <Text style={styles.nextPrayerBoxName}>{nextPrayer?.label}</Text>
                </View>
                <View style={styles.nextPrayerRight}>
                  <View style={styles.nextPrayerTimeRow}>
                    <Clock size={16} color="#135D58" />
                    <Text style={styles.nextPrayerBoxTime}>{nextPrayer?.time}</Text>
                  </View>
                  <Text style={styles.nextPrayerBoxCountdown}>
                    {Math.floor((nextPrayer?.minutesUntil || 0) / 60)} jam {(nextPrayer?.minutesUntil || 0) % 60} menit lagi
                  </Text>
                </View>
                {sholatExpanded ? (
                  <ChevronUp size={16} color={colors.primary} style={styles.nextPrayerChevron} />
                ) : (
                  <ChevronDown size={16} color={colors.primary} style={styles.nextPrayerChevron} />
                )}
              </View>
            </TouchableOpacity>

            {sholatExpanded && (
              <>
                <View style={columns >= 3 ? styles.sholatListWrap : styles.sholatList}>
                  {ALL_PRAYER_ROWS.map((p) => {
                    const isNext = nextPrayer?.key === p.key;
                    return (
                      <View
                        key={p.key}
                        style={[
                          columns >= 3 ? styles.sholatGridItem : styles.sholatRow,
                          isNext && styles.sholatItemActive,
                        ]}
                      >
                        <Text style={[styles.sholatRowLabel, isNext && styles.sholatRowLabelActive]}>{p.label}</Text>
                        <Text style={[styles.sholatRowValue, isNext && styles.sholatRowValueActive]}>{sholatJadwal[p.key]}</Text>
                      </View>
                    );
                  })}
                </View>

                <Text style={styles.sholatFooter}>
                  Metode Kemenag RI (Fajr 20°, Isha 18°){sholatJadwal.timezone ? ` · ${sholatJadwal.timezone}` : ''}
                </Text>
              </>
            )}
          </>
        )}
      </View>
    </>
  );

  return (
    <AppShell active="Beranda" onNavigate={onNavigate} header={heroHeader}>
      <View style={styles.featuresHead}>
        <Text style={styles.sectionTitle}>Menu Utama</Text>
        {canToggleMenu && (
          <TouchableOpacity
            style={styles.showAllBtn}
            activeOpacity={0.7}
            onPress={() => setMenuExpanded((v) => !v)}
          >
            <Text style={styles.showAllText}>{menuExpanded ? 'Sembunyikan' : 'Lihat Semua'}</Text>
            {menuExpanded ? (
              <ChevronUp size={16} color={colors.accent} />
            ) : (
              <ChevronRight size={16} color={colors.accent} />
            )}
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.grid}>
        {visibleMenu.map((m) => {
          const Icon = m.icon;
          return (
            <TouchableOpacity
              key={m.key}
              style={[styles.menuCard, { width: tileWidth }]}
              activeOpacity={0.75}
              onPress={() => onNavigate?.(m.route)}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: m.bg }]}>
                <Icon size={20} color={m.fg} />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuTitle}>{m.title}</Text>
                <Text style={styles.menuDesc} numberOfLines={2}>{m.desc}</Text>
              </View>
              <ChevronRight size={16} color="#9AABB2" style={styles.menuArrow} />
            </TouchableOpacity>
          );
        })}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#102A35',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  date: { color: '#CDE5EF', fontSize: 12, marginTop: 16 },
  hijri: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 4, letterSpacing: -0.5 },
  method: { color: '#EEF8FB', fontSize: 12, fontWeight: '600', marginTop: 2, opacity: 0.85 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 14 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E1E8E5',
    shadowColor: '#102A35',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  titleIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E2F2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { color: '#102A35', fontWeight: '700', fontSize: 17 },

  nextPrayerBox: {
    backgroundColor: '#E8F3EF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  nextPrayerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nextPrayerRight: { alignItems: 'flex-end', marginRight: 18 },
  nextPrayerTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextPrayerChevron: { position: 'absolute', right: 0 },
  nextPrayerBoxLabel: { color: '#318579', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  nextPrayerBoxName: { color: '#102A35', fontSize: 20, fontWeight: '800', marginTop: 4 },
  nextPrayerBoxTime: { color: '#135D58', fontSize: 18, fontWeight: '800' },
  nextPrayerBoxCountdown: { color: '#627680', fontSize: 11, marginTop: 3 },

  sholatList: { borderTopWidth: 1, borderTopColor: '#E1E8E5', marginTop: 12 },
  sholatListWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12 },
  sholatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E1E8E5' },
  sholatGridItem: { width: '31%', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FAFAFC', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 8 },
  sholatItemActive: { backgroundColor: '#E8F3EF', borderRadius: 8, paddingHorizontal: 8 },
  sholatRowLabel: { color: '#102A35', fontSize: 14 },
  sholatRowValue: { color: '#102A35', fontSize: 14, fontWeight: '700' },
  sholatRowLabelActive: { color: '#14786C', fontWeight: '700' },
  sholatRowValueActive: { color: '#14786C' },
  sholatFooter: { color: '#627680', fontSize: 11, fontStyle: 'italic', marginTop: 10, textAlign: 'center' },

  subInfo: { color: '#627680', fontSize: 13, marginTop: 8 },

  featuresHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 14 },
  sectionTitle: { color: '#102A35', fontWeight: '800', fontSize: 20, letterSpacing: -0.5 },
  showAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  showAllText: { color: '#08766D', fontWeight: '700', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E2E9E7',
    position: 'relative',
    shadowColor: '#102A35',
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  menuIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  menuTextWrap: { flex: 1, paddingRight: 14 },
  menuTitle: { color: '#102A35', fontWeight: '700', fontSize: 13.5 },
  menuDesc: { color: '#78909B', fontSize: 10.5, marginTop: 3, lineHeight: 13.5 },
  menuArrow: { position: 'absolute', right: 8, top: '50%', marginTop: -8 },
});
