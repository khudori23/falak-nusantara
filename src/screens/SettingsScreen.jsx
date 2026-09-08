import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

export default function SettingsScreen({ onNavigate }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    setLoading(true);
    const { data, error } = await supabase
      .from('locations')
      .select('id, label, lat, lng, is_default')
      .order('is_default', { ascending: false });

    if (error) {
      Alert.alert('Gagal memuat lokasi', error.message);
    } else {
      setLocations(data);
    }
    setLoading(false);
  }

  async function addLocation() {
    if (!label || !lat || !lng) {
      Alert.alert('Lengkapi dulu', 'Label, latitude, dan longitude wajib diisi.');
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('locations').insert({
      user_id: user?.id ?? null,
      label,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      is_default: locations.length === 0,
    });

    if (error) {
      Alert.alert('Gagal menyimpan lokasi', error.message);
    } else {
      setLabel('');
      setLat('');
      setLng('');
      fetchLocations();
    }
  }

  async function setAsDefault(id) {
    await supabase.from('locations').update({ is_default: false }).neq('id', id);
    const { error } = await supabase
      .from('locations')
      .update({ is_default: true })
      .eq('id', id);

    if (error) {
      Alert.alert('Gagal mengatur lokasi default', error.message);
    } else {
      fetchLocations();
    }
  }

  async function deleteLocation(id) {
    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) {
      Alert.alert('Gagal menghapus lokasi', error.message);
    } else {
      fetchLocations();
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Pengaturan</Text>

        <Text style={styles.sectionTitle}>Lokasi Tersimpan</Text>
        {loading && <ActivityIndicator color={colors.primary} />}

        {!loading && locations.length === 0 && (
          <Text style={styles.emptyText}>
            Belum ada lokasi tersimpan. Tambahkan lokasi favorit untuk kiblat & waktu salat.
          </Text>
        )}

        {locations.map((loc) => (
          <View key={loc.id} style={styles.locationCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationLabel}>
                {loc.label} {loc.is_default ? '★' : ''}
              </Text>
              <Text style={styles.locationCoord}>
                {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
              </Text>
            </View>
            {!loc.is_default && (
              <TouchableOpacity onPress={() => setAsDefault(loc.id)} style={styles.smallBtn}>
                <Text style={styles.smallBtnText}>Jadikan Default</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => deleteLocation(loc.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>Hapus</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Tambah Lokasi</Text>
        <TextInput
          style={styles.input}
          placeholder="Label (mis. Rumah, Kantor)"
          placeholderTextColor={colors.textSecondary}
          value={label}
          onChangeText={setLabel}
        />
        <TextInput
          style={styles.input}
          placeholder="Latitude"
          placeholderTextColor={colors.textSecondary}
          value={lat}
          onChangeText={setLat}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Longitude"
          placeholderTextColor={colors.textSecondary}
          value={lng}
          onChangeText={setLng}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addLocation}>
          <Text style={styles.addBtnText}>Simpan Lokasi</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Tentang</Text>
        <TouchableOpacity style={styles.linkRow}>
          <Text style={styles.linkText}>Tentang Metode Perhitungan</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNav active="Lainnya" onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 80 },
  header: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: { color: colors.textSecondary },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  locationLabel: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  locationCoord: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  smallBtn: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 6,
  },
  smallBtnText: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  deleteBtn: {
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  deleteBtnText: { fontSize: 12, color: colors.danger, fontWeight: '600' },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: { color: colors.textOnPrimary, fontWeight: '600', fontSize: 15 },
  linkRow: { paddingVertical: 12 },
  linkText: { color: colors.primary, fontSize: 15 },
});
