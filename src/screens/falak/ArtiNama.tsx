import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal } from "react-native";
import { supabase } from "../../lib/supabase";
import { calculateAbjad, AbjadResult } from "./abjadUtils";

interface NameMeaning { name_text: string; origin_language: string; meaning: string; }

export default function ArtiNama() {
  const [inputName, setInputName] = useState("");
  const [loading, setLoading] = useState(false);
  const [meaning, setMeaning] = useState<NameMeaning | null | "not_found">(null);
  const [abjadResult, setAbjadResult] = useState<AbjadResult | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [letterValues, setLetterValues] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("abjad_letters").select("letter, value");
      if (!error && data) {
        const map: Record<string, number> = {};
        data.forEach((row: { letter: string; value: number }) => { map[row.letter] = row.value; });
        setLetterValues(map);
      }
    })();
  }, []);

  async function handleCheck() {
    const trimmed = inputName.trim();
    if (!trimmed) return;
    setLoading(true);
    setMeaning(null);
    setAbjadResult(null);
    setInterpretation(null);

    const { data: nameData } = await supabase.from("names").select("name_text, origin_language, meaning").ilike("name_text", trimmed).maybeSingle();
    setMeaning(nameData ?? "not_found");

    const result = calculateAbjad(trimmed, letterValues);
    setAbjadResult(result);

    const { data: methodData } = await supabase.from("traditional_methods").select("description").eq("code", "abjad_interpretation").maybeSingle();
    if (methodData?.description) {
      setInterpretation(`Dalam tradisi perhitungan ini, angka ${result.total} biasanya ditafsirkan sesuai konteks: ${methodData.description}`);
    } else {
      setInterpretation(`Dalam tradisi perhitungan ini, angka ${result.total} biasanya ditafsirkan sebagai karakter dasar nama tersebut menurut metode Abjad klasik.`);
    }
    setLoading(false);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <Text style={styles.title}>Arti & Eksplorasi Nama</Text>
      <Text style={styles.subtitle}>Penasaran arti namamu? ✨</Text>
      <TextInput style={styles.input} placeholder="Masukkan nama depan" value={inputName} onChangeText={setInputName} maxLength={100} />
      <TouchableOpacity style={[styles.button, !inputName.trim() && styles.buttonDisabled]} onPress={handleCheck} disabled={!inputName.trim() || loading}>
        {loading ? <ActivityIndicator color="#FAFAF8" /> : <Text style={styles.buttonText}>Cek Nama</Text>}
      </TouchableOpacity>
      {meaning && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Makna Bahasa</Text>
          {meaning === "not_found" ? <Text style={styles.notFound}>Data tidak ditemukan.</Text> : (
            <>
              <Text style={styles.cardValue}>{meaning.meaning}</Text>
              <Text style={styles.cardSubtle}>Asal: {meaning.origin_language}</Text>
            </>
          )}
        </View>
      )}
      {abjadResult && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Nilai Abjad</Text>
          <Text style={styles.abjadTotal}>Total = {abjadResult.total}</Text>
          <TouchableOpacity onPress={() => setShowBreakdown(true)}>
            <Text style={styles.linkText}>Bagaimana ini dihitung?</Text>
          </TouchableOpacity>
        </View>
      )}
      {interpretation && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Interpretasi Tradisional</Text>
          <Text style={styles.cardValue}>{interpretation}</Text>
          <Text style={styles.disclaimer}>Hasil perhitungan tradisional untuk edukasi dan refleksi, bukan kepastian masa depan atau pengganti keputusan nyata.</Text>
        </View>
      )}
      <Modal visible={showBreakdown} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bagaimana Ini Dihitung?</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              <Text style={styles.breakdownStep}>Input: "{inputName.trim()}"</Text>
              {abjadResult?.steps.map((s, idx) => (
                <Text key={idx} style={styles.breakdownStep}>{s.char} → {s.arabicLetter ?? "(diabaikan)"} = {s.value}</Text>
              ))}
              <Text style={styles.breakdownTotal}>Total = {abjadResult?.total}</Text>
              <Text style={styles.breakdownNote}>Catatan: mapping huruf Latin→Arab di sini disederhanakan untuk MVP.</Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowBreakdown(false)}>
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF8" },
  title: { fontSize: 22, fontWeight: "700", color: "#1B3A3A" },
  subtitle: { fontSize: 14, color: "#8A8577", marginTop: 4, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#E0DED8", borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: "#fff" },
  button: { backgroundColor: "#1B3A3A", borderRadius: 12, padding: 14, alignItems: "center", marginTop: 12 },
  buttonDisabled: { backgroundColor: "#C7C4BB" },
  buttonText: { color: "#FAFAF8", fontSize: 15, fontWeight: "600" },
  card: { backgroundColor: "#F1EFE9", borderRadius: 16, padding: 16, marginTop: 16 },
  cardLabel: { fontSize: 12, fontWeight: "700", color: "#8A8577", textTransform: "uppercase", marginBottom: 6 },
  cardValue: { fontSize: 15, color: "#1B3A3A", lineHeight: 22 },
  cardSubtle: { fontSize: 12, color: "#8A8577", marginTop: 4 },
  notFound: { fontSize: 14, color: "#8A8577", fontStyle: "italic" },
  abjadTotal: { fontSize: 28, fontWeight: "700", color: "#1B3A3A", marginBottom: 6 },
  linkText: { fontSize: 13, color: "#4A6363", textDecorationLine: "underline" },
  disclaimer: { fontSize: 11, color: "#8A6D00", marginTop: 10, fontStyle: "italic" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "#1B3A3A", marginBottom: 12 },
  breakdownStep: { fontSize: 14, color: "#1B3A3A", marginBottom: 4 },
  breakdownTotal: { fontSize: 16, fontWeight: "700", color: "#1B3A3A", marginTop: 8 },
  breakdownNote: { fontSize: 12, color: "#8A8577", marginTop: 12, fontStyle: "italic" },
  closeButton: { marginTop: 16, alignItems: "center", padding: 12 },
  closeButtonText: { fontSize: 15, color: "#4A6363", fontWeight: "600" },
});
