import * as Location from 'expo-location';
import { supabase } from './supabase';

// Peta kode cuaca WMO (dipakai Open-Meteo) ke kategori tampilan
export function mapWeatherCode(code, isDay = true) {
  if (code === 0) return isDay ? 'sunny' : 'clear-night';
  if ([1, 2].includes(code)) return isDay ? 'partly-cloudy' : 'clear-night';
  if (code === 3) return 'cloudy';
  if ([45, 48].includes(code)) return 'fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'rain';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 99].includes(code)) return 'thunderstorm';
  return 'cloudy';
}

export function weatherLabel(code) {
  const labels = {
    0: 'Cerah', 1: 'Cerah Berawan', 2: 'Berawan Sebagian', 3: 'Mendung',
    45: 'Berkabut', 48: 'Kabut Beku',
    51: 'Gerimis Ringan', 53: 'Gerimis', 55: 'Gerimis Lebat',
    61: 'Hujan Ringan', 63: 'Hujan', 65: 'Hujan Lebat',
    80: 'Hujan Ringan Sesaat', 81: 'Hujan Sesaat', 82: 'Hujan Lebat Sesaat',
    71: 'Salju Ringan', 73: 'Salju', 75: 'Salju Lebat',
    95: 'Badai Petir', 96: 'Badai Petir + Es', 99: 'Badai Petir Hebat',
  };
  return labels[code] || 'Tidak diketahui';
}

// Ambil koordinat: coba GPS dulu, fallback ke lokasi tersimpan di Supabase
export async function getCoordinates() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        source: 'gps',
        label: 'Lokasi Saat Ini',
      };
    }
  } catch (e) {
    console.log('GPS tidak tersedia, fallback ke lokasi tersimpan:', e.message);
  }

  // Fallback: ambil lokasi default dari tabel locations
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_default', true)
    .maybeSingle();

  if (!error && data) {
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      source: 'saved',
      label: data.name || 'Lokasi Tersimpan',
    };
  }

  return null;
}

export async function fetchWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,is_day,surface_pressure` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=6`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Gagal mengambil data cuaca');
  const data = await res.json();

  return {
    current: {
      temp: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      precipitation: data.current.precipitation,
      pressure: Math.round(data.current.surface_pressure),
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day === 1,
    },
    daily: data.daily.time.map((date, i) => ({
      date,
      weatherCode: data.daily.weather_code[i],
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
    })),
  };
}
