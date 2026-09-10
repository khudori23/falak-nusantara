jest.mock('../src/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));
jest.mock('../src/lib/weton', () => ({
  hitungWeton: jest.fn(),
}));

import { supabase } from '../src/lib/supabase';
import { hitungWeton } from '../src/lib/weton';
import {
  hitungPancasuda,
  hitungKualitasHari,
  getActivityTypes,
  simpanHasilHitungan,
} from '../src/lib/hitunganHari';

let dayQualityRulesData;
let activityTypesData;
let activityTypesError;
let insertedRun;
let insertError;

function makeRulesBuilder() {
  let methodCode;
  const builder = {
    select: jest.fn(() => builder),
    eq: jest.fn((col, val) => {
      if (col === 'traditional_methods.code') methodCode = val;
      return builder;
    }),
    then: (resolve, reject) =>
      Promise.resolve({ data: dayQualityRulesData[methodCode] || [], error: null }).then(
        resolve,
        reject
      ),
  };
  return builder;
}

function makeActivityTypesBuilder() {
  const builder = {
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    order: jest.fn(() => builder),
    then: (resolve, reject) =>
      Promise.resolve({ data: activityTypesData, error: activityTypesError || null }).then(
        resolve,
        reject
      ),
  };
  return builder;
}

function makeInsertBuilder() {
  const builder = {
    insert: jest.fn(() => builder),
    select: jest.fn(() => builder),
    single: jest.fn(() => builder),
    then: (resolve, reject) =>
      Promise.resolve(
        insertError ? { data: null, error: insertError } : { data: insertedRun, error: null }
      ).then(resolve, reject),
  };
  return builder;
}

beforeEach(() => {
  jest.clearAllMocks();
  dayQualityRulesData = {};
  activityTypesData = [];
  activityTypesError = null;
  insertedRun = { id: 'run-1' };
  insertError = null;

  supabase.from.mockImplementation((table) => {
    if (table === 'day_quality_rules') return makeRulesBuilder();
    if (table === 'activity_types') return makeActivityTypesBuilder();
    if (table === 'day_calculation_runs') return makeInsertBuilder();
    throw new Error(`Tabel tidak di-mock: ${table}`);
  });

  hitungWeton.mockReturnValue({
    hari: 'Senin',
    pasaran: 'Legi',
    neptuHari: 4,
    neptuPasaran: 5,
    totalNeptu: 9,
  });
});

describe('hitungPancasuda', () => {
  test('menghitung pancasudaSisa dari sisa bagi 5 total neptu', () => {
    const hasil = hitungPancasuda(new Date(2026, 0, 5));
    expect(hasil.totalNeptu).toBe(9);
    expect(hasil.pancasudaSisa).toBe(4); // 9 % 5
  });

  test('meneruskan field weton apa adanya', () => {
    const hasil = hitungPancasuda(new Date(2026, 0, 5));
    expect(hasil.hari).toBe('Senin');
    expect(hasil.pasaran).toBe('Legi');
  });

  test('memformat dateISO pakai tanggal lokal dengan zero-padding', () => {
    const hasil = hitungPancasuda(new Date(2026, 0, 5)); // 5 Jan 2026
    expect(hasil.dateISO).toBe('2026-01-05');
  });

  test('dateISO konsisten untuk tanggal 2 digit', () => {
    const hasil = hitungPancasuda(new Date(2026, 8, 9)); // 9 Sep 2026
    expect(hasil.dateISO).toBe('2026-09-09');
  });
});

describe('getActivityTypes', () => {
  test('mengembalikan data saat sukses', async () => {
    activityTypesData = [{ id: 1, code: 'usaha', title: 'Usaha' }];
    const hasil = await getActivityTypes();
    expect(hasil).toEqual(activityTypesData);
  });

  test('melempar error saat supabase mengembalikan error', async () => {
    activityTypesData = null;
    activityTypesError = { message: 'boom' };
    await expect(getActivityTypes()).rejects.toEqual({ message: 'boom' });
  });
});

describe('hitungKualitasHari — Synthesis Engine', () => {
  const activityCode = 'usaha';

  test('found:false kalau tidak ada aturan cocok di kedua metode', async () => {
    dayQualityRulesData = { adat_jawa: [], abu_masyar_hitungan_hari: [] };
    const hasil = await hitungKualitasHari(new Date(2026, 0, 5), activityCode);

    expect(hasil.found).toBe(false);
    expect(hasil.kesimpulan).toBeNull();
    expect(hasil.hasilPerMetode).toHaveLength(2);
    hasil.hasilPerMetode.forEach((h) => {
      expect(h.found).toBe(false);
      expect(Array.isArray(h.calculationSteps)).toBe(true);
    });
  });

  test('kalau cuma satu metode ketemu, kesimpulan pakai rating metode itu', async () => {
    dayQualityRulesData = {
      adat_jawa: [
        {
          rule_key: 'jawa_sri',
          quality_rating: 'baik',
          explanation: 'Rejeki lancar',
          notes: null,
          criteria_json: { pancasuda_sisa: 4, nama: 'Sri' },
          activity_types: { id: 1, code: activityCode, title: 'Usaha' },
          traditional_methods: { id: 1, code: 'adat_jawa', title: 'Adat Jawa (Pancasuda)' },
        },
      ],
      abu_masyar_hitungan_hari: [],
    };

    const hasil = await hitungKualitasHari(new Date(2026, 0, 5), activityCode);

    expect(hasil.found).toBe(true);
    expect(hasil.kesimpulan.quality_rating).toBe('baik');
    expect(hasil.kesimpulan.semuaSepakat).toBe(true);
    expect(hasil.kesimpulan.adaPantang).toBe(false);
    expect(hasil.kesimpulan.jumlahMetodeDitemukan).toBe(1);
  });

  test('sepakat: kedua metode kasih rating sama -> diteruskan', async () => {
    const testDate = new Date(2026, 0, 5);
    const dow = testDate.getDay();

    dayQualityRulesData = {
      adat_jawa: [
        {
          rule_key: 'jawa_sri',
          quality_rating: 'baik',
          explanation: 'exp adat',
          notes: null,
          criteria_json: { pancasuda_sisa: 4, nama: 'Sri' },
          activity_types: { id: 1, code: activityCode, title: 'Usaha' },
          traditional_methods: { id: 1, code: 'adat_jawa', title: 'Adat Jawa (Pancasuda)' },
        },
      ],
      abu_masyar_hitungan_hari: [
        {
          rule_key: 'abu_x',
          quality_rating: 'baik',
          explanation: 'exp abu',
          notes: null,
          criteria_json: { day_of_week: dow, day_name: 'Senin', planet: 'Bulan' },
          activity_types: { id: 1, code: activityCode, title: 'Usaha' },
          traditional_methods: { id: 2, code: 'abu_masyar_hitungan_hari', title: "Abu Ma'syar (Planet Hari)" },
        },
      ],
    };

    const hasil = await hitungKualitasHari(testDate, activityCode);

    expect(hasil.kesimpulan.quality_rating).toBe('baik');
    expect(hasil.kesimpulan.semuaSepakat).toBe(true);
    expect(hasil.kesimpulan.adaPantang).toBe(false);
    expect(hasil.kesimpulan.jumlahMetodeDitemukan).toBe(2);
  });

  test('konflik dengan pantang -> pantang menang', async () => {
    const testDate = new Date(2026, 0, 5);
    const dow = testDate.getDay();

    dayQualityRulesData = {
      adat_jawa: [
        {
          rule_key: 'jawa_pati',
          quality_rating: 'pantang',
          explanation: 'exp adat',
          notes: null,
          criteria_json: { pancasuda_sisa: 4, nama: 'Pati' },
          activity_types: { id: 1, code: activityCode, title: 'Usaha' },
          traditional_methods: { id: 1, code: 'adat_jawa', title: 'Adat Jawa (Pancasuda)' },
        },
      ],
      abu_masyar_hitungan_hari: [
        {
          rule_key: 'abu_x',
          quality_rating: 'baik',
          explanation: 'exp abu',
          notes: null,
          criteria_json: { day_of_week: dow, day_name: 'Senin', planet: 'Bulan' },
          activity_types: { id: 1, code: activityCode, title: 'Usaha' },
          traditional_methods: { id: 2, code: 'abu_masyar_hitungan_hari', title: "Abu Ma'syar (Planet Hari)" },
        },
      ],
    };

    const hasil = await hitungKualitasHari(testDate, activityCode);

    expect(hasil.kesimpulan.quality_rating).toBe('pantang');
    expect(hasil.kesimpulan.semuaSepakat).toBe(false);
    expect(hasil.kesimpulan.adaPantang).toBe(true);
  });

  test('konflik tanpa pantang -> campuran', async () => {
    const testDate = new Date(2026, 0, 5);
    const dow = testDate.getDay();

    dayQualityRulesData = {
      adat_jawa: [
        {
          rule_key: 'jawa_lungguh',
          quality_rating: 'netral',
          explanation: 'exp adat',
          notes: null,
          criteria_json: { pancasuda_sisa: 4, nama: 'Lungguh' },
          activity_types: { id: 1, code: activityCode, title: 'Usaha' },
          traditional_methods: { id: 1, code: 'adat_jawa', title: 'Adat Jawa (Pancasuda)' },
        },
      ],
      abu_masyar_hitungan_hari: [
        {
          rule_key: 'abu_y',
          quality_rating: 'baik',
          explanation: 'exp abu',
          notes: null,
          criteria_json: { day_of_week: dow, day_name: 'Senin', planet: 'Bulan' },
          activity_types: { id: 1, code: activityCode, title: 'Usaha' },
          traditional_methods: { id: 2, code: 'abu_masyar_hitungan_hari', title: "Abu Ma'syar (Planet Hari)" },
        },
      ],
    };

    const hasil = await hitungKualitasHari(testDate, activityCode);

    expect(hasil.kesimpulan.quality_rating).toBe('campuran');
    expect(hasil.kesimpulan.semuaSepakat).toBe(false);
    expect(hasil.kesimpulan.adaPantang).toBe(false);
  });

  test('calculationSteps adat jawa berisi trace neptu -> pancasuda', async () => {
    dayQualityRulesData = {
      adat_jawa: [
        {
          rule_key: 'jawa_sri',
          quality_rating: 'baik',
          explanation: 'exp',
          notes: null,
          criteria_json: { pancasuda_sisa: 4, nama: 'Sri' },
          activity_types: { id: 1, code: activityCode, title: 'Usaha' },
          traditional_methods: { id: 1, code: 'adat_jawa', title: 'Adat Jawa (Pancasuda)' },
        },
      ],
      abu_masyar_hitungan_hari: [],
    };

    const hasil = await hitungKualitasHari(new Date(2026, 0, 5), activityCode);
    const adatJawa = hasil.hasilPerMetode.find((h) => h.methodCode === 'adat_jawa');

    const labels = adatJawa.calculationSteps.map((s) => s.label);
    expect(labels).toEqual(
      expect.arrayContaining([
        'Hari & Pasaran',
        'Neptu Hari',
        'Neptu Pasaran',
        'Total Neptu',
        'Pancasuda (sisa bagi 5)',
        'Kategori Pancasuda',
      ])
    );
    const kategoriStep = adatJawa.calculationSteps.find((s) => s.label === 'Kategori Pancasuda');
    expect(kategoriStep.detail).toBe('Sri');
  });

  test('calculationSteps abu masyar berisi trace hari -> planet', async () => {
    const testDate = new Date(2026, 0, 5);
    const dow = testDate.getDay();

    dayQualityRulesData = {
      adat_jawa: [],
      abu_masyar_hitungan_hari: [
        {
          rule_key: 'abu_x',
          quality_rating: 'baik',
          explanation: 'exp',
          notes: null,
          criteria_json: { day_of_week: dow, day_name: 'Senin', planet: 'Bulan' },
          activity_types: { id: 1, code: activityCode, title: 'Usaha' },
          traditional_methods: { id: 2, code: 'abu_masyar_hitungan_hari', title: "Abu Ma'syar (Planet Hari)" },
        },
      ],
    };

    const hasil = await hitungKualitasHari(testDate, activityCode);
    const abuMasyar = hasil.hasilPerMetode.find((h) => h.methodCode === 'abu_masyar_hitungan_hari');

    const planetStep = abuMasyar.calculationSteps.find(
      (s) => s.label === 'Nama Hari & Planet Penguasa'
    );
    expect(planetStep.detail).toBe('Senin → dikuasai Bulan');
  });
});

describe('simpanHasilHitungan', () => {
  test('mengembalikan null tanpa memanggil supabase kalau result.found false', async () => {
    const hasil = await simpanHasilHitungan({ found: false });
    expect(hasil).toBeNull();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  test('menyimpan hasil ke day_calculation_runs saat found true', async () => {
    const result = {
      found: true,
      pancasuda: { hari: 'Senin', pasaran: 'Legi', dateISO: '2026-01-05' },
      kesimpulan: { quality_rating: 'baik' },
      hasilPerMetode: [
        {
          found: true,
          methodCode: 'adat_jawa',
          quality_rating: 'baik',
          rule_key: 'jawa_sri',
          activityType: { id: 1 },
          method: { id: 1 },
        },
        { found: false, methodCode: 'abu_masyar_hitungan_hari' },
      ],
    };

    const hasil = await simpanHasilHitungan(result, { userId: 'user-1' });

    expect(supabase.from).toHaveBeenCalledWith('day_calculation_runs');
    expect(hasil).toEqual(insertedRun);
  });

  test('melempar error kalau insert gagal', async () => {
    insertError = { message: 'insert gagal' };
    const result = {
      found: true,
      pancasuda: { hari: 'Senin', pasaran: 'Legi', dateISO: '2026-01-05' },
      kesimpulan: { quality_rating: 'baik' },
      hasilPerMetode: [
        {
          found: true,
          methodCode: 'adat_jawa',
          quality_rating: 'baik',
          rule_key: 'jawa_sri',
          activityType: { id: 1 },
          method: { id: 1 },
        },
      ],
    };

    await expect(simpanHasilHitungan(result)).rejects.toEqual({ message: 'insert gagal' });
  });
});
