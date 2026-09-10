import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home } from 'lucide-react-native';
import { colors } from '../theme/colors';

export default function BottomNav({ active, onNavigate }) {
  const insets = useSafeAreaInsets();
  const isActive = active === 'Beranda';

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => onNavigate?.('Beranda')}
        activeOpacity={0.7}
      >
        <Home size={22} color={isActive ? colors.primary : colors.textSecondary} strokeWidth={isActive ? 2.4 : 2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 8,
  },
  item: { paddingVertical: 4, paddingHorizontal: 20 },
});
