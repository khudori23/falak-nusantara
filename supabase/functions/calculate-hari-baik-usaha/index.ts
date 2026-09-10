// =====================================================================
// FALAK NUSANTARA — Supabase Edge Function: calculate-hari-baik-usaha
// Multi-Engine Scoring System (Sunda + Jawa + Abu Ma'syar + Validasi Real-time)
// =====================================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type KategoriUsaha = "PERTANIAN" | "PETERNAKAN";
type JenisKegiatan =
  | "OLAH_TANAH" | "TANAM_BIBIT" | "PANEN" | "SIMPAN_HASIL"
  | "BELI_TERNAK" | "JUAL_TERNAK" | "MENGAWINKAN_TERNAK" | "PINDAH_KANDANG";
type MetodeTradisi = "SUNDA" | "JAWA" | "ABU_MASYAR" | "GABUNGAN";
type ElemenThabai = "API" | "TANAH" | "UDARA" | "AIR";
type FaseBulan = "WAXING" | "WANING";

interface RequestBody {
  kategori: KategoriUsaha;
  kegiatan: JenisKegiatan;
  metode?: MetodeTradisi;
  target_date: string;
  latitude?: number;
  longitude?: number;
  user_id?: string;
}

const WEIGHTS = { sunda: 0.30, jawa: 0.35, abuMasyar: 0.35 };

