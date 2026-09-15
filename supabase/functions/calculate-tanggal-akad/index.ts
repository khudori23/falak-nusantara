// supabase/functions/calculate-tanggal-akad/index.ts
// Fase 2 — generator kandidat tanggal akad, dibungkus jadi Supabase Edge Function.
// Pola sama seperti calculate-hari-baik-usaha: verify_jwt=true, user diambil dari
// JWT (bukan dari body), service-role dipakai untuk baca/tulis tabel.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ================== REFERENCE DATA (persis dari dokumen, Bagian 3-9) ==================
const NEPTU_HARI: Record<string, number> = {
  Ahad: 5, Minggu: 5, Senin: 4, Senen: 4, Selasa: 3,
  Rabu: 7, Rebo: 7, Kamis: 8, Kemis: 8, Jumat: 6, Jumaah: 6, Sabtu: 9, Saptu: 9,
};
const URUTAN_HARI = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const BETALJEMUR_NO22: Record<number, { label: string; makna: string }> = {
  1: { label: "Wasesa Segara", makna: "kamot; jembar budi; sugih pangapura; gedhe prabawa" },
  2: { label: "Tunggak Semi", makna: "cepak rejeki" },
  3: { label: "Satriya Wibawa", makna: "kamulyan / kaluhuran" },
  4: { label: "Sumur Sinaba", makna: "pangungsening kapinteran" },
  5: { label: "Satriya Wirang", makna: "dukacita / kawirangan" },
  6: { label: "Bumi Kapethak", makna: "petengan ati; taberi ing gawe; kuat nandang" },
  7: { label: "Lebu Katiup Angin", makna: "papa cintraka; karep ora dadi; kerep ngalih omah" },
};

const BETALJEMUR_NO23: Record<number, { label: string; status: string }> = {
  1: { label: "Sri", status: "baik" },
  2: { label: "Dana", status: "baik" },
  3: { label: "Lara", status: "buruk" },
  4: { label: "Pati", status: "buruk" },
  5: { label: "Lungguh", status: "baik" },
};

const SUNDA_REPOK: Record<number, { label: string }> = {
  1: { label: "Pisang Punggel" }, 2: { label: "Tunggak Semi" }, 3: { label: "Lungguh Gumuling" },
  4: { label: "Satriya Lumaku" }, 5: { label: "Pandita Mukti" }, 6: { label: "Pandan Waringin" },
  7: { label: "Padaringan Kebek" },
};

const ABU_JODOH: Record<number, { status: string; baik: boolean }> = {
  1: { status: "rendah / tidak bagus", baik: false },
  2: { status: "bagus", baik: true },
  3: { status: "awalnya baik, akhirnya jelek", baik: false },
  4: { status: "menyenangkan tetapi akhirnya jelek", baik: false },
  5: { status: "kekeluargaan", baik: true },
  6: { status: "awalnya bagus, akhirnya susah payah", baik: false },
  7: { status: "bagus", baik: true },
  8: { status: "suka menemui kerepotan", baik: false },
  9: { status: "bermusuhan dan pisah", baik: false },
};

const ABU_BURUJ_LIST: { zodiac: string; hariBaik: string[] }[] = [
  { zodiac: "Aries", hariBaik: ["Ahad", "Selasa"] },
  { zodiac: "Taurus", hariBaik: ["Rabu", "Jumat"] },
  { zodiac: "Gemini", hariBaik: ["Rabu", "Jumat", "Ahad"] },
  { zodiac: "Cancer", hariBaik: ["Senin"] },
  { zodiac: "Leo", hariBaik: ["Ahad"] },
  { zodiac: "Virgo", hariBaik: ["Rabu", "Kamis"] },
  { zodiac: "Libra", hariBaik: ["Jumat"] },
  { zodiac: "Scorpio", hariBaik: ["Kamis"] },
  { zodiac: "Sagitarius", hariBaik: ["Kamis"] },
  { zodiac: "Capricorn", hariBaik: ["Sabtu"] },
  { zodiac: "Aquarius", hariBaik: ["Sabtu"] },
  { zodiac: "Pisces", hariBaik: ["Kamis"] },
];

function hariBaikDariZodiac(zodiac: string | null | undefined): string[] {
  if (!zodiac) return [];
  const found = ABU_BURUJ_LIST.find((z) => z.zodiac.toLowerCase() === zodiac.toLowerCase());
  return found ? found.hariBaik : [];
}

// ================== MESIN INTI (Bagian 16) ==================
function modN(n: number, m: number): number {
  const r = n % m;
  return r === 0 ? m : r;
}

