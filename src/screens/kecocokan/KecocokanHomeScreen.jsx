import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from './theme';

const { width: SCREEN_W } = Dimensions.get('window');
const HERO_HEIGHT = Math.round(SCREEN_W * 0.48);

const METHODS = [
  {
    key: 'jawa-weton',
    target: 'jawa-weton',
    title: 'Weton — Siklus 8',
    badge: 'Tradisi Jawa',
    palette: colors.jawa,
    icon: 'leaf',
    desc: 'Pegat, Ratu, Jodoh, Topo, Tinari, Padu, Sujanan, Pesthi — dari total neptu hari+pasaran kedua calon.',
    wip: false,
  },
  {
    key: 'jawa-salakirabi',
    target: 'jawa-salakirabi',
    title: 'Petung Salaki Rabi',
    badge: 'Tradisi Jawa',
    palette: colors.jawa,
    icon: 'heart',
    desc: 'Sri, Dana, Lara, Pati, Lungguh — tafsir rezeki & nasib gabungan pasangan.',
    wip: false,
  },
  {
    key: 'jawa-unsurhari',
    target: 'jawa-unsurhari',
    title: 'Kecocokan Unsur Hari',
    badge: 'Tradisi Jawa',
    palette: colors.jawa,
    icon: 'flame',
    desc: 'Bunga, Api, Daun, Angin, Air, Bumi, Mega — unsur berdasarkan hari lahir masing-masing.',
    wip: false,
  },
  {
    key: 'abu-raml',
    target: 'abu-raml',
    title: 'Abjad & Raml',
    badge: 'Sumber primer',
    palette: colors.abu,
    icon: 'sparkles',
    desc: 'Nama pria + nama wanita → nilai abjad → modulo 9 → interpretasi hubungan.',
    wip: false,
  },
  {
    key: 'abu-buruj',
    target: 'abu-buruj',
    title: 'Nama & Buruj',
    badge: 'Interpretasi konvensi umum',
    palette: colors.abu,
    icon: 'planet-outline',
    desc: 'Nama + nama ibu → buruj (zodiak) → planet & unsur → kecenderungan jodoh.',
    wip: false,
  },
];

function MethodCard({ item, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: item.palette.bg, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={[styles.cardIcon, { backgroundColor: item.palette.icon }]}>
        <Ionicons name={item.icon} size={20} color="#fff" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc}>{item.desc}</Text>
        {item.wip ? (
          <Text style={styles.wipText}>Sebagian metode masih disiapkan</Text>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.cardSubtext} />
    </Pressable>
  );
}

export default function KecocokanHomeScreen({ onSelect, onOpenSettings, onOpenCaraKerja }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.hero}>
        <Image
          source={require('../../../assets/kecocokan-hero.jpg')}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[colors.heroOverlayTop, colors.heroOverlayBottom]}
          style={StyleSheet.absoluteFillObject}
        />

        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <View style={styles.settingsWrap}>
            <Pressable style={styles.settingsBtn} onPress={onOpenSettings}>
              <Ionicons name="settings-sharp" size={20} color={colors.jawa.icon} />
            </Pressable>
          </View>

          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Pilih Metode Perhitungan</Text>
            <Text style={styles.heroSubtitle}>
              Pilih metode yang ingin Anda gunakan untuk menghitung kecocokan pasangan.
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {METHODS.map((item) => (
          <MethodCard
            key={item.key}
            item={item}
            onPress={() => onSelect(item.target)}
          />
        ))}

        <Pressable
          onPress={onOpenCaraKerja}
          style={({ pressed }) => [styles.caraKerjaCard, { opacity: pressed ? 0.85 : 1 }]}
        >
          <View style={styles.caraKerjaIcon}>
            <Ionicons name="book" size={18} color={colors.jawa.icon} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.caraKerjaTitle}>Bagaimana cara kerjanya?</Text>
            <Text style={styles.caraKerjaDesc}>
              Setiap metode memiliki rumus dan pakem yang berbeda. Hasil perhitungan akan
              ditampilkan secara transparan dan dapat dilihat detailnya.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.cardSubtext} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: HERO_HEIGHT,
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  settingsWrap: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.settingsBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    paddingHorizontal: spacing.md,
    marginTop: 'auto',
    paddingBottom: spacing.lg,
  },
  heroTitle: {
    color: colors.textOnHero,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
  },
  heroSubtitle: {
    color: colors.textOnHeroMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    maxWidth: '90%',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.jawa.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.cardText,
  },
  sectionDesc: {
    fontSize: 13,
    color: colors.cardSubtext,
    marginTop: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.cardText,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 13,
    color: colors.cardSubtext,
    lineHeight: 18,
  },
  wipText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#8A5A12',
    marginTop: 4,
  },
  caraKerjaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  caraKerjaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.jawa.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caraKerjaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.cardText,
    marginBottom: 2,
  },
  caraKerjaDesc: {
    fontSize: 12,
    color: colors.cardSubtext,
    lineHeight: 17,
  },
});
