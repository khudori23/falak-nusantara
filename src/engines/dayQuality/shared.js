import { supabase } from '../../lib/supabase';

export const QUALITY_RANK = { pantang: 0, kurang_baik: 1, netral: 2, baik: 3 };

export function toLocalISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

export async function ambilAturan(methodCode, activityCode) {
  const { data, error } = await supabase
    .from('day_quality_rules')
    .select('rule_key, quality_rating, explanation, notes, criteria_json, confidence_status, activity_types!inner(id, code, title, icon), traditional_methods!inner(id, code, title)')
    .eq('activity_types.code', activityCode)
    .eq('traditional_methods.code', methodCode);
  if (error) throw error;
  return data || [];
}
