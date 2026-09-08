import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Compass, Calendar, Sparkles, BookOpen } from 'lucide-react-native';
import { colors } from '../theme/colors';

const ITEMS = [
  { key: 'Beranda', icon: Home, label: 'Beranda' },
  { key: 'Arah', icon: Compass, label: 'Arah' },
  { key: 'Kalender', icon: Calendar, label: 'Kalender' },
  { key: 'Eksplorasi', icon: Sparkles, label: 'Eksplorasi' },
  { key: 'Library', icon: BookOpen, label: 'Library' },
];

export default function BottomNav({ active, onNavigate }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {ITEMS.map((item) => {
        const isActive = active === item.key;
        const Icon = item.icon;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={() => onNavigate?.(item.key)}
            activeOpacity={0.7}
          >
            <Icon size={20} color={isActive ? colors.primary : colors.textSecondary} strokeWidth={isActive ? 2.4 : 2} />
            <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 10, color: colors.textSecondary, marginTop: 3, fontWeight: '600' },
  labelActive: { color: colors.primary, fontWeight: '800' },
});