function betaljemurNo22(nPria: number, nWanita: number) {
  const total = nPria + nWanita;
  const r10 = total % 10;
  const r = r10 >= 1 && r10 <= 7 ? r10 : modN(total, 7);
  return { remainder: r, ...BETALJEMUR_NO22[r] };
}

function betaljemurNo23(nPria: number, nWanita: number) {
  const r = modN(nPria + nWanita, 5);
  return { remainder: r, ...BETALJEMUR_NO23[r] };
}

function abuDayIntersection(a: string[], b: string[]) {
  return a.filter((h) => b.includes(h));
}

// ================== KALENDER (Bagian 11) ==================
function toJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return (
    d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 +
    Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045
  );
}

function hariDariISO(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const jdn = toJDN(y, m, d);
  const idx = (((jdn + 1) % 7) + 7) % 7;
  return URUTAN_HARI[idx];
}

// ================== KONVERSI KALENDER JAWA (Kurup Asapon) ==================
// Sumber: H. Djanudji, "Penanggalan Jawa 120 Tahun Kuruf Asapon", Dahara Prize, 2013;
// R. Bratakesawa, "Almanak Atusan Taun", Penjebar Semangat, 1968.
// Berlaku HANYA untuk Kurup Asapon (24 Maret 1936 - 25 Agustus 2052).
// Di luar rentang itu, fungsi ini mengembalikan null -- unavailable, bukan tebakan.

const EPOCH_GREGORIAN = { y: 1936, m: 3, d: 24 }; // = 1 Sura 1867 AJ
const EPOCH_TAHUN_JAWA = 1867;
const KURUP_ASAPON_END = { y: 2052, m: 8, d: 25 };
const NAMA_BULAN_JAWA = [
  "Sura", "Sapar", "Mulud", "Bakda Mulud", "Jumadilawal", "Jumadilakir",
  "Rejeb", "Ruwah", "Pasa", "Sawal", "Sela", "Besar",
];
const NAMA_WARSA = ["Alip", "Ehe", "Jimawal", "Je", "Dal", "Be", "Wawu", "Jumakir"];
const UMUR_TAHUN = [354, 355, 354, 355, 354, 354, 354, 355];
const TAHUN_KABISAT_WARSA = [1, 3, 7]; // Ehe, Je, Jumakir -> bulan Besar 30 hari

function konversiMasehiKeJawa(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const jdnTarget = toJDN(y, m, d);
  const jdnEpoch = toJDN(EPOCH_GREGORIAN.y, EPOCH_GREGORIAN.m, EPOCH_GREGORIAN.d);
  const jdnEnd = toJDN(KURUP_ASAPON_END.y, KURUP_ASAPON_END.m, KURUP_ASAPON_END.d);

  if (jdnTarget < jdnEpoch || jdnTarget > jdnEnd) {
    return null; // di luar Kurup Asapon -> unavailable
  }

  const jarak = (jdnTarget - jdnEpoch) + 1;
  const windu = Math.floor(jarak / 2835);
  let sisaHari = jarak - windu * 2835;

  let warsa = 0;
  while (sisaHari - UMUR_TAHUN[warsa] > 0) {
    sisaHari -= UMUR_TAHUN[warsa];
    warsa += 1;
  }
  const tahunJawa = warsa + windu * 8 + EPOCH_TAHUN_JAWA;

  const umurBulan = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  if (TAHUN_KABISAT_WARSA.includes(warsa)) umurBulan[11] = 30;

  let wulan = 0;
  while (sisaHari - umurBulan[wulan] > 0) {
    sisaHari -= umurBulan[wulan];
    wulan += 1;
  }

  return {
    tanggal: sisaHari,
    bulan: wulan + 1,
    bulanJawaNama: NAMA_BULAN_JAWA[wulan],
    tahun: tahunJawa,
    warsa: NAMA_WARSA[warsa],
    windu,
  };
}

