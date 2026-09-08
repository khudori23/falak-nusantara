import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import BottomNav from '../components/BottomNav';

const MENU = [];

export default function EksplorasiScreen({ onNavigate }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16 }}>
        <Text style={styles.header}>Eksplorasi</Text>
        {MENU.map((m) => (
          <TouchableOpacity key={m.key} style={styles.card} onPress={() => onNavigate?.(m.key)}>
            <Text style={styles.cardIcon}>{m.icon}</Text>
            <Text style={styles.cardTitle}>{m.title}</Text>
            <Text style={styles.cardDesc}>{m.desc}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <BottomNav active="Eksplorasi" onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardIcon: { fontSize: 22, marginBottom: 6 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
});
