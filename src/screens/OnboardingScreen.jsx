import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const ONBOARDING_KEY = 'falak_onboarding_done';

const SLIDES = [
  {
    icon: 'weather-night',
    title: 'Kenali langit.\nPahami waktu.\nJelajahi tradisi.',
    body: 'Satu aplikasi untuk kebutuhan langit dan waktu sehari-hari.',
  },
  {
    icon: 'compass-outline',
    title: 'Kompas & Kiblat',
    body: 'Arah kiblat akurat, real-time, bahkan tanpa koneksi internet.',
  },
  {
    icon: 'signature-freehand',
    title: 'Nama & Perhitungan Tradisional',
    body: 'Makna nama, nilai Abjad, dan kecocokan — dengan cara hitung yang transparan.',
  },
  {
    icon: 'book-open-page-variant-outline',
    title: 'Belajar Ilmu Falak',
    body: 'Jelajahi warisan Abu Ma\'syar dan ilmu falak klasik, dengan sumber yang jelas.',
  },
  {
    icon: 'star-four-points-outline',
    title: 'Semua dalam satu aplikasi',
    body: 'Waktu, arah, dan tradisi — dalam satu genggaman.',
    isLast: true,
  },
];

export default function OnboardingScreen({ onNavigate }) {
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  const selesai = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) {
      // gagal simpan status tidak boleh memblokir user masuk ke Home
    }
    onNavigate?.('Beranda');
  };

  const handleScroll = (e) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
    } else {
      selesai();
    }
  };

  return (
    <View style={styles.container}>
      {index < SLIDES.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={selesai} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.skipText}>Lewati</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <MaterialCommunityIcons name={slide.icon} size={72} color={colors.primary} />
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={styles.mainButton} onPress={goNext}>
        <Text style={styles.mainButtonText}>
          {index === SLIDES.length - 1 ? 'Mulai' : 'Lanjut'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export async function cekOnboardingSelesai() {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (e) {
    return false;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 24,
  },
  body: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  mainButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  mainButtonText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: '700' },
});
