/**
 * KalenderHijriah.tsx
 * Falak Nusantara — Fitur Kalender Hijriah (PRD §5)
 *
 * Acceptance criteria yang dipenuhi:
 * - Navigasi bulan maju/mundur tanpa reload
 * - Tanggal hari ini di-highlight
 * - Tap tanggal → tampilkan fase bulan hari itu
 * - Estimasi hisab untuk tanggal sangat jauh (>50 tahun) diberi catatan
 * - 100% offline
 */

import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { gregorianToHijri, formatHijri, getMoonPhase } from "./falakUtils";

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export default function KalenderHijriah() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-11
  const [selectedDay, setSelectedDay] = useState<Date>(today);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("id-ID", {
    month: "long", year: "numeric",
  });

  const isFarFromToday = Math.abs(viewYear - today.getFullYear()) > 50;

  const cells = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = daysInMonth(viewYear, viewMonth);
    const arr: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) arr.push(null);
    for (let d = 1; d <= totalDays; d++) arr.push(new Date(viewYear, viewMonth, d));
    return arr;
  }, [viewYear, viewMonth]);

  function goToPrevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function goToNextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const selectedHijri = gregorianToHijri(selectedDay);
  const selectedMoon = getMoonPhase(selectedDay);
  const isToday = (d: Date) =>
    d.toDateString() === today.toDateString();
  const isSelected = (d: Date) =>
    d.toDateString() === selectedDay.toDateString();

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.navBtn}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navBtn}>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {isFarFromToday && (
        <Text style={styles.estimateNotice}>
          Konversi Hijriah untuk tanggal ini adalah estimasi hisab.
        </Text>
      )}

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={styles.weekdayLabel}>{w}</Text>
        ))}
      </View>

      <FlatList
        data={cells}
        numColumns={7}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => {
          if (!item) return <View style={styles.cell} />;
          const h = gregorianToHijri(item);
          return (
            <TouchableOpacity
              style={[
                styles.cell,
                isToday(item) && styles.cellToday,
                isSelected(item) && styles.cellSelected,
              ]}
              onPress={() => setSelectedDay(item)}
            >
              <Text style={[styles.cellDay, isSelected(item) && styles.cellDaySelected]}>
                {item.getDate()}
              </Text>
              <Text style={styles.cellHijri}>{h.day}</Text>
            </TouchableOpacity>
          );
        }}
        scrollEnabled={false}
      />

      <View style={styles.detailCard}>
        <Text style={styles.detailDate}>
          {selectedDay.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </Text>
        <Text style={styles.detailHijri}>{formatHijri(selectedHijri)}</Text>
        <View style={styles.moonRow}>
          <Text style={styles.moonIcon}>{selectedMoon.icon}</Text>
          <Text style={styles.moonName}>{selectedMoon.name}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF8", padding: 16 },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  navBtn: { padding: 8 },
  navArrow: { fontSize: 24, color: "#1B3A3A" },
  monthLabel: { fontSize: 17, fontWeight: "600", color: "#1B3A3A" },
  estimateNotice: { fontSize: 12, color: "#8A6D00", textAlign: "center", marginBottom: 8 },
  weekdayRow: { flexDirection: "row", marginBottom: 4 },
  weekdayLabel: { flex: 1, textAlign: "center", fontSize: 12, color: "#8A8577", fontWeight: "600" },
  cell: { flex: 1, aspectRatio: 1, alignItems: "center", justifyContent: "center", margin: 1, borderRadius: 8 },
  cellToday: { borderWidth: 1, borderColor: "#1B3A3A" },
  cellSelected: { backgroundColor: "#1B3A3A" },
  cellDay: { fontSize: 14, fontWeight: "600", color: "#1B3A3A" },
  cellDaySelected: { color: "#FAFAF8" },
  cellHijri: { fontSize: 10, color: "#8A8577" },
  detailCard: { marginTop: 20, padding: 16, borderRadius: 16, backgroundColor: "#F1EFE9", alignItems: "center" },
  detailDate: { fontSize: 14, color: "#4A6363" },
  detailHijri: { fontSize: 16, fontWeight: "600", color: "#1B3A3A", marginTop: 4 },
  moonRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  moonIcon: { fontSize: 22, marginRight: 6 },
  moonName: { fontSize: 14, color: "#1B3A3A" },
});
