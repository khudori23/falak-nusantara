import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar as CalendarIcon } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { hitungPerjodohanLengkap } from "../../lib/perjodohanLengkap";

type WetonMethod = "jawa" | "sunda";
const WETON_METHOD_LABEL: Record<WetonMethod, string> = { jawa: "Jawa (Weton)", sunda: "Sunda (Wedal)" };

export default function Perjodohan() {
  const [nameA, setNameA] = useState("");
  const [nameB, setNameB] = useState("");
  const [birthdateA, setBirthdateA] = useState<Date | null>(null);
  const [birthdateB, setBirthdateB] = useState<Date | null>(null);
  const [showPickerA, setShowPickerA] = useState(false);
  const [showPickerB, setShowPickerB] = useState(false);
  const [wetonMethod, setWetonMethod] = useState<WetonMethod>("jawa");
  const [loading, setLoading] = useState(false);
  const [lengkap, setLengkap] = useState<any>(null);

  function formatTanggal(d: Date | null) {
    return d ? d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Pilih tanggal lahir";
  }

  async function handleCheck() {
    const trimmedA = nameA.trim();
    const trimmedB = nameB.trim();
    if (!trimmedA || !trimmedB || !birthdateA || !birthdateB) return;
    setLoading(true);

    const hasil = hitungPerjodohanLengkap(trimmedA, trimmedB, birthdateA, birthdateB, wetonMethod);
    setLengkap(hasil);

    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("compatibility_runs").insert({
      user_id: userData?.user?.id ?? null, name_a: trimmedA, name_b: trimmedB, method: "birthdate", score: hasil.persentase, breakdown_json: null,
    });
    setLoading(false);
  }

  const canCheck = !!(nameA.trim() && nameB.trim() && birthdateA && birthdateB);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <Text style={styles.title}>Cek Kecocokan</Text>
      <Text style={styles.subtitle}>Interpretasi tradisional untuk refleksi, bukan prediksi pasti 💫</Text>
      <TextInput style={styles.input} placeholder="Nama A" value={nameA} onChangeText={setNameA} maxLength={100} />
      <TextInput style={[styles.input, { marginTop: 10 }]} placeholder="Nama B" value={nameB} onChangeText={setNameB} maxLength={100} />

      <TouchableOpacity style={styles.dateInput} onPress={() => setShowPickerA(true)}>
        <CalendarIcon size={16} color="#8A8577" />
        <Text style={styles.dateText}>A: {formatTanggal(birthdateA)}</Text>
      </TouchableOpacity>
      {showPickerA && (
        <DateTimePicker
          value={birthdateA || new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={(event, selected) => {
            setShowPickerA(Platform.OS === "ios");
            if (selected) setBirthdateA(selected);
          }}
        />
      )}
      <TouchableOpacity style={styles.dateInput} onPress={() => setShowPickerB(true)}>
        <CalendarIcon size={16} color="#8A8577" />
        <Text style={styles.dateText}>B: {formatTanggal(birthdateB)}</Text>
      </TouchableOpacity>
      {showPickerB && (
        <DateTimePicker
          value={birthdateB || new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={(event, selected) => {
            setShowPickerB(Platform.OS === "ios");
            if (selected) setBirthdateB(selected);
          }}
        />
      )}
      <View style={styles.methodRow}>
        {(Object.keys(WETON_METHOD_LABEL) as WetonMethod[]).map((m) => (
          <TouchableOpacity key={m} style={[styles.methodChip, wetonMethod === m && styles.methodChipActive]} onPress={() => setWetonMethod(m)}>
            <Text style={[styles.methodChipText, wetonMethod === m && styles.methodChipTextActive]}>{WETON_METHOD_LABEL[m]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {wetonMethod === "sunda" && (
        <Text style={styles.methodNote}>
          Wedal Sunda: tradisi populer Sunda — nilai angka harinya berbagi akar dengan Saptawara Jawa.
        </Text>
      )}

      <TouchableOpacity style={[styles.button, !canCheck && styles.buttonDisabled]} onPress={handleCheck} disabled={!canCheck || loading}>
        {loading ? <ActivityIndicator color="#FAFAF8" /> : <Text style={styles.buttonText}>Cek Kecocokan</Text>}
      </TouchableOpacity>

      {lengkap && (
        <>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreEmoji}>❤️</Text>
            <Text style={styles.scoreValue}>{lengkap.persentase}%</Text>
            <Text style={styles.scoreMethodTag}>{WETON_METHOD_LABEL[wetonMethod]} · {lengkap.hariLahir.nama}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Kecocokan Hari Lahir</Text>
            <Text style={styles.bigResult}>{lengkap.hariLahir.nama}</Text>
            <Text style={styles.bullet}>{lengkap.penjelasan}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Kecocokan Unsur</Text>
            <Text style={styles.bigResult}>{lengkap.unsurA.unsur} · {lengkap.unsurB.unsur}</Text>
            <Text style={styles.bullet}>{lengkap.unsur.deskripsi}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Rezeki & Nasib Gabungan</Text>
            <Text style={styles.bigResult}>{lengkap.rezekiGabungan.nama}</Text>
            <Text style={styles.bullet}>{lengkap.rezekiGabungan.desc}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Saran</Text>
            <Text style={styles.bullet}>{lengkap.saran}</Text>
          </View>

          {lengkap.nasehat && (
            <View style={[styles.card, styles.nasehatCard]}>
              <Text style={styles.cardLabel}>Nasehat Agar Tetap Cocok</Text>
              <Text style={styles.bullet}>{lengkap.nasehat}</Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Yang Perlu Diperhatikan</Text>
            <Text style={styles.bullet}>• Komunikasi terbuka</Text>
            <Text style={styles.bullet}>• Saling menghargai</Text>
            <Text style={styles.bullet}>• Kejujuran</Text>
            <Text style={styles.bullet}>• Kesamaan tujuan</Text>
          </View>
          <Text style={styles.disclaimer}>Hasil perhitungan tradisional untuk edukasi dan refleksi, bukan kepastian masa depan atau pengganti keputusan nyata. Setiap metode berasal dari tradisi berbeda sehingga hasil dapat berbeda.</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF8" },
  title: { fontSize: 22, fontWeight: "700", color: "#1B3A3A" },
  subtitle: { fontSize: 14, color: "#8A8577", marginTop: 4, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#E0DED8", borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: "#fff" },
  dateInput: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#E0DED8", borderRadius: 12, padding: 14, backgroundColor: "#fff", marginTop: 10 },
  dateText: { fontSize: 15, color: "#1B3A3A" },
  methodRow: { flexDirection: "row", marginTop: 14, gap: 8 },
  methodChip: { borderWidth: 1, borderColor: "#E0DED8", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  methodChipActive: { backgroundColor: "#1B3A3A", borderColor: "#1B3A3A" },
  methodChipText: { fontSize: 13, color: "#4A6363", fontWeight: "600" },
  methodChipTextActive: { color: "#FAFAF8" },
  methodNote: { fontSize: 11, color: "#8A8577", marginTop: 8, fontStyle: "italic" },
  button: { backgroundColor: "#1B3A3A", borderRadius: 12, padding: 14, alignItems: "center", marginTop: 16 },
  buttonDisabled: { backgroundColor: "#C7C4BB" },
  buttonText: { color: "#FAFAF8", fontSize: 15, fontWeight: "600" },
  scoreCard: { alignItems: "center", marginTop: 24, padding: 20, backgroundColor: "#F1EFE9", borderRadius: 20 },
  scoreEmoji: { fontSize: 32 },
  scoreValue: { fontSize: 44, fontWeight: "700", color: "#1B3A3A", marginTop: 4 },
  scoreMethodTag: { fontSize: 12, color: "#8A8577", marginTop: 4 },
  card: { backgroundColor: "#F1EFE9", borderRadius: 16, padding: 16, marginTop: 16 },
  cardLabel: { fontSize: 12, fontWeight: "700", color: "#8A8577", textTransform: "uppercase", marginBottom: 10 },
  bigResult: { fontSize: 20, fontWeight: "700", color: "#1B3A3A", marginBottom: 6 },
  bullet: { fontSize: 14, color: "#1B3A3A", marginBottom: 4 },
  nasehatCard: { borderWidth: 1, borderColor: "#C9A227" },
  disclaimer: { fontSize: 11, color: "#8A6D00", marginTop: 16, fontStyle: "italic", textAlign: "center", paddingHorizontal: 8 },
});
