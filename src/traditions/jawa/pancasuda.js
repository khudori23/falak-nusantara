import { hitungWeton } from '../../lib/weton';
import { ambilAturan, toLocalISODate } from '../../engines/dayQuality/shared';

// Pancasuda: total neptu (hari + pasaran) dibagi 5, sisanya dipetakan ke
// 5 kategori tradisional Jawa: 0=Pati, 1=Sri, 2=Lungguh, 3=Gedhong, 4=Lara

export function hitungPancasuda(date) {
  const weton = hitungWeton(date);
  const pancasudaSisa = weton.totalNeptu % 5;
  return { ...weton, pancasudaSisa, dateISO: toLocalISODate(date) };
}

export async function hitungAdatJawa(date, activityCode) {
  const pancasuda = hitungPancasuda(date);
  const rules = await ambilAturan('adat_jawa', activityCode);
  const rule = rules.find(function (r) {
    return r.criteria_json && r.criteria_json.pancasuda_sisa === pancasuda.pancasudaSisa;
  });

  const calculationSteps = [
    { label: 'Hari & Pasaran', detail: pancasuda.hari + ' ' + pancasuda.pasaran },
    { label: 'Neptu Hari', detail: String(pancasuda.neptuHari) },
    { label: 'Neptu Pasaran', detail: String(pancasuda.neptuPasaran) },
    { label: 'Total Neptu', detail: pancasuda.neptuHari + ' + ' + pancasuda.neptuPasaran + ' = ' + pancasuda.totalNeptu },
    { label: 'Pancasuda (sisa bagi 5)', detail: pancasuda.totalNeptu + ' % 5 = ' + pancasuda.pancasudaSisa },
    { label: 'Kategori Pancasuda', detail: (rule && rule.criteria_json && rule.criteria_json.nama) || '(tidak ada aturan untuk kategori ini)' },
  ];

  if (rule) {
    calculationSteps.push({ label: 'Status Kepercayaan Sumber', detail: rule.confidence_status || 'BELUM DINILAI' });
  }

  if (!rule) {
    return { methodCode: 'adat_jawa', methodTitle: 'Adat Jawa (Pancasuda)', found: false, pancasuda, calculationSteps };
  }

  return {
    methodCode: 'adat_jawa',
    methodTitle: (rule.traditional_methods && rule.traditional_methods.title) || 'Adat Jawa (Pancasuda)',
    found: true,
    quality_rating: rule.quality_rating,
    explanation: rule.explanation,
    notes: rule.notes,
    rule_key: rule.rule_key,
    confidenceStatus: rule.confidence_status ?? null,
    namaPancasuda: rule.criteria_json?.nama,
    activityType: rule.activity_types,
    method: rule.traditional_methods,
    pancasuda,
    calculationSteps,
  };
}
