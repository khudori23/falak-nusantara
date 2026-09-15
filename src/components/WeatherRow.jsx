import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';
import { getCoordinates, fetchWeather, mapWeatherCode, weatherLabel } from '../lib/weather';

const LOTTIE_MAP = {
  'sunny': require('../assets/lottie/sunny.json'),
  'clear-night': require('../assets/lottie/clear-night.json'),
  'partly-cloudy': require('../assets/lottie/partly-cloudy.json'),
  'cloudy': require('../assets/lottie/cloudy.json'),
  'rain': require('../assets/lottie/rain.json'),
  'thunderstorm': require('../assets/lottie/thunderstorm.json'),
  'fog': require('../assets/lottie/fog.json'),
  'snow': require('../assets/lottie/snow.json'),
};

const REFRESH_INTERVAL_MS = 20 * 60 * 1000;

export default function WeatherRow() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const coords = await getCoordinates();
      if (!coords) return;
      const data = await fetchWeather(coords.latitude, coords.longitude);
      setWeather(data);
    } catch (e) {
      console.log('Gagal memuat cuaca:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <View style={styles.row}>
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.row}>
        <Text style={styles.label}>Cuaca tidak tersedia</Text>
      </View>
    );
  }

  const category = mapWeatherCode(weather.current.weatherCode, weather.current.isDay);

  return (
    <View style={styles.row}>
      <View style={styles.tempBlock}>
        <Text style={styles.tempValue}>
          {weather.current.temp}
          <Text style={styles.tempUnit}>°C</Text>
        </Text>
        <Text style={styles.condition}>{weatherLabel(weather.current.weatherCode)}</Text>
      </View>

      <LottieView source={LOTTIE_MAP[category]} autoPlay loop style={styles.lottie} />

      <View style={styles.windBlock}>
        <View style={styles.divider} />
        <View>
          <Text style={styles.label}>Angin</Text>
          <Text style={styles.windValue}>{weather.current.windSpeed} km/j</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempBlock: {
    flex: 1,
  },
  tempValue: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tempUnit: {
    fontSize: 18,
    fontWeight: '600',
  },
  condition: {
    color: '#EEF8FB',
    fontSize: 13,
    marginTop: 2,
  },
  lottie: {
    width: 56,
    height: 56,
  },
  windBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 14,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  windValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
});
