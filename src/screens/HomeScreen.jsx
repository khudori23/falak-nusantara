import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Sun, Moon, Settings, Compass, PenTool, Heart, BookOpen, Calendar } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useBreakpoint } from '../theme/responsive';
import { useFalakData } from '../hooks/useFalakData';

const MENU = [
  { key: 'kepribadian', icon: Moon, title: 'Kepribadian', bg: colors.primarySoft, fg: colors.primary, route: 'Kepribadian' },
  { key: 'jodoh', icon: Heart, title: 'Perjodohan', bg: colors.dangerSoft, fg: colors.danger, route: 'Perjodohan' },
  { key: 'library', icon: BookOpen, title: "Library Abu Ma'syar", bg: colors.purpleSoft, fg: colors.purple, route: 'Library' },
  { key: 'kalender', icon: Calendar, title: 'Kalender Hijriah', bg: colors.accentSoft, fg: colors.accent, route: 'Kalender' },
];

export default function HomeScreen({ onNavigate }) {
  const { columns } = useBreakpoint();
  const { hariLabel, tanggalMasehi, hijriLabel, location, locationStatus, astro, refreshLocation } = useFalakData();
  const tileWidth = columns >= 4 ? '23%' : columns === 3 ? '31%' : '47%';

  return (
    <View style={{ width: '100%' }}>
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
          <TouchableOpacity style={styles.settingsBtn}>
            <Settings size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.date}>{hariLabel}, {tanggalMasehi}</Text>
        <Text style={styles.hijri}>{hijriLabel}</Text>
        <Text style={styles.method}>Hisab Klasik Nusantara (estimasi tabular)</Text>
        <View style={styles.heroDivider} />
        <View style={styles.row}>
          <View style={styles.rowGap}>
            <Sun size={15} color={colors.accent} />
            <Text style={styles.heroSub}>{astro ? `Terbit ${astro.terbit} WIB` : '—'}</Text>
          </View>
          <View style={styles.rowGap}>
            <Moon size={15} color={colors.accent} />
            <Text style={styles.heroSub}>{astro ? astro.fasebulan : '—'}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.card, styles.rowBetween]}>
        <View style={{ flex: 1 }}>
          <View style={styles.rowGap}>
            <Compass size={16} color={colors.primary} />
            <Text style={styles.cardTitle}>Arah Kiblat Hari Ini</Text>
          </View>
          <Text style={styles.subInfo}>Buka untuk lihat derajat & jarak akurat</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => onNavigate?.('Arah')}>
          <Text style={styles.buttonText}>Buka Kompas</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, styles.interpretationCard]}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>INTERPRETASI TRADISIONAL HARI INI</Text>
          <Text style={styles.badge}>Abu Ma'syar</Text>
        </View>
        <Text style={styles.quote}>
          "Hari {hariLabel} di bawah naungan unsur angin memberikan kebaikan untuk memulai
          perjalanan dan musyawarah penting. Tetap kedepankan ikhtiar terbaik."
        </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: { borderRadius: 20, padding: 20, marginBottom: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 20 },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationText: { color: '#F0EEE8', fontWeight: '700', fontSize: 13 },
  settingsBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  date: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 14 },
  hijri: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 4 },
  method: { color: colors.accent, fontSize: 12, fontWeight: '600', marginTop: 2 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 14 },
  heroSub: { color: '#F0EEE8', fontSize: 13 },
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
