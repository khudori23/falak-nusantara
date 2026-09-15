import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import LottieView from 'lottie-react-native';
import { getCoordinates, fetchWeather, mapWeatherCode, weatherLabel } from '../lib/weather';
import { colors } from '../theme/colors';

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

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const REFRESH_INTERVAL_MS = 20 * 60 * 1000; // auto-refresh tiap 20 menit

export default function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const coords = await getCoordinates();
      if (!coords) {
        setError('Lokasi belum diatur. Tambahkan lokasi di Pengaturan.');
        return;
      }
      setLocationLabel(coords.label);
      const data = await fetchWeather(coords.latitude, coords.longitude);
      setWeather(data);
    } catch (e) {
      setError('Gagal memuat data cuaca.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!weather) return null;

  const category = mapWeatherCode(weather.current.weatherCode, weather.current.isDay);

  return (
    <View style={styles.card}>
      <Text style={styles.location}>{locationLabel}</Text>

      <View style={styles.currentRow}>
        <LottieView
          source={LOTTIE_MAP[category]}
          autoPlay
          loop
          style={styles.mainLottie}
        />
        <View style={styles.currentInfo}>
          <Text style={styles.temp}>{weather.current.temp}°C</Text>
          <Text style={styles.condition}>{weatherLabel(weather.current.weatherCode)}</Text>
        </View>
        <View style={styles.statsCol}>
          <Text style={styles.statText}>Angin: {weather.current.windSpeed} km/j</Text>
          <Text style={styles.statText}>Hujan: {weather.current.precipitation} mm</Text>
          <Text style={styles.statText}>Tekanan: {weather.current.pressure} mb</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.forecastRow}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
      >
        {weather.daily.map((day, i) => {
          const dayCat = mapWeatherCode(day.weatherCode, true);
          const dayName = i === 0 ? 'Hari ini' : DAY_NAMES[new Date(day.date).getDay()];
          return (
            <View key={day.date} style={styles.forecastItem}>
              <Text style={styles.forecastDay}>{dayName}</Text>
              <LottieView
                source={LOTTIE_MAP[dayCat]}
                autoPlay
                loop
                style={styles.forecastLottie}
              />
              <Text style={styles.forecastTemp}>{day.tempMax}°</Text>
              <Text style={styles.forecastTempMin}>{day.tempMin}°</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  location: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainLottie: {
    width: 80,
    height: 80,
  },
  currentInfo: {
    alignItems: 'center',
  },
  temp: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: '700',
  },
  condition: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  statsCol: {
    alignItems: 'flex-end',
  },
  statText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  forecastRow: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 12,
  },
  forecastItem: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 48,
  },
  forecastDay: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  forecastLottie: {
    width: 36,
    height: 36,
  },
  forecastTemp: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  forecastTempMin: {
    color: colors.textSecondary,
    fontSize: 11,
  },
});
