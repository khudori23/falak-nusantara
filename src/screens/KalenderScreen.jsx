import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import BottomNav from '../components/BottomNav';
import KalenderHijriah from './falak/KalenderHijriah';

export default function KalenderScreen({ onNavigate }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={{ flex: 1, paddingTop: insets.top + 12 }}>
        <KalenderHijriah />
      </View>
      <BottomNav active="Kalender" onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
