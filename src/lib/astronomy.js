/**
 * astronomy.js
 * -----------------------------------------------------------------------
 * MODUL ASTRONOMI — FALAK NUSANTARA
 *
 * ATURAN WAJIB (§8 Master Prompt Hitungan Hari):
 * File ini HANYA berisi fakta astronomi objektif (posisi Matahari/Bulan,
 * waktu terbit/terbenam, fase Bulan, dsb). File ini TIDAK BOLEH berisi
 * interpretasi tradisi apa pun (baik/buruk, cocok/pantang, dsb).
 *
 * Interpretasi tradisi (mis. "hari baik menurut Adat Jawa") harus
 * dilakukan di layer/engine tradisi terpisah yang MENGONSUMSI output
 * modul ini sebagai input, bukan di dalam file ini.
 *
 * Sumber perhitungan: library `suncalc` (algoritma astronomi berbasis
 * formula NOAA/Jean Meeus untuk posisi Matahari & Bulan).
 * -----------------------------------------------------------------------
 */

import SunCalc from 'suncalc';

/**
 * Mengambil seluruh fakta astronomi objektif untuk satu tanggal & lokasi.
 *
 * @param {Date} date - Tanggal/waktu acuan (gunakan tengah hari lokal agar
 *   perhitungan sunrise/sunset hari tersebut akurat).
 * @param {number} lat - Lintang (derajat desimal, + untuk Utara).
 * @param {number} lng - Bujur (derajat desimal, + untuk Timur).
 * @returns {object} Kumpulan fakta astronomi murni (tanpa interpretasi).
 */
export function getAstronomicalFacts(date, lat, lng) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('getAstronomicalFacts: `date` harus objek Date yang valid.');
  }
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('getAstronomicalFacts: `lat` dan `lng` harus angka.');
  }

  const sunTimes = SunCalc.getTimes(date, lat, lng);
  const sunPosition = SunCalc.getPosition(date, lat, lng);
  const moonTimes = SunCalc.getMoonTimes(date, lat, lng);
  const moonIllumination = SunCalc.getMoonIllumination(date);
  const moonPosition = SunCalc.getMoonPosition(date, lat, lng);

  return {
    input: {
      date: date.toISOString(),
      lat,
      lng,
    },
    matahari: {
      terbit: sunTimes.sunrise ?? null,
      terbenam: sunTimes.sunset ?? null,
      tengah_hari_astronomis: sunTimes.solarNoon ?? null,
      fajar_astronomis_mulai: sunTimes.dawn ?? null,
      senja_astronomis_mulai: sunTimes.dusk ?? null,
      fajar_nautika: sunTimes.nauticalDawn ?? null,
      senja_nautika: sunTimes.nauticalDusk ?? null,
      akhir_malam: sunTimes.nightEnd ?? null,
      awal_malam: sunTimes.night ?? null,
      altitude_derajat: radToDeg(sunPosition.altitude),
      azimuth_derajat: radToDeg(sunPosition.azimuth),
    },
    bulan: {
      terbit: moonTimes.rise ?? null,
      terbenam: moonTimes.set ?? null,
      selalu_di_atas_horizon: moonTimes.alwaysUp ?? false,
      selalu_di_bawah_horizon: moonTimes.alwaysDown ?? false,
      fraksi_fase: moonIllumination.phase,
      fraksi_iluminasi: moonIllumination.fraction,
      sudut_bulan_derajat: radToDeg(moonIllumination.angle),
      altitude_derajat: radToDeg(moonPosition.altitude),
      azimuth_derajat: radToDeg(moonPosition.azimuth),
      jarak_km: moonPosition.distance,
      nama_fase: getMoonPhaseName(moonIllumination.phase),
    },
    metadata: {
      metode: 'suncalc (formula astronomi NOAA/Jean Meeus)',
      catatan: 'Data ini murni astronomi objektif, tidak mengandung interpretasi tradisi apa pun.',
    },
  };
}

/**
 * Menerjemahkan fraksi fase Bulan (0–1) menjadi nama fase dalam Bahasa
 * Indonesia. Ini adalah label astronomi standar (bukan interpretasi
 * tradisi), sama seperti istilah "purnama"/"bulan baru" di kalender umum.
 *
 * @param {number} phaseFraction - 0 = bulan baru, 0.5 = purnama, 1 = bulan baru berikutnya.
 * @returns {string}
 */
export function getMoonPhaseName(phaseFraction) {
  if (phaseFraction < 0.03 || phaseFraction > 0.97) return 'Bulan Baru';
  if (phaseFraction < 0.22) return 'Sabit Awal (Waxing Crescent)';
  if (phaseFraction < 0.28) return 'Kuartal Pertama';
  if (phaseFraction < 0.47) return 'Cembung Awal (Waxing Gibbous)';
  if (phaseFraction < 0.53) return 'Purnama';
  if (phaseFraction < 0.72) return 'Cembung Akhir (Waning Gibbous)';
  if (phaseFraction < 0.78) return 'Kuartal Akhir';
  return 'Sabit Akhir (Waning Crescent)';
}

function radToDeg(rad) {
  if (typeof rad !== 'number') return null;
  return (rad * 180) / Math.PI;
}
