import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from './theme';

// Kartu "Kesimpulan" bergaya praktisi -- dipakai konsisten di semua layar hasil
// kecocokan (substansi teks beda per metode, tapi bungkus & nada sama).
export default function PractitionerNote({ children }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Kesimpulan</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#fff', borderRadius: 16, padding: spacing.md, marginTop: spacing.sm, marginBottom: spacing.sm },
  label: { fontSize: 11, fontWeight: '700', color: colors.jawa.icon, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  body: { fontSize: 14, color: colors.cardText, lineHeight: 21 },
});
