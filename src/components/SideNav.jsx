import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Compass, Calendar, Sparkles, BookOpen, Moon } from 'lucide-react-native';
import { colors } from '../theme/colors';

const ITEMS = [
  { key: 'Beranda', icon: Home, label: 'Beranda' },
  { key: 'Arah', icon: Compass, label: 'Arah' },
  { key: 'Kalender', icon: Calendar, label: 'Kalender' },
  { key: 'Eksplorasi', icon: Sparkles, label: 'Eksplorasi' },
  { key: 'Library', icon: BookOpen, label: 'Library' },
];

export default function SideNav({ active, onNavigate }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.brand}>
        <View style={styles.brandIcon}>
          <Moon size={18} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.brandTitle}>Falak Nusantara</Text>
          <Text style={styles.brandSub}>Waktu, Arah & Tradisi</Text>
        </View>
      </View>

      {ITEMS.map((item) => {
        const isActive = active === item.key;
        const Icon = item.icon;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.item, isActive && styles.itemActive]}
            onPress={() => onNavigate?.(item.key)}
          >
            <Icon size={19} color={isActive ? colors.primary : colors.textSecondary} />
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 220,
    borderRightWidth: 1,
    borderRightColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    paddingVertical: 20,
    paddingHorizontal: 14,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28, paddingHorizontal: 6 },
  brandIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  brandTitle: { fontWeight: '800', fontSize: 14, color: colors.textPrimary },
  brandSub: { fontSize: 11, color: colors.accent },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 11, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4,
  },
  itemActive: { backgroundColor: colors.primarySoft },
  label: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  labelActive: { color: colors.primary, fontWeight: '800' },
});
