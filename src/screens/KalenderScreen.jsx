import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import BottomNav from '../components/BottomNav';
import JamTanggal from './falak/JamTanggal';
import KalenderHijriah from './falak/KalenderHijriah';

export default function KalenderScreen({ onNavigate }) {
  const [tab, setTab] = useState('jam');
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.tabRow, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'jam' && styles.tabBtnActive]} onPress={() => setTab('jam')}>
          <Text style={[styles.tabText, tab === 'jam' && styles.tabTextActive]}>Jam & Tanggal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'kalender' && styles.tabBtnActive]} onPress={() => setTab('kalender')}>
          <Text style={[styles.tabText, tab === 'kalender' && styles.tabTextActive]}>Kalender Hijriah</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        {tab === 'jam' ? <JamTanggal /> : <KalenderHijriah />}
      </View>
      <BottomNav active="Kalender" onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  tabRow: { flexDirection: 'row', padding: 12, gap: 8 },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  tabBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  tabTextActive: { color: colors.textOnPrimary },
});