function toJulianDay(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

function julianDayToHijri(jd: number): { year: number; month: number; day: number } {
  const islamicEpoch = 1948440;
  const daysSinceEpoch = jd - islamicEpoch + 1;
  const cycles = Math.floor(daysSinceEpoch / 10631);
  let remaining = daysSinceEpoch - cycles * 10631;

  const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
  let year = cycles * 30 + 1;
  while (true) {
    const yearInCycle = ((year - 1) % 30) + 1;
    const daysInYear = leapYears.includes(yearInCycle) ? 355 : 354;
    if (remaining <= daysInYear) break;
    remaining -= daysInYear;
    year += 1;
  }

  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  const yearInCycleFinal = ((year - 1) % 30) + 1;
  if (leapYears.includes(yearInCycleFinal)) monthLengths[11] = 30;

  let month = 1;
  for (const len of monthLengths) {
    if (remaining <= len) break;
    remaining -= len;
    month += 1;
  }

  return { year, month, day: remaining };
}

function gregorianToHijri(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const jd = toJulianDay(y, m, d);
  return julianDayToHijri(jd);
}

const HARI_INDEX = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const PASARAN_INDEX = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
const PASARAN_EPOCH_JD = toJulianDay(1900, 1, 1);

function hitungHariPasaran(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const jsDate = new Date(Date.UTC(y, m - 1, d));
  const namaHari = HARI_INDEX[jsDate.getUTCDay()];
  const jd = toJulianDay(y, m, d);
  const offset = ((jd - PASARAN_EPOCH_JD) % 5 + 5) % 5;
  const namaPasaran = PASARAN_INDEX[offset];
  return { namaHari, namaPasaran };
}

async function hitungEngineJawa(supabase: SupabaseClient, dateStr: string, kegiatan: JenisKegiatan) {
  const { namaHari, namaPasaran } = hitungHariPasaran(dateStr);

  const { data: refHari } = await supabase.from("ref_jawa_neptu_hari").select("nilai_neptu").eq("nama_hari", namaHari).single();
  const { data: refPasaran } = await supabase.from("ref_jawa_neptu_pasaran").select("nilai_neptu").eq("nama_pasaran", namaPasaran).single();

  const nilaiNeptuHari = refHari?.nilai_neptu ?? 0;
  const nilaiNeptuPasaran = refPasaran?.nilai_neptu ?? 0;
  const totalNeptu = nilaiNeptuHari + nilaiNeptuPasaran;

  const sisaModulus = totalNeptu % 5;
  const { data: refPancasuda } = await supabase.from("ref_jawa_pancasuda").select("kategori, skor_dasar, deskripsi").eq("sisa_modulus", sisaModulus).single();

  const { data: semuaMangsa } = await supabase.from("ref_jawa_pranata_mangsa").select("nomor_mangsa, nama_mangsa, perkiraan_tanggal_mulai, durasi_hari, cocok_untuk").order("nomor_mangsa", { ascending: true });

  const mangsaAktif = cariMangsaAktif(dateStr, semuaMangsa ?? []);
  const skorPancasuda = refPancasuda?.skor_dasar ?? 50;
  const skorMangsa = mangsaAktif ? 75 : 50;
  const score = Math.round(skorPancasuda * 0.7 + skorMangsa * 0.3);

  return {
    score,
    detail: {
      hari: namaHari,
      pasaran: namaPasaran,
      neptu_hari: nilaiNeptuHari,
      neptu_pasaran: nilaiNeptuPasaran,
      total_neptu: totalNeptu,
      pancasuda: refPancasuda?.kategori ?? "TIDAK_DIKETAHUI",
      pancasuda_deskripsi: refPancasuda?.deskripsi ?? null,
      mangsa: mangsaAktif?.nama_mangsa ?? null,
      mangsa_cocok_untuk: mangsaAktif?.cocok_untuk ?? null,
    },
  };
}

function cariMangsaAktif(dateStr: string, semuaMangsa: any[]) {
  const [, m, d] = dateStr.split("-").map(Number);
  const targetMMDD = m * 100 + d;
  const withMMDD = semuaMangsa.map((mg) => {
    const [mm, dd] = mg.perkiraan_tanggal_mulai.split("-").map(Number);
    return { ...mg, mmdd: mm * 100 + dd };
  });
  const kandidatSebelum = withMMDD.filter((mg) => mg.mmdd <= targetMMDD).sort((a, b) => b.mmdd - a.mmdd);
  if (kandidatSebelum.length > 0) return kandidatSebelum[0];
  const sorted = [...withMMDD].sort((a, b) => b.mmdd - a.mmdd);
  return sorted[0] ?? null;
}

const WINDU_NAMA = ["Alip", "Ehe", "Jimawal", "Je", "Dal", "Be", "Wawu", "Jimakir"];

async function hitungEngineSunda(supabase: SupabaseClient, dateStr: string, kegiatan: JenisKegiatan) {
  const hijri = gregorianToHijri(dateStr);
  const urutanWindu = ((hijri.year - 1) % 8) + 1;
  const { data: refWindu } = await supabase.from("ref_sunda_windu_tahun").select("nama_tahun, arah_awal_olah_tanah, catatan").eq("urutan_tahun", urutanWindu).single();

  let urutanPaca = hijri.day % 4;
  if (urutanPaca === 0) urutanPaca = 4;

  const { data: refPaca } = await supabase.from("ref_sunda_paca_opat").select("status_paca, skor_dasar, kegiatan_terbaik, kegiatan_dihindari, deskripsi").eq("urutan_angka", urutanPaca).single();

  let score = refPaca?.skor_dasar ?? 50;
  const kegiatanLabel = kegiatanKeLabelSingkat(kegiatan);
  if (refPaca?.kegiatan_terbaik?.toLowerCase().includes(kegiatanLabel)) {
    score = Math.min(100, score + 10);
  } else if (refPaca?.kegiatan_dihindari?.toLowerCase().includes(kegiatanLabel)) {
    score = Math.max(0, score - 30);
  }

  return {
    score,
    detail: {
      tahun_hijriah: hijri.year,
      windu: refWindu?.nama_tahun ?? WINDU_NAMA[urutanWindu - 1],
      arah_awal_olah_tanah: refWindu?.arah_awal_olah_tanah ?? null,
      windu_catatan: refWindu?.catatan ?? null,
      paca_opat_status: refPaca?.status_paca ?? "TIDAK_DIKETAHUI",
      paca_opat_deskripsi: refPaca?.deskripsi ?? null,
    },
  };
}

function kegiatanKeLabelSingkat(kegiatan: JenisKegiatan): string {
  const map: Record<JenisKegiatan, string> = {
    OLAH_TANAH: "olah tanah",
    TANAM_BIBIT: "tanam bibit",
    PANEN: "panen",
    SIMPAN_HASIL: "simpan hasil",
    BELI_TERNAK: "beli ternak",
    JUAL_TERNAK: "jual ternak",
    MENGAWINKAN_TERNAK: "mengawinkan ternak",
    PINDAH_KANDANG: "pindah kandang",
  };
  return map[kegiatan];
}

function hitungZodiak(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  const mmdd = m * 100 + d;
  if (mmdd >= 321 && mmdd <= 419) return "Aries";
  if (mmdd >= 420 && mmdd <= 520) return "Taurus";
  if (mmdd >= 521 && mmdd <= 620) return "Gemini";
  if (mmdd >= 621 && mmdd <= 722) return "Cancer";
  if (mmdd >= 723 && mmdd <= 822) return "Leo";
  if (mmdd >= 823 && mmdd <= 922) return "Virgo";
  if (mmdd >= 923 && mmdd <= 1022) return "Libra";
  if (mmdd >= 1023 && mmdd <= 1121) return "Scorpio";
  if (mmdd >= 1122 && mmdd <= 1221) return "Sagittarius";
  if (mmdd >= 1222 || mmdd <= 119) return "Capricorn";
  if (mmdd >= 120 && mmdd <= 218) return "Aquarius";
  return "Pisces";
}

async function hitungEngineAbuMasyar(supabase: SupabaseClient, dateStr: string, kegiatan: JenisKegiatan) {
  const hijri = gregorianToHijri(dateStr);
  const faseBulan: FaseBulan = hijri.day <= 15 ? "WAXING" : "WANING";

  const { data: refFase } = await supabase.from("ref_abu_masyar_fase_bulan").select("cocok_untuk, skor_dasar").eq("fase", faseBulan).single();
  const namaZodiak = hitungZodiak(dateStr);
  const { data: refZodiak } = await supabase.from("ref_abu_masyar_element").select("elemen, cocok_untuk, hindari_untuk").eq("zodiak", namaZodiak).single();
  const { data: refMap } = await supabase.from("ref_kegiatan_elemen_map").select("elemen_cocok, fase_bulan_cocok, bobot_kecocokan").eq("kegiatan", kegiatan).single();

  let score = refFase?.skor_dasar ?? 50;
  const elemenHariIni: ElemenThabai | undefined = refZodiak?.elemen;
  if (refMap && elemenHariIni) {
    const elemenCocok: ElemenThabai[] = refMap.elemen_cocok ?? [];
    const faseCocok = faseBulan === refMap.fase_bulan_cocok;
    const elemenMatch = elemenCocok.includes(elemenHariIni);
    if (elemenMatch && faseCocok) score = Math.min(100, score + refMap.bobot_kecocokan * 0.2);
    else if (elemenMatch || faseCocok) score = Math.min(100, score + refMap.bobot_kecocokan * 0.1);
    else score = Math.max(0, score - 15);
  }

  return {
    score: Math.round(score),
    detail: {
      hari_hijriah: hijri.day,
      bulan_hijriah: hijri.month,
      tahun_hijriah: hijri.year,
      fase_bulan: faseBulan,
      fase_cocok_untuk: refFase?.cocok_untuk ?? null,
      zodiak: namaZodiak,
      elemen: elemenHariIni ?? null,
      elemen_cocok_untuk: refZodiak?.cocok_untuk ?? null,
    },
  };
}

async function hitungMultiplierCuaca(lat: number | undefined, long: number | undefined, kegiatan: JenisKegiatan): Promise<{ multiplier: number; detail: Record<string, unknown> }> {
  const apiKey = Deno.env.get("OPENWEATHER_API_KEY");
  if (!apiKey || lat === undefined || long === undefined) {
    return { multiplier: 1.0, detail: { status: "TIDAK_TERSEDIA", alasan: "Koordinat atau API key cuaca tidak diberikan, memakai multiplier netral." } };
  }
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenWeather status ${res.status}`);
    const json = await res.json();
    const hujanTinggi = (json.list ?? []).some((entry: any) => (entry.rain?.["3h"] ?? 0) > 20);
    const anginKencang = (json.list ?? []).some((entry: any) => (entry.wind?.speed ?? 0) > 15);
    let multiplier = 1.0;
    const kegiatanOutdoor: JenisKegiatan[] = ["OLAH_TANAH", "TANAM_BIBIT", "PANEN", "PINDAH_KANDANG"];
    if (hujanTinggi && kegiatanOutdoor.includes(kegiatan)) multiplier -= 0.25;
    if (anginKencang && kegiatanOutdoor.includes(kegiatan)) multiplier -= 0.1;
    multiplier = Math.max(0.5, multiplier);
    return { multiplier, detail: { status: "OK", hujan_ekstrem_terdeteksi: hujanTinggi, angin_kencang_terdeteksi: anginKencang } };
  } catch (err) {
    return { multiplier: 1.0, detail: { status: "ERROR", alasan: String(err) } };
  }
}

function hitungMultiplierAstro(hijriDay: number): number {
  if (hijriDay === 1 || hijriDay === 15) return 0.97;
  return 1.0;
}

function tentukanGrade(score: number): string {
  if (score >= 90) return "OPTIMAL_EXCELLENCE";
  if (score >= 80) return "SANGAT_BAIK";
  if (score >= 65) return "BAIK";
  if (score >= 45) return "NETRAL";
  if (score >= 25) return "KURANG_BAIK";
  return "HINDARI";
}

function susunActionableInsights(kegiatan: JenisKegiatan, sundaDetail: any, jawaDetail: any, abuMasyarDetail: any, grade: string) {
  const arah = sundaDetail.arah_awal_olah_tanah ?? "Timur";
  const jendelaWaktu = kegiatan === "OLAH_TANAH" || kegiatan === "TANAM_BIBIT" ? "06:00 - 09:30 WIB" : "07:00 - 11:00 WIB";
  return {
    execution_window: jendelaWaktu,
    spatial_orientation: `MULAI_DARI_${arah.toUpperCase().replace(/\s/g, "_")}`,
    mitigation_required: grade === "KURANG_BAIK" || grade === "HINDARI",
  };
}

function susunMitigationNote(grade: string, jawaDetail: any, sundaDetail: any): string | null {
  if (grade !== "KURANG_BAIK" && grade !== "HINDARI") return null;
  return `Hari tergolong ${grade === "HINDARI" ? "kurang disarankan" : "netral cenderung kurang"} (Pancasuda: ${jawaDetail.pancasuda}, Paca Opat: ${sundaDetail.paca_opat_status}). ` +
    `Jika kegiatan tidak dapat ditunda, disarankan memulai dari arah ${sundaDetail.arah_awal_olah_tanah ?? "Timur"} dan membaca doa memohon kelancaran sebagai penawar.`;
}

serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { kategori, kegiatan, target_date, latitude, longitude, user_id } = body;
    const metode: MetodeTradisi = body.metode ?? "GABUNGAN";

    if (!kategori || !kegiatan || !target_date) {
      return new Response(
        JSON.stringify({ meta: { code: 400, status: "error" }, message: "kategori, kegiatan, dan target_date wajib diisi." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const [sunda, jawa, abuMasyar] = await Promise.all([
      hitungEngineSunda(supabase, target_date, kegiatan),
      hitungEngineJawa(supabase, target_date, kegiatan),
      hitungEngineAbuMasyar(supabase, target_date, kegiatan),
    ]);

    const { multiplier: cCuaca, detail: cuacaDetail } = await hitungMultiplierCuaca(latitude, longitude, kegiatan);
    const cAstro = hitungMultiplierAstro(abuMasyar.detail.hari_hijriah as number);

    const skorTertimbang = WEIGHTS.sunda * sunda.score + WEIGHTS.jawa * jawa.score + WEIGHTS.abuMasyar * abuMasyar.score;
    const compositeScoreRaw = skorTertimbang * cCuaca * cAstro;
    const compositeScore = Math.max(0, Math.min(100, Math.round(compositeScoreRaw)));

    const grade = tentukanGrade(compositeScore);
    const actionableInsights = susunActionableInsights(kegiatan, sunda.detail, jawa.detail, abuMasyar.detail, grade);
    const mitigationNote = susunMitigationNote(grade, jawa.detail, sunda.detail);

    const responsePayload = {
      meta: { code: 200, status: "success", version: "1.0.0" },
      request_params: {
        kategori,
        kegiatan,
        metode,
        location: latitude !== undefined && longitude !== undefined ? { lat: latitude, long: longitude } : null,
        target_date,
      },
      assessment: {
        composite_score: compositeScore,
        grade,
        recommendation_level:
          grade === "OPTIMAL_EXCELLENCE" || grade === "SANGAT_BAIK" ? "HIGHLY_RECOMMENDED" : grade === "BAIK" ? "RECOMMENDED" : grade === "NETRAL" ? "NETRAL" : "TIDAK_DISARANKAN",
        actionable_insights: actionableInsights,
        mitigation_note: mitigationNote,
      },
      breakdown: {
        sunda_engine: { score: sunda.score, ...sunda.detail },
        jawa_engine: { score: jawa.score, ...jawa.detail },
        abu_masyar_engine: { score: abuMasyar.score, ...abuMasyar.detail },
        realtime_validation: {
          weather_multiplier: cCuaca,
          astro_multiplier: cAstro,
          weather_detail: cuacaDetail,
        },
      },
    };

    try {
      await supabase.from("calculation_logs").insert({
        user_id: user_id ?? null,
        kategori,
        kegiatan,
        metode,
        target_date,
        location_lat: latitude ?? null,
        location_long: longitude ?? null,
        composite_score: compositeScore,
        grade,
        sunda_score: sunda.score,
        sunda_detail: sunda.detail,
        jawa_score: jawa.score,
        jawa_detail: jawa.detail,
        abu_masyar_score: abuMasyar.score,
        abu_masyar_detail: abuMasyar.detail,
        weather_multiplier: cCuaca,
        astro_multiplier: cAstro,
        weather_detail: cuacaDetail,
        actionable_insights: actionableInsights,
        mitigation_note: mitigationNote,
        raw_response: responsePayload,
      });
    } catch (logErr) {
      console.error("Gagal menyimpan calculation_logs:", logErr);
    }

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ meta: { code: 500, status: "error" }, message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
