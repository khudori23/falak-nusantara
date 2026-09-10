const fs = require('fs');
const path = 'src/screens/HitunganHariScreen.jsx';
let src = fs.readFileSync(path, 'utf8');

function replaceOnce(oldStr, newStr, label) {
  const count = src.split(oldStr).length - 1;
  if (count === 0) {
    console.error('TIDAK KETEMU:', label);
    process.exit(1);
  }
  if (count > 1) {
    console.error('DITEMUKAN LEBIH DARI SEKALI (ambigu):', label);
    process.exit(1);
  }
  src = src.split(oldStr).join(newStr);
  console.log('OK:', label);
}

replaceOnce(
  "import { colors } from '../theme/colors';",
  "import DateTimePicker from '@react-native-community/datetimepicker';\nimport { colors } from '../theme/colors';",
  'tambah import DateTimePicker'
);

replaceOnce(
  "const [date] = useState(new Date());",
  "const [date, setDate] = useState(new Date());\n  const [showDatePicker, setShowDatePicker] = useState(false);",
  'ubah date jadi state yang bisa diganti'
);

replaceOnce(
  "<Text style={styles.sectionLabel}>PILIH KEGIATAN</Text>",
  "<Text style={styles.sectionLabel}>TANGGAL</Text>\n" +
  "      <TouchableOpacity\n" +
  "        style={{ backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e5e5' }}\n" +
  "        onPress={() => setShowDatePicker(true)}\n" +
  "        activeOpacity={0.8}\n" +
  "      >\n" +
  "        <Text style={{ fontWeight: '600' }}>\uD83D\uDCC5  {formatTanggal(date)}</Text>\n" +
  "      </TouchableOpacity>\n" +
  "      {showDatePicker && (\n" +
  "        <DateTimePicker\n" +
  "          value={date}\n" +
  "          mode=\"date\"\n" +
  "          display=\"default\"\n" +
  "          onChange={(event, selected) => {\n" +
  "            setShowDatePicker(false);\n" +
  "            if (selected) {\n" +
  "              setDate(selected);\n" +
  "              setResult(null);\n" +
  "            }\n" +
  "          }}\n" +
  "        />\n" +
  "      )}\n\n" +
  "      <Text style={styles.sectionLabel}>PILIH KEGIATAN</Text>",
  'tambah UI date picker'
);

fs.writeFileSync(path, src);
console.log('SELESAI: semua patch diterapkan ke', path);
