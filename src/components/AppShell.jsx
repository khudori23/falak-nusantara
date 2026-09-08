import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useBreakpoint } from '../theme/responsive';
import BottomNav from './BottomNav';
import SideNav from './SideNav';

export default function AppShell({ active, onNavigate, children }) {
  const { isWide, maxContentWidth } = useBreakpoint();
  const insets = useSafeAreaInsets();

  if (isWide) {
    return (
      <View style={styles.rowRoot}>
        <SideNav active={active} onNavigate={onNavigate} />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.mainContent, { paddingTop: insets.top + 24 }]}
        >
          <View style={[styles.centerWrap, maxContentWidth && { maxWidth: maxContentWidth }]}>
            {children}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.colRoot}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: 8 }}
      >
        {children}
      </ScrollView>
      <BottomNav active={active} onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  rowRoot: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
  colRoot: { flex: 1, backgroundColor: colors.background },
  mainContent: { alignItems: 'center', padding: 24 },
  centerWrap: { width: '100%' },
});
