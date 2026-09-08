import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import BottomNav from '../components/BottomNav';
import LibraryAbuMasyar from './falak/LibraryAbuMasyar';

export default function LibraryScreen({ onNavigate }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.headerRow, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => onNavigate?.('Eksplorasi')} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Kembali</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <LibraryAbuMasyar />
      </View>
      <BottomNav active="Eksplorasi" onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  headerRow: { paddingHorizontal: 16, paddingTop: 12 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 6 },
  backText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
});
