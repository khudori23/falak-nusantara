import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { cariTanggalNikah } from '../lib/cariTanggalNikah';

// ASUMSI: Anda sudah punya hasil hitungWeton() untuk kedua mempelai dari layar Perjodohan
// (props hitungWetonPria / hitungWetonWanita dilempar dari screen sebelumnya).
export default function CariTanggalNikahScreen({ route }) {
  const { hitungWetonPria, hitungWetonWanita } = route.params || {};
  const [hanyaBaik, setHanyaBaik] = useState(true);
  const [dasarTampil, setDasarTampil] = useState(null); // id tradisi yang modal-nya dibuka

  const mulai = new Date();
  const selesai = new Date();
  selesai.setDate(selesai.getDate() + 60); // rentang cari 60 hari ke depan

  const hasil = cariTanggalNikah({ hitungWetonPria, hitungWetonWanita }, mulai, selesai);

  const daftarJawa = hanyaBaik ? hasil.jawa.filter((x) => x.layak) : hasil.jawa;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.judul}>Cari Tanggal Nikah</Text>
      <Text style={styles.subjudul}>Tiga tradisi ditampilkan terpisah — tidak digabung jadi satu skor.</Text>

      {/* ===== JAWA ===== */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Jawa — Rumus Pancasuda</Text>
          <TouchableOpacity onPress={() => setDasarTampil(dasarTampil === 'jawa' ? null : 'jawa')}>
            <Text style={styles.linkKecil}>Lihat Dasar Perhitungan</Text>
          </TouchableOpacity>
        </View>
        {dasarTampil === 'jawa' && (
          <Text style={styles.dasarText}>
            Sumber: Betaljemur Adammakna (jilid Lukmanakim, hlm. ~8-21). Rumus: (neptu weton pria +
            neptu weton wanita + neptu hari kandidat) mod 5 → Sri/Lungguh/Gedhong = baik. Bulan Suro
            difilter dulu sebelum tanggal disaring.
          </Text>
        )}
        <View style={styles.rowBetween}>
          <Text>Tampilkan hanya yang baik</Text>
          <Switch value={hanyaBaik} onValueChange={setHanyaBaik} />
        </View>
        {daftarJawa.map((item, i) => (
          <View key={i} style={[styles.card, item.layak ? styles.cardBaik : styles.cardKurang]}>
            <Text style={styles.tanggalCard}>
              {item.tanggal.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
            <Text>
              {item.pancasuda.hasil.nama} — {item.pancasuda.hasil.arti}
            </Text>
            {item.bulanInfo.direkomendasikan && (
              <Text style={styles.catatan}>{item.bulanInfo.catatanBulan}</Text>
            )}
          </View>
        ))}
        {daftarJawa.length === 0 && <Text style={styles.kosong}>Tidak ada tanggal cocok dalam 60 hari ke depan.</Text>}
      </View>

      {/* ===== SUNDA ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sunda — 3 Lapis Sumber</Text>
        <Text style={styles.catatan}>Sengaja tidak dihitung otomatis — lihat status keandalan tiap lapis.</Text>
        {hasil.sunda.map((lapis) => (
          <View key={lapis.id} style={styles.card}>
            <Text style={styles.tanggalCard}>{lapis.judul}</Text>
            <Text>{lapis.isi}</Text>
            <Text style={styles.statusBadge}>{lapis._rule.status}</Text>
          </View>
        ))}
      </View>

      {/* ===== ABU MA'SYAR ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Abu Ma'syar — Interpretasi Planet Hari</Text>
        <Text style={styles.catatan}>
          Bukan tabel "hari baik nikah" (tidak ada di kitab). Ini watak planet penguasa hari sebagai edukasi.
        </Text>
        {hasil.abuMasyar.slice(0, 7).map((item, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.tanggalCard}>
              {item.tanggal.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            {item.interpretasi && (
              <>
                <Text>{item.interpretasi.planet} — {item.interpretasi.watak}</Text>
                <Text style={styles.disclaimer}>{item.interpretasi.disclaimer}</Text>
              </>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  judul: { fontSize: 20, fontWeight: '700' },
  subjudul: { color: '#666', marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  linkKecil: { color: '#2563eb', fontSize: 12 },
  dasarText: { fontSize: 12, color: '#444', backgroundColor: '#f3f4f6', padding: 8, borderRadius: 6, marginBottom: 8 },
  card: { padding: 12, borderRadius: 8, marginBottom: 8, backgroundColor: '#f9fafb' },
  cardBaik: { borderLeftWidth: 4, borderLeftColor: '#16a34a' },
  cardKurang: { borderLeftWidth: 4, borderLeftColor: '#dc2626' },
  tanggalCard: { fontWeight: '600', marginBottom: 4 },
  catatan: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  kosong: { color: '#6b7280', fontStyle: 'italic' },
  statusBadge: { fontSize: 10, color: '#92400e', marginTop: 6 },
  disclaimer: { fontSize: 11, color: '#9ca3af', marginTop: 4, fontStyle: 'italic' },
});
