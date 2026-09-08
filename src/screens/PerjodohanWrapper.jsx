import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import BottomNav from '../components/BottomNav';
import Perjodohan from './falak/Perjodohan';

export default function PerjodohanWrapper({ onNavigate }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => onNavigate?.('Eksplorasi')} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Kembali</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <Perjodohan />
      </View>
      <BottomNav active="Eksplorasi" onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 6 },
  backText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
});
