import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './lib/supabase';
import { signInWithOtp, verifyOtp, signInAnonymously, onAuthStateChange, getSession, signOut } from './lib/auth';
import KiblatScreen from './src/screens/KiblatScreen';
import HomeScreen from './src/screens/HomeScreen';
import KalenderScreen from './src/screens/KalenderScreen';
import EksplorasiScreen from './src/screens/EksplorasiScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import KepribadianScreen from './src/screens/KepribadianScreen';
import PerjodohanWrapper from './src/screens/PerjodohanWrapper';
import AppShell from './src/components/AppShell';

function AppContent() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [activeScreen, setActiveScreen] = useState('Beranda');

  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
    const { data: listener } = onAuthStateChange((s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSendOtp = async () => {
    setError('');
    try {
      await signInWithOtp(email);
      setOtpSent(true);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    try {
      await verifyOtp(email, otp);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleGuest = async () => {
    setError('');
    try {
      await signInAnonymously();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (session) {
    // Beranda sudah full-responsive lewat AppShell.
    // Screen lain masih pakai layout lama (self-contained), akan dimigrasi berikutnya.
    if (activeScreen === 'Beranda') {
      return (
        <AppShell active={activeScreen} onNavigate={setActiveScreen}>
          <HomeScreen onNavigate={setActiveScreen} />
        </AppShell>
      );
    }
    switch (activeScreen) {
      case 'Arah':
        return <KiblatScreen onNavigate={setActiveScreen} />;
      case 'Kalender':
        return <KalenderScreen onNavigate={setActiveScreen} />;
      case 'Eksplorasi':
        return <EksplorasiScreen onNavigate={setActiveScreen} />;
      case 'Library':
        return <LibraryScreen onNavigate={setActiveScreen} />;
      case 'Kepribadian':
        return <KepribadianScreen onNavigate={setActiveScreen} />;
      case 'Perjodohan':
        return <PerjodohanWrapper onNavigate={setActiveScreen} />;
      default:
        return (
          <AppShell active={activeScreen} onNavigate={setActiveScreen}>
            <HomeScreen onNavigate={setActiveScreen} />
          </AppShell>
        );
    }
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Falak Nusantara</Text>
      {!otpSent ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Button title="Kirim kode OTP" onPress={handleSendOtp} />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Kode OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
          <Button title="Verifikasi" onPress={handleVerifyOtp} />
        </>
      )}
      <View style={{ height: 16 }} />
      <Button title="Lanjut sebagai Tamu" onPress={handleGuest} color="#888" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F7F6F3' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: '#1A1A1A' },
  input: { borderWidth: 1, borderColor: '#E5E3DD', borderRadius: 8, padding: 10, width: '100%', marginBottom: 12, backgroundColor: '#FFFFFF' },
  error: { color: 'red', marginTop: 12, textAlign: 'center' },
});
