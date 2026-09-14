import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
const EARTH_RADIUS_KM = 6371;
const HEADING_ANIM_DURATION_MS = 200;
const ALIGNMENT_THRESHOLD_DEG = 5;

function toRad(deg) { return (deg * Math.PI) / 180; }
function toDeg(rad) { return (rad * 180) / Math.PI; }

function bearingToQibla(lat, lng) {
  const kaabaLatRad = toRad(KAABA_LAT);
  const kaabaLngRad = toRad(KAABA_LNG);
  const userLatRad = toRad(lat);
  const userLngRad = toRad(lng);
  const dLng = kaabaLngRad - userLngRad;
  const y = Math.sin(dLng) * Math.cos(kaabaLatRad);
  const x = Math.cos(userLatRad) * Math.sin(kaabaLatRad) - Math.sin(userLatRad) * Math.cos(kaabaLatRad) * Math.cos(dLng);
  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

function distanceToKaaba(lat, lng) {
  const dLat = toRad(KAABA_LAT - lat);
  const dLng = toRad(KAABA_LNG - lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(KAABA_LAT)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c);
}

function isValidCoordinate(lat, lng) {
  if (lat === 0 && lng === 0) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  return true;
}

function angleDiff(a, b) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

const SCREEN_STATE = {
  LOADING: 'loading',
  NO_GPS: 'no_gps',
  INVALID_LOCATION: 'invalid_location',
  NO_MAGNETOMETER: 'no_magnetometer',
  READY: 'ready',
};

export default function KiblatScreen({ onNavigate }) {
  const insets = useSafeAreaInsets();
  const [screenState, setScreenState] = useState(SCREEN_STATE.LOADING);
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [accuracy, setAccuracy] = useState('sedang');
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const headingSubscriptionRef = useRef(null);

  useEffect(() => {
    (async () => {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setScreenState(SCREEN_STATE.NO_GPS);
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setScreenState(SCREEN_STATE.NO_GPS);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;

      if (!isValidCoordinate(latitude, longitude)) {
        setScreenState(SCREEN_STATE.INVALID_LOCATION);
        return;
      }

      setLocation({ lat: latitude, lng: longitude });
      await checkCompassAndSubscribe();
    })();

    return () => {
      headingSubscriptionRef.current?.remove();
    };
  }, []);

  async function checkCompassAndSubscribe() {
    const available = await Magnetometer.isAvailableAsync();
    if (!available) {
      setScreenState(SCREEN_STATE.NO_MAGNETOMETER);
      return;
    }
    headingSubscriptionRef.current = await Location.watchHeadingAsync((data) => {
      const newHeading = data.trueHeading != null && data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
      setHeading(newHeading);
      updateAccuracyFromNative(data.accuracy);
    });
    setScreenState(SCREEN_STATE.READY);
  }

  function updateAccuracyFromNative(nativeAccuracy) {
    if (Platform.OS === 'ios') {
      if (nativeAccuracy < 0) setAccuracy('kalibrasi');
      else if (nativeAccuracy <= 5) setAccuracy('baik');
      else if (nativeAccuracy <= 15) setAccuracy('sedang');
      else setAccuracy('kalibrasi');
    } else {
      if (nativeAccuracy >= 3) setAccuracy('baik');
      else if (nativeAccuracy === 2) setAccuracy('sedang');
      else setAccuracy('kalibrasi');
    }
  }

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: heading,
      duration: HEADING_ANIM_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [heading]);

  function openLocationSettings() {
    if (Platform.OS === 'ios') Linking.openURL('app-settings:');
    else Linking.openSettings();
  }

  function BackButton() {
    return (
      <TouchableOpacity
        style={[styles.backButton, { paddingTop: insets.top + 4 }]}
        onPress={() => onNavigate?.('Beranda')}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.backButtonText}>‹ Kembali</Text>
      </TouchableOpacity>
    );
  }

  let content;

  if (screenState === SCREEN_STATE.LOADING) {
    content = (
      <View style={styles.center}>
        <Text style={styles.bodyText}>Mendeteksi lokasi…</Text>
      </View>
    );
  } else if (screenState === SCREEN_STATE.NO_GPS) {
    content = (
      <View style={styles.center}>
        <Text style={styles.bodyText}>Aktifkan GPS untuk menampilkan arah kiblat</Text>
        <TouchableOpacity style={styles.button} onPress={openLocationSettings}>
          <Text style={styles.buttonText}>Buka Pengaturan</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (screenState === SCREEN_STATE.INVALID_LOCATION) {
    content = (
      <View style={styles.center}>
        <Text style={styles.bodyText}>Lokasi tidak valid, coba lagi</Text>
      </View>
    );
  } else if (screenState === SCREEN_STATE.NO_MAGNETOMETER) {
    const bearing = bearingToQibla(location.lat, location.lng);
    const distance = distanceToKaaba(location.lat, location.lng);
    content = (
      <View style={styles.center}>
        <Text style={styles.bodyText}>Sensor kompas tidak tersedia di perangkat ini</Text>
        <Text style={styles.degreeText}>{Math.round(bearing)}°</Text>
        <Text style={styles.bodyText}>dari Utara sejati</Text>
        <Text style={styles.distanceText}>{distance} km ke Ka'bah</Text>
      </View>
    );
  } else {
    const bearing = bearingToQibla(location.lat, location.lng);
    const distance = distanceToKaaba(location.lat, location.lng);
    const qiblaRotation = (bearing - heading + 360) % 360;
    const isAligned = angleDiff(bearing, heading) < ALIGNMENT_THRESHOLD_DEG;
    const accuracyLabel = { baik: 'Akurasi baik', sedang: 'Akurasi sedang', kalibrasi: 'Perlu kalibrasi' }[accuracy];
    const dialRotate = rotateAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '-360deg'] });

    content = (
      <View style={styles.container}>
        <Text style={styles.distanceText}>{distance} km ke Ka'bah</Text>
        <View style={styles.compassWrapper}>
          <View style={styles.facingPointer}>
            <Text style={styles.facingPointerText}>▼</Text>
          </View>
          <Animated.View style={[styles.compassCircle, { transform: [{ rotate: dialRotate }] }]}>
            <Text style={[styles.cardinalLabel, styles.northLabel]}>U</Text>
            <Text style={[styles.cardinalLabel, styles.eastLabel]}>T</Text>
            <Text style={[styles.cardinalLabel, styles.southLabel]}>S</Text>
            <Text style={[styles.cardinalLabel, styles.westLabel]}>B</Text>
          </Animated.View>
          <View style={[styles.qiblaMarker, { transform: [{ rotate: `${qiblaRotation}deg` }] }]}>
            <Text style={styles.qiblaIcon}>🕋</Text>
          </View>
        </View>
        <Text style={styles.headingText}>Hadap: {Math.round(heading)}°</Text>
        <Text style={styles.headingText}>Kiblat: {Math.round(bearing)}° dari Utara</Text>
        {isAligned ? <Text style={styles.alignedText}>✅ Tepat menghadap kiblat!</Text> : null}
        <Text style={[styles.accuracyText, accuracy === 'kalibrasi' && styles.accuracyWarning]}>{accuracyLabel}</Text>
        {accuracy === 'kalibrasi' && (
          <Text style={styles.calibrationHint}>Goyangkan HP membentuk pola angka 8, jauhkan dari benda magnetik</Text>
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F6F3' }}>
      <BackButton />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: { paddingHorizontal: 20, paddingBottom: 4 },
  backButtonText: { fontSize: 15, color: '#0F4C4C', fontWeight: '700' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F6F3', padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F6F3', padding: 24 },
  bodyText: { fontSize: 16, color: '#2B2B2B', textAlign: 'center', marginBottom: 12 },
  degreeText: { fontSize: 48, fontWeight: '700', color: '#0F4C4C', marginVertical: 8 },
  distanceText: { fontSize: 15, color: '#6B6B6B', marginBottom: 24 },
  headingText: { fontSize: 14, color: '#2B2B2B', marginTop: 4 },
  alignedText: { marginTop: 10, fontSize: 16, fontWeight: '700', color: '#1F8A4C' },
  compassWrapper: { width: 280, height: 300, alignItems: 'center', justifyContent: 'flex-end' },
  facingPointer: { position: 'absolute', top: 0, alignItems: 'center' },
  facingPointerText: { fontSize: 20, color: '#B3541E', fontWeight: '900' },
  compassCircle: { width: 280, height: 280, borderRadius: 140, borderWidth: 2, borderColor: '#0F4C4C', position: 'absolute', bottom: 0 },
  cardinalLabel: { position: 'absolute', fontSize: 16, fontWeight: '700', color: '#0F4C4C' },
  northLabel: { top: 10, left: 134 },
  eastLabel: { top: 132, right: 12 },
  southLabel: { bottom: 10, left: 134 },
  westLabel: { top: 132, left: 12 },
  qiblaMarker: { position: 'absolute', bottom: 0, width: 280, height: 280, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 },
  qiblaIcon: { fontSize: 32 },
  accuracyText: { marginTop: 20, fontSize: 14, color: '#4A8A6E' },
  accuracyWarning: { color: '#B3541E', fontWeight: '600' },
  calibrationHint: { marginTop: 6, fontSize: 13, color: '#6B6B6B', textAlign: 'center' },
  button: { marginTop: 16, backgroundColor: '#0F4C4C', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  buttonText: { color: '#F7F6F3', fontWeight: '600' },
});
