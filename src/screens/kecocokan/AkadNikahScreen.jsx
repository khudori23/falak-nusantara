import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import ScreenHeader from './ScreenHeader';
import DateField from './DateField';
import PractitionerNote from './PractitionerNote';
import SumberDetail from './SumberDetail';

import { evaluateAkadDate } from '../../lib/engines/akadNikah';
import { colors, spacing } from './theme';

function toISODate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}

function formatTanggal(value) {
  if (!value) return '-';

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function statusColor(status) {
  switch (status) {
    case 'SANGAT DIREKOMENDASIKAN':
      return colors.abu.icon;

    case 'DIREKOMENDASIKAN':
      return colors.abu.icon;

    case 'CUKUP BAIK':
      return colors.abu.icon;

    case 'TIDAK DIREKOMENDASIKAN':
      return '#B3261E';

    default:
      return '#8A6D1D';
  }
}

function statusDescription(status) {
  switch (status) {
    case 'SANGAT DIREKOMENDASIKAN':
      return 'Hasil evaluasi gabungan menunjukkan tanggal ini termasuk kandidat teratas.';

    case 'DIREKOMENDASIKAN':
      return 'Tanggal ini memiliki beberapa evidence positif dan berada dalam rekomendasi aplikasi.';

    case 'CUKUP BAIK':
      return 'Tanggal memiliki sebagian evidence positif, tetapi masih perlu dipertimbangkan.';

    case 'TIDAK DIREKOMENDASIKAN':
      return 'Tanggal terkena aturan larangan yang diperlakukan sebagai hard filter.';

    default:
      return 'Tanggal belum memiliki cukup evidence positif untuk menjadi rekomendasi utama.';
  }
}

function getJawa(candidate) {
  const jawa = candidate?.calendar?.javanese;

  if (!jawa) return '';

  return [
    jawa.tanggal != null ? `Tanggal Jawa ${jawa.tanggal}` : null,
    jawa.bulanJawa || null,
    jawa.tahun != null ? `tahun ${jawa.tahun}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

function EvidenceRow({ title, children }) {
  return (
    <View style={styles.evidenceRow}>
      <Text style={styles.evidenceTitle}>{title}</Text>
      <Text style={styles.evidenceValue}>{children}</Text>
    </View>
  );
}

function CandidateCard({ candidate, index }) {
  const status =
    candidate?.application_status || 'PERLU DIPERTIMBANGKAN';

  const reasons = Array.isArray(candidate?.reasons)
    ? candidate.reasons
    : [];

  const jawa = getJawa(candidate);

  const blocked = candidate?.hardFilters?.blocked === true;

  return (
    <View
      style={[
        styles.candidateCard,
        index === 0 && styles.topCandidateCard,
      ]}
    >
      <View style={styles.rankRow}>
        <Text style={styles.rank}>#{index + 1}</Text>

        <Text
          style={[
            styles.candidateStatus,
            { color: statusColor(status) },
          ]}
        >
          {status}
        </Text>
      </View>

      <Text style={styles.candidateDate}>
        {formatTanggal(candidate?.candidate_date)}
      </Text>

      <Text style={styles.candidateMeta}>
        {candidate?.calendar?.weekday || '-'}
        {candidate?.calendar?.pasaran
          ? ` · ${candidate.calendar.pasaran}`
          : ''}
      </Text>

      {jawa ? (
        <Text style={styles.jawaText}>{jawa}</Text>
      ) : null}

      {blocked ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠ Tanggal terkena hard filter sumber.
          </Text>
        </View>
      ) : null}

      {reasons.length > 0 ? (
        <View style={styles.reasonBox}>
          <Text style={styles.reasonTitle}>Evidence / alasan</Text>

          {reasons.map((reason, reasonIndex) => (
            <Text
              key={`${index}-${reasonIndex}`}
              style={styles.reasonText}
            >
              • {reason}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function AkadNikahScreen({ onBack }) {
  const [namaPria, setNamaPria] = useState('');
  const [namaAyahPria, setNamaAyahPria] = useState('');
  const [namaIbuPria, setNamaIbuPria] = useState('');
  const [tglPria, setTglPria] = useState(null);

  const [namaWanita, setNamaWanita] = useState('');
  const [namaAyahWanita, setNamaAyahWanita] = useState('');
  const [namaIbuWanita, setNamaIbuWanita] = useState('');
  const [tglWanita, setTglWanita] = useState(null);

  const [plannedAkadDate, setPlannedAkadDate] = useState(null);
  const [plannedAkadTime, setPlannedAkadTime] = useState('');

  const [tanggalMulai, setTanggalMulai] = useState(null);
  const [tanggalSelesai, setTanggalSelesai] = useState(null);

  const [hasil, setHasil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const minDate = new Date();

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const validForm =
    namaPria.trim() &&
    namaIbuPria.trim() &&
    tglPria &&
    namaWanita.trim() &&
    namaIbuWanita.trim() &&
    tglWanita &&
    plannedAkadDate &&
    !loading;

  async function evaluasiTanggal() {
    setError('');
    setHasil(null);
    setLoading(true);

    try {
      const mulai =
        tanggalMulai ||
        plannedAkadDate;

      const selesai =
        tanggalSelesai ||
        (() => {
          const d = new Date(plannedAkadDate);
          d.setDate(d.getDate() + 60);
          return d;
        })();

      const result = await evaluateAkadDate({
        namaPria,
        namaAyahPria,
        namaIbuPria,
        tglPria,

        namaWanita,
        namaAyahWanita,
        namaIbuWanita,
        tglWanita,

        plannedAkadDate,
        plannedAkadTime,

        tanggalMulai: mulai,
        tanggalSelesai: selesai,
      });

      setHasil(result);
    } catch (e) {
      console.error('Evaluasi tanggal akad:', e);

      setError(
        e?.message ||
          'Gagal mengevaluasi tanggal akad. Periksa koneksi lalu coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  }

  const planned = hasil?.plannedDate;
  const recommendations = Array.isArray(hasil?.recommendations)
    ? hasil.recommendations
    : [];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
      }}
    >
      <ScreenHeader
        title="Akad Nikah"
        onBack={onBack}
        palette={colors.abu}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xl * 2,
        }}
      >
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>
            Evaluasi Tanggal Akad
          </Text>

          <Text style={styles.introText}>
            Masukkan data calon pengantin dan tanggal akad yang
            direncanakan. Sistem akan mengevaluasi tanggal tersebut
            berdasarkan evidence tradisional Jawa, Sunda, dan Abu
            Ma'syar yang tersedia.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Data Pria</Text>

        <Text style={styles.label}>Nama lengkap pria</Text>
        <TextInput
          style={styles.input}
          value={namaPria}
          onChangeText={setNamaPria}
          placeholder="Nama lengkap pria"
        />

        <Text style={styles.label}>Nama ayah pria</Text>
        <TextInput
          style={styles.input}
          value={namaAyahPria}
          onChangeText={setNamaAyahPria}
          placeholder="Nama ayah pria"
        />

        <Text style={styles.label}>Nama ibu kandung pria</Text>
        <TextInput
          style={styles.input}
          value={namaIbuPria}
          onChangeText={setNamaIbuPria}
          placeholder="Nama ibu pria"
        />

        <DateField
          label="Tanggal lahir pria"
          value={tglPria}
          onChange={setTglPria}
          maximumDate={new Date()}
          placeholder="Pilih tanggal lahir"
        />

        <Text style={styles.sectionTitle}>Data Wanita</Text>

        <Text style={styles.label}>Nama lengkap wanita</Text>
        <TextInput
          style={styles.input}
          value={namaWanita}
          onChangeText={setNamaWanita}
          placeholder="Nama lengkap wanita"
        />

        <Text style={styles.label}>Nama ayah wanita</Text>
        <TextInput
          style={styles.input}
          value={namaAyahWanita}
          onChangeText={setNamaAyahWanita}
          placeholder="Nama ayah wanita"
        />

        <Text style={styles.label}>Nama ibu kandung wanita</Text>
        <TextInput
          style={styles.input}
          value={namaIbuWanita}
          onChangeText={setNamaIbuWanita}
          placeholder="Nama ibu wanita"
        />

        <DateField
          label="Tanggal lahir wanita"
          value={tglWanita}
          onChange={setTglWanita}
          maximumDate={new Date()}
          placeholder="Pilih tanggal lahir"
        />

        <View style={styles.plannedCard}>
          <Text style={styles.sectionTitle}>
            Rencana Akad
          </Text>

          <DateField
            label="Tanggal rencana akad *"
            value={plannedAkadDate}
            onChange={(date) => {
              setPlannedAkadDate(date);

              if (!tanggalMulai || tanggalMulai < date) {
                setTanggalMulai(date);
              }

              if (!tanggalSelesai || tanggalSelesai < date) {
                const end = new Date(date);
                end.setDate(end.getDate() + 60);
                setTanggalSelesai(end);
              }

              setHasil(null);
              setError('');
            }}
            minimumDate={minDate}
            maximumDate={maxDate}
            placeholder="Pilih tanggal akad"
          />

          <Text style={styles.label}>
            Waktu akad (opsional)
          </Text>

          <TextInput
            style={styles.input}
            value={plannedAkadTime}
            onChangeText={setPlannedAkadTime}
            placeholder="Contoh: 08:30"
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />

          <Text style={styles.helperText}>
            Format waktu: HH:mm. Evaluasi waktu belum
            mengaktifkan matriks Betaljemur No.35 karena
            transkripsinya belum terverifikasi penuh.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Rentang Pencarian Alternatif
        </Text>

        <Text style={styles.helperText}>
          Sistem akan membandingkan tanggal rencana dengan
          kandidat lain. Jika dikosongkan, pencarian otomatis
          menggunakan tanggal rencana sampai 60 hari setelahnya.
        </Text>

        <DateField
          label="Mulai pencarian"
          value={tanggalMulai}
          onChange={(date) => {
            setTanggalMulai(date);
            setHasil(null);
            setError('');
          }}
          minimumDate={minDate}
          maximumDate={maxDate}
          placeholder="Gunakan tanggal rencana"
        />

        <DateField
          label="Selesai pencarian"
          value={tanggalSelesai}
          onChange={(date) => {
            setTanggalSelesai(date);
            setHasil(null);
            setError('');
          }}
          minimumDate={tanggalMulai || minDate}
          maximumDate={maxDate}
          placeholder="60 hari setelah tanggal rencana"
        />

        <Pressable
          disabled={!validForm}
          onPress={evaluasiTanggal}
          style={[
            styles.btn,
            {
              opacity: validForm ? 1 : 0.5,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>
              Evaluasi Tanggal Akad
            </Text>
          )}
        </Pressable>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        {hasil ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultHeader}>
              HASIL EVALUASI
            </Text>

            <View style={styles.plannedResult}>
              <Text style={styles.plannedLabel}>
                TANGGAL YANG ANDA RENCANAKAN
              </Text>

              <Text style={styles.plannedDate}>
                {formatTanggal(
                  planned?.candidate_date ||
                    hasil.inputs?.plannedAkadDate
                )}
              </Text>

              {planned?.calendar ? (
                <Text style={styles.plannedMeta}>
                  {planned.calendar.weekday} ·{' '}
                  {planned.calendar.pasaran}
                </Text>
              ) : null}

              {planned ? (
                <Text
                  style={[
                    styles.plannedStatus,
                    {
                      color: statusColor(
                        planned.application_status
                      ),
                    },
                  ]}
                >
                  {planned.application_status}
                </Text>
              ) : (
                <Text style={styles.plannedStatus}>
                  Tidak ditemukan dalam rentang kandidat
                </Text>
              )}

              <Text style={styles.statusDescription}>
                {statusDescription(
                  planned?.application_status
                )}
              </Text>
            </View>

            {planned?.hardFilters?.blocked ? (
              <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>
                  ⚠ PERLU PERHATIAN
                </Text>

                <Text style={styles.warningText}>
                  Tanggal rencana terkena aturan yang diperlakukan
                  sebagai hard filter oleh mesin.
                </Text>
              </View>
            ) : (
              <View style={styles.goodBox}>
                <Text style={styles.goodTitle}>
                  ✓ TIDAK TERKENA HARD FILTER
                </Text>

                <Text style={styles.goodText}>
                  Tidak ditemukan aturan hard filter yang
                  menggugurkan tanggal rencana berdasarkan data
                  sumber yang aktif.
                </Text>
              </View>
            )}

            <View style={styles.evidenceCard}>
              <Text style={styles.evidenceHeader}>
                EVIDENCE TANGGAL
              </Text>

              {planned?.calendar ? (
                <>
                  <EvidenceRow title="Hari">
                    {planned.calendar.weekday || '-'}
                  </EvidenceRow>

                  <EvidenceRow title="Pasaran">
                    {planned.calendar.pasaran || '-'}
                  </EvidenceRow>

                  <EvidenceRow title="Neptu tanggal">
                    {planned.calendar.neptu ?? '-'}
                  </EvidenceRow>

                  <EvidenceRow title="Tanggal Jawa">
                    {getJawa(planned) || '-'}
                  </EvidenceRow>
                </>
              ) : null}

              <EvidenceRow title="Betaljemur No.23">
                {planned?.jawa?.no23_label || '-'}
                {planned?.jawa?.no23_quality
                  ? ` · ${planned.jawa.no23_quality}`
                  : ''}
              </EvidenceRow>

              <EvidenceRow title="Sunda">
                {planned?.sunda?.label || 'Tidak tersedia'}
                {planned?.sunda?.confidence
                  ? ` · ${planned.sunda.confidence}`
                  : ''}
              </EvidenceRow>

              <EvidenceRow title="Abu Ma'syar">
                {planned?.abu?.day_match
                  ? 'Hari masuk irisan hari baik kedua buruj'
                  : 'Tidak masuk irisan hari baik kedua buruj'}
              </EvidenceRow>
            </View>

            <PractitionerNote>
              Hasil ini merupakan evaluasi berdasarkan pakem dan
              tabel tradisional yang tersedia di sistem. Ranking
              adalah lapisan aplikasi untuk mengurutkan kandidat,
              bukan formula kitab baru dan bukan jaminan ilmiah
              mengenai keberhasilan pernikahan.
            </PractitionerNote>

            <SumberDetail>
              Mesin menggunakan evidence Jawa/Betaljemur, Sunda
              varian buhun-5 sebagai evidence sekunder, dan Abu
              Ma'syar. Aturan yang belum memiliki transkripsi
              sumber cukup terverifikasi tidak digunakan sebagai
              hard filter.
            </SumberDetail>

            <View style={styles.divider} />

            <Text style={styles.recommendationHeader}>
              REKOMENDASI TANGGAL
            </Text>

            <Text style={styles.recommendationDescription}>
              Kandidat di bawah diurutkan secara deterministik.
              Tanggal yang lebih tinggi bukan berarti “jaminan
              lebih berkah”, tetapi memiliki prioritas lebih tinggi
              berdasarkan evidence dan aturan ranking aplikasi.
            </Text>

            {recommendations.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>
                  Tidak ada kandidat
                </Text>

                <Text style={styles.emptyText}>
                  Tidak ditemukan tanggal dalam rentang yang
                  diberikan.
                </Text>
              </View>
            ) : (
              recommendations.map((candidate, index) => (
                <CandidateCard
                  key={
                    candidate.id ||
                    `${candidate.candidate_date}-${index}`
                  }
                  candidate={candidate}
                  index={index}
                />
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  introCard: {
    backgroundColor: colors.abu.bg,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  introTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.cardText,
    marginBottom: 7,
  },

  introText: {
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.cardSubtext,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.cardText,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },

  label: {
    fontSize: 13,
    color: colors.cardSubtext,
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.md,
    color: colors.cardText,
  },

  plannedCard: {
    backgroundColor: colors.abu.bg,
    borderRadius: 18,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },

  helperText: {
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.cardSubtext,
    marginBottom: spacing.md,
  },

  btn: {
    backgroundColor: colors.abu.icon,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },

  error: {
    color: '#B3261E',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  resultContainer: {
    marginTop: spacing.sm,
  },

  resultHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.abu.icon,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  plannedResult: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    marginBottom: spacing.md,
  },

  plannedLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.cardSubtext,
    textAlign: 'center',
  },

  plannedDate: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.cardText,
    textAlign: 'center',
    marginTop: 7,
  },

  plannedMeta: {
    fontSize: 13,
    color: colors.cardSubtext,
    textAlign: 'center',
    marginTop: 4,
  },

  plannedStatus: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 10,
  },

  statusDescription: {
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.cardSubtext,
    textAlign: 'center',
    marginTop: 7,
  },

  goodBox: {
    backgroundColor: '#EAF7EE',
    borderRadius: 13,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  goodTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#176B36',
    marginBottom: 4,
  },

  goodText: {
    fontSize: 11.5,
    lineHeight: 17,
    color: '#31533D',
  },

  warningBox: {
    backgroundColor: '#FFF3F0',
    borderRadius: 13,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  warningTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B3261E',
    marginBottom: 4,
  },

  warningText: {
    fontSize: 11.5,
    lineHeight: 17,
    color: '#70413B',
  },

  evidenceCard: {
    backgroundColor: colors.abu.bg,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  evidenceHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.abu.icon,
    marginBottom: spacing.sm,
  },

  evidenceRow: {
    marginBottom: 10,
  },

  evidenceTitle: {
    fontSize: 10.5,
    color: colors.cardSubtext,
    marginBottom: 2,
  },

  evidenceValue: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.cardText,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.10)',
    marginVertical: spacing.lg,
  },

  recommendationHeader: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.abu.icon,
    textAlign: 'center',
    marginBottom: 7,
  },

  recommendationDescription: {
    fontSize: 11.5,
    lineHeight: 18,
    color: colors.cardSubtext,
    marginBottom: spacing.md,
  },

  candidateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },

  topCandidateCard: {
    borderWidth: 2,
    borderColor: colors.abu.icon,
  },

  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  rank: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.abu.icon,
  },

  candidateStatus: {
    fontSize: 10.5,
    fontWeight: '900',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 10,
  },

  candidateDate: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.cardText,
    marginBottom: 3,
  },

  candidateMeta: {
    fontSize: 12.5,
    color: colors.cardSubtext,
  },

  jawaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.abu.icon,
    marginTop: 5,
  },

  reasonBox: {
    backgroundColor: colors.abu.bg,
    borderRadius: 11,
    padding: 10,
    marginTop: 10,
  },

  reasonTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: colors.cardText,
    marginBottom: 4,
  },

  reasonText: {
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.cardSubtext,
    marginBottom: 2,
  },

  emptyBox: {
    backgroundColor: colors.abu.bg,
    borderRadius: 13,
    padding: spacing.md,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.cardText,
    marginBottom: 4,
  },

  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.cardSubtext,
  },
});
