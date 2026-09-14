import { useEffect, useMemo, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import * as SunCalc from 'suncalc';
import { gregorianToHijri } from '../lib/hijri';

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function moonPhaseName(phase) {
  if (phase < 0.03 || phase > 0.97) return 'Bulan Baru';
  if (phase < 0.22) return 'Sabit Awal';
  if (phase < 0.28) return 'Kuartal Pertama';
  if (phase < 0.47) return 'Cembung Awal';
  if (phase < 0.53) return 'Purnama';
  if (phase < 0.72) return 'Cembung Akhir';
  if (phase < 0.78) return 'Kuartal Akhir';
  return 'Sabit Akhir';
}

function formatJam(date) {
  return date.toTimeString().slice(0, 8).replace(/:/g, '.');
}

export function useFalakData() {
  const [now, setNow] = useState(new Date());
  const [location, setLocation] = useState(null); // { lat, lng, label }
  const [locationStatus, setLocationStatus] = useState('loading'); // loading | granted | denied

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchLocation = useCallback(async () => {
    setLocationStatus('loading');
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!servicesEnabled || status !== 'granted') {
        setLocationStatus('denied');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;
      let label = 'Lokasi Anda';
      try {
        const places = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (places?.[0]) {
          const p = places[0];
          label = [p.city || p.subregion || p.region, p.country].filter(Boolean).join(', ');
        }
      } catch (_) {}
      setLocation({ lat: latitude, lng: longitude, label });
      setLocationStatus('granted');
    } catch (_) {
      setLocationStatus('denied');
    }
  }, []);

  useEffect(() => { fetchLocation(); }, [fetchLocation]);

  const dateInfo = useMemo(() => {
    const hijri = gregorianToHijri(now);
    return {
      hariLabel: HARI[now.getDay()],
      tanggalMasehi: `${now.getDate()} ${BULAN[now.getMonth()]} ${now.getFullYear()}`,
      hijriLabel: `${hijri.day} ${hijri.month} ${hijri.year} H`,
      jamDigital: formatJam(now),
    };
  }, [now.toDateString(), now.getSeconds()]);

  const astro = useMemo(() => {
    if (!location) return null;
    const times = SunCalc.getTimes(now, location.lat, location.lng);
    const moon = SunCalc.getMoonIllumination(now);
    return {
      terbit: times.sunrise?.toTimeString().slice(0, 5),
      terbenam: times.sunset?.toTimeString().slice(0, 5),
      fasebulan: moonPhaseName(moon.phase),
      iluminasi: Math.round(moon.fraction * 100),
    };
  }, [location, now.toDateString()]);

  return { now, ...dateInfo, location, locationStatus, astro, refreshLocation: fetchLocation };
}
