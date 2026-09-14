// Mapping label kondisi cuaca (dari Edge Function calculate-hari-baik-usaha)
// ke ikon emoji. Label sudah dalam Bahasa Indonesia, bukan kode OpenWeatherMap.

const ICON_BY_LABEL = {
  'Cerah': '☀️',
  'Berawan sebagian': '⛅',
  'Mendung': '☁️',
  'Gerimis': '🌦️',
  'Hujan': '🌧️',
  'Hujan lebat': '🌧️',
  'Hujan es': '🌨️',
  'Badai petir': '⛈️',
  'Salju': '❄️',
  'Kabut/berkabut': '🌫️',
  'Kondisi cuaca tidak dikenali': '❓',
};

export function getWeatherIcon(label) {
  return ICON_BY_LABEL[label] || '🌡️';
}

export function formatWeatherDisplay(weather) {
  if (!weather || weather.temp === undefined || weather.temp === null || !weather.label) {
    return '—';
  }
  const icon = getWeatherIcon(weather.label);
  return `${icon} ${weather.label}, ${weather.temp}°C`;
}
