import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Sun, Moon, Settings, Compass, Calendar, Heart, CalendarCheck, Sprout } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useBreakpoint } from '../theme/responsive';
import { useFalakData } from '../hooks/useFalakData';
import AppShell from '../components/AppShell';
import { supabase } from '../lib/supabase';

const MENU = [
  { key: 'arah', icon: Compass, title: 'Arah Kiblat', bg: colors.primarySoft, fg: colors.primary, route: 'Arah' },
  { key: 'kalender', icon: Calendar, title: 'Kalender Hijriah', bg: colors.accentSoft, fg: colors.accent, route: 'Kalender' },
  { key: 'kepribadian', icon: Moon, title: 'Kepribadian', bg: colors.purpleSoft, fg: colors.purple, route: 'Kepribadian' },
  { key: 'jodoh', icon: Heart, title: 'Perjodohan', bg: colors.dangerSoft, fg: colors.danger, route: 'Perjodohan' },
  { key: 'hari_usaha', icon: Sprout, title: 'Hari Baik Usaha', bg: colors.successSoft, fg: colors.success, route: 'HariUsaha' },
  { key: 'settings', icon: Settings, title: 'Pengaturan', bg: colors.surfaceBorder, fg: colors.textSecondary, route: 'Settings' },
];

const CATEGORY_LABELS = {
  kiblat: 'Kiblat',
  kalender_hijriah: 'Kalender Hijriah',
  perjodohan: 'Perjodohan',
  kepribadian: 'Kepribadian',
  planet: "Abu Ma'syar",
};

export default function HomeScreen({ onNavigate }) {
  const { columns } = useBreakpoint();
  const { hariLabel, tanggalMasehi, hijriLabel, location, locationStatus, astro, refreshLocation } = useFalakData();
  const tileWidth = columns >= 4 ? '23%' : columns === 3 ? '31%' : '47%';

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
    <LinearGradient colors={[colors.primary, '#123F3F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
      <View style={styles.rowBetween}>
        {locationStatus === 'granted' ? (
          <View style={styles.locationBadge}>
            <MapPin size={13} color={colors.accent} />
            <Text style={styles.locationText}>{location?.label}</Text>
          </View>
        ) : locationStatus === 'loading' ? (
          <View style={styles.locationBadge}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.locationText}>Mendeteksi lokasi…</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.locationBadge} onPress={refreshLocation}>
            <MapPin size={13} color={colors.accent} />
            <Text style={styles.locationText}>Aktifkan lokasi</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.date}>{hariLabel}, {tanggalMasehi}</Text>
      <Text style={styles.hijri}>{hijriLabel}</Text>
      <Text style={styles.method}>Hisab Klasik Nusantara (estimasi tabular)</Text>
      <View style={styles.heroDivider} />
      <View style={styles.astroRow}>
        <View style={styles.astroBlock}>
          <Sun size={15} color={colors.accent} />
          <Text style={styles.astroLabel}>Terbit</Text>
          <Text style={styles.astroValue}>{astro ? astro.terbit : '—'}</Text>
        </View>
        <View style={styles.astroDivider} />
        <View style={styles.astroBlock}>
          <Sun size={15} color={colors.accent} />
          <Text style={styles.astroLabel}>Terbenam</Text>
          <Text style={styles.astroValue}>{astro ? astro.terbenam : '—'}</Text>
        </View>
        <View style={styles.astroDivider} />
        <View style={styles.astroBlock}>
          <Moon size={15} color={colors.accent} />
          <Text style={styles.astroLabel}>{astro ? astro.fasebulan : 'Fase Bulan'}</Text>
          <Text style={styles.astroValue}>{astro ? `${astro.iluminasi}%` : '—'}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <AppShell active="Beranda" onNavigate={onNavigate} header={heroHeader}>
      <View style={[styles.card, styles.interpretationCard]}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>INTERPRETASI TRADISIONAL HARI INI</Text>
          <Text style={styles.badge}>{badgeLabel}</Text>
        </View>
        {loadingContent ? (
          <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 10 }} />
        ) : (
          <Text style={styles.quote}>
            "{dailyContent?.fact_text || fallbackQuote}"
          </Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Menu Utama</Text>
      <View style={styles.grid}>
        {MENU.map((m) => {
          const Icon = m.icon;
          return (
            <TouchableOpacity key={m.key} style={[styles.menuTile, { width: tileWidth }]} activeOpacity={0.75} onPress={() => onNavigate?.(m.route)}>
              <View style={[styles.menuIconWrap, { backgroundColor: m.bg }]}>
                <Icon size={20} color={m.fg} />
              </View>
              <Text style={[styles.menuTitle, { color: m.fg }]}>{m.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heroCard: { borderRadius: 20, padding: 20, marginBottom: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 20 },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationText: { color: '#F0EEE8', fontWeight: '700', fontSize: 13 },
  date: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 14 },
  hijri: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 4 },
  method: { color: colors.accent, fontSize: 12, fontWeight: '600', marginTop: 2 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 14 },
  astroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  astroBlock: { flex: 1, alignItems: 'center', gap: 2 },
  astroDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.15)' },
  astroLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 },
  astroValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.surfaceBorder },
  interpretationCard: { borderColor: colors.accent, borderWidth: 1.2 },
  cardTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: 15 },
  subInfo: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  button: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  buttonText: { color: colors.textOnPrimary, fontWeight: '700', fontSize: 13 },
  label: { color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  badge: { backgroundColor: colors.accentSoft, color: colors.accent, fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  quote: { color: colors.textPrimary, fontStyle: 'italic', marginTop: 10, lineHeight: 21 },
  sectionTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: 15, marginTop: 4, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  menuTile: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.surfaceBorder },
  menuIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  menuTitle: { fontWeight: '700', fontSize: 13 },
});
