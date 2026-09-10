const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Set SUPABASE_URL dan SUPABASE_ANON_KEY dulu');
  process.exit(1);
}

const TRADITION_MAP = {
  adat_jawa: 'JAWA',
  adat_sunda: 'SUNDA',
  abu_masyar_hitungan_hari: 'CLASSICAL',
};

const CONFIDENCE_MAP = {
  SUPPORTED_SECONDARY: 'MEDIUM',
  UNVERIFIED: 'LOW',
  VERIFIED_ACADEMIC: 'HIGH',
};

async function main() {
  const path = '/rest/v1/day_quality_rules?select=rule_key,quality_rating,confidence_status,explanation,notes,criteria_json,traditional_methods(code,title),activity_types(code,title),sources(id,title)';
  const url = SUPABASE_URL + path;

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Gagal fetch:', res.status, errText);
    process.exit(1);
  }

  const rows = await res.json();

  const rules = rows.map(function (r) {
    const methodCode = r.traditional_methods ? r.traditional_methods.code : 'UNKNOWN';
    const tradition = TRADITION_MAP[methodCode] || 'UNKNOWN';
    return {
      id: r.rule_key.toUpperCase(),
      tradition: tradition,
      system: r.traditional_methods ? r.traditional_methods.title : methodCode,
      activity: r.activity_types ? r.activity_types.code.toUpperCase() : 'UNKNOWN',
      calculation: {
        method: 'SOURCE_DEFINED_METHOD',
        criteria: r.criteria_json || null,
      },
      outputs: {
        category: r.quality_rating,
        meaning: r.explanation,
      },
      source: {
        title: r.sources ? r.sources.title : null,
        supabase_id: r.sources ? r.sources.id : null,
      },
      status: r.confidence_status,
      confidence: CONFIDENCE_MAP[r.confidence_status] || 'UNKNOWN',
      notes: r.notes || null,
    };
  });

  fs.writeFileSync('data/rules/rules.json', JSON.stringify(rules, null, 2));
  console.log('Selesai:', rules.length, 'rule ditulis ke data/rules/rules.json');
}

main();
