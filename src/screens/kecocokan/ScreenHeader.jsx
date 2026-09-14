import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from './theme';

export default function ScreenHeader({ title, onBack, palette = colors.jawa }) {
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.bg }}>
      <View style={styles.row}>
        <Pressable style={[styles.backBtn, { backgroundColor: palette.badgeBg }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={palette.icon} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={{ width: 36 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.cardText,
    textAlign: 'center',
  },
});