function enumerateDates(startIso: string, endIso: string): string[] {
  const out: string[] = [];
  let cur = new Date(startIso + "T00:00:00Z");
  const end = new Date(endIso + "T00:00:00Z");
  while (cur <= end) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

// ================== STATUS (Bagian 14) ==================
function statusLabel(hardFilterFail: boolean, jawa23Baik: boolean, jodohBaik: boolean, adaDukunganAbu: boolean) {
  if (hardFilterFail) return "TIDAK DIREKOMENDASIKAN";
  if (jawa23Baik && jodohBaik && adaDukunganAbu) return "SANGAT DIREKOMENDASIKAN";
  if (jawa23Baik && (jodohBaik || adaDukunganAbu)) return "DIREKOMENDASIKAN";
  if (!jawa23Baik && !jodohBaik) return "PERLU DIPERTIMBANGKAN";
  return "CUKUP BAIK";
}

// ================== HANDLER ==================

Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const userId = userData.user.id;

    const db = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { calculation_result_id, tanggal_mulai, tanggal_selesai } = body as {
      calculation_result_id: string;
      tanggal_mulai: string;
      tanggal_selesai: string;
    };

    if (!calculation_result_id || !tanggal_mulai || !tanggal_selesai) {
      return new Response(
        JSON.stringify({ error: "calculation_result_id, tanggal_mulai, tanggal_selesai wajib diisi" }),
        { status: 400 },
      );
    }

    const { data: calc, error: calcErr } = await db
      .from("calculation_results")
      .select("*")
      .eq("id", calculation_result_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (calcErr || !calc) {
      return new Response(JSON.stringify({ error: "Hasil kecocokan (Fase 1) tidak ditemukan" }), { status: 404 });
    }

    const jawaNo22 = betaljemurNo22(calc.weton_a, calc.weton_b);
    const jawaNo23 = betaljemurNo23(calc.weton_a, calc.weton_b);
    const sundaRepok = calc.repok != null
      ? { remainder: calc.repok, ...SUNDA_REPOK[calc.repok] }
      : { status: "unavailable" };
    const abuJodoh = calc.abu_jodoh != null
      ? { remainder: calc.abu_jodoh, ...ABU_JODOH[calc.abu_jodoh] }
      : { status: "unavailable" };
    const hariBaikPria = hariBaikDariZodiac(calc.zodiac_a);
    const hariBaikWanita = hariBaikDariZodiac(calc.zodiac_b);
    const goodDayIntersection = abuDayIntersection(hariBaikPria, hariBaikWanita);

    const daftarTanggal = enumerateDates(tanggal_mulai, tanggal_selesai);
    const kandidat = [];

    for (const iso of daftarTanggal) {
      const hari = hariDariISO(iso);
      const jawaInfo = konversiMasehiKeJawa(iso);
      const alasan: string[] = [];
      let hardFilterFail = false;

      if (jawaInfo) {
        const bulan = jawaInfo.bulanJawaNama.toLowerCase();
        if (bulan === "sura" || bulan === "suro") {
          hardFilterFail = true;
          alasan.push("Bulan Suro/Sura — pantangan tradisi, dihindari untuk akad nikah.");
        }
      } else {
        alasan.push("Bulan Jawa tidak diketahui untuk tanggal ini — di luar rentang Kurup Asapon yang didukung.");
      }

      const dayIntersectionMatch = goodDayIntersection.includes(hari);
      if (dayIntersectionMatch) {
        alasan.push(`Hari ${hari} termasuk interseksi hari baik Abu Ma'syar.`);
      }

      const status = statusLabel(
        hardFilterFail,
        jawaNo23.status === "baik",
        (abuJodoh as any).baik === true,
        dayIntersectionMatch,
      );

      kandidat.push({
        date: iso,
        weekday: hari,
        javanese_date: jawaInfo ?? null,
        hard_filter: hardFilterFail ? "FAIL" : "PASS",
        abu_day_intersection_match: dayIntersectionMatch,
        status,
        reasons: alasan,
      });
    }

    kandidat.sort((a, b) => {
      const fa = a.hard_filter === "PASS" ? 0 : 1;
      const fb = b.hard_filter === "PASS" ? 0 : 1;
      if (fa !== fb) return fa - fb;
      const ia = a.abu_day_intersection_match ? 0 : 1;
      const ib = b.abu_day_intersection_match ? 0 : 1;
      if (ia !== ib) return ia - ib;
      return a.date.localeCompare(b.date);
    });

    const rowsToInsert = kandidat.map((k) => ({
      calculation_result_id,
      user_id: userId,
      date: k.date,
      javanese_date: k.javanese_date,
      weekday: k.weekday,
      filters: { hard_filter: k.hard_filter },
      scores: { abu_day_intersection_match: k.abu_day_intersection_match },
      status: k.status,
      reasons: k.reasons,
    }));

    const { error: insertErr } = await db.from("wedding_candidates").insert(rowsToInsert);
    if (insertErr) {
      return new Response(
        JSON.stringify({ warning: "Gagal menyimpan ke wedding_candidates", detail: insertErr.message, kandidat }),
        { status: 207 },
      );
    }

    return new Response(
      JSON.stringify({
        couple: {
          jawa_no22: jawaNo22,
          jawa_no23: jawaNo23,
          sunda_repok: sundaRepok,
          abu_jodoh: abuJodoh,
          good_day_intersection: goodDayIntersection,
        },
        candidates: kandidat,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
