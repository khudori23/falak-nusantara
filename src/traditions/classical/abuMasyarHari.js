import { ambilAturan } from '../../engines/dayQuality/shared';

export async function hitungAbuMasyar(date, activityCode) {
  const dayOfWeek = date.getDay();
  const rules = await ambilAturan('abu_masyar_hitungan_hari', activityCode);
  const rule = rules.find(function (r) {
    return r.criteria_json && r.criteria_json.day_of_week === dayOfWeek;
  });

  const calculationSteps = [
    { label: 'Hari ke- (0=Minggu)', detail: String(dayOfWeek) },
    {
      label: 'Nama Hari & Planet Penguasa',
      detail: rule && rule.criteria_json && rule.criteria_json.day_name && rule.criteria_json.planet
        ? rule.criteria_json.day_name + ' -> dikuasai ' + rule.criteria_json.planet
        : "(tidak ada aturan Abu Ma'syar untuk hari ini)",
    },
  ];

  if (rule) {
    calculationSteps.push({ label: 'Status Kepercayaan Sumber', detail: rule.confidence_status || 'BELUM DINILAI' });
  }

  if (!rule) {
    return { methodCode: 'abu_masyar_hitungan_hari', methodTitle: "Abu Ma'syar (Planet Hari)", found: false, dayOfWeek, calculationSteps };
  }

  return {
    methodCode: 'abu_masyar_hitungan_hari',
    methodTitle: (rule.traditional_methods && rule.traditional_methods.title) || "Abu Ma'syar (Planet Hari)",
    found: true,
    quality_rating: rule.quality_rating,
    explanation: rule.explanation,
    notes: rule.notes,
    rule_key: rule.rule_key,
    confidenceStatus: rule.confidence_status ?? null,
    planet: rule.criteria_json?.planet,
    dayName: rule.criteria_json?.day_name,
    activityType: rule.activity_types,
    method: rule.traditional_methods,
    dayOfWeek,
    calculationSteps,
  };
}
