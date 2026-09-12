import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Settings } from 'lucide-react-native';
import { colors } from '../theme/colors';

export default function BottomNav({ active, onNavigate }) {
  const insets = useSafeAreaInsets();
  const isHomeActive = active === 'Beranda';
  const isSettingsActive = active === 'Settings';

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => onNavigate?.('Beranda')}
        activeOpacity={0.7}
      >
        <Home size={22} color={isHomeActive ? colors.primary : colors.textSecondary} strokeWidth={isHomeActive ? 2.4 : 2} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.item}
        onPress={() => onNavigate?.('Settings')}
        activeOpacity={0.7}
      >
        <Settings size={22} color={isSettingsActive ? colors.primary : colors.textSecondary} strokeWidth={isSettingsActive ? 2.4 : 2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 56,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 8,
  },
  item: { paddingVertical: 4, paddingHorizontal: 20 },
});
