import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing } from './theme';

export default function DateField({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  placeholder = 'Pilih tanggal',
}) {
  const [show, setShow] = useState(false);

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        style={styles.input}
        onPress={() => setShow(true)}
      >
        <Text style={{ color: colors.cardText }}>
          {value
            ? value.toLocaleDateString('id-ID')
            : placeholder}
        </Text>
      </Pressable>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(_, selectedDate) => {
            if (Platform.OS !== 'ios') {
              setShow(false);
            }

            if (selectedDate) {
              onChange(selectedDate);
            }
          }}
          onDismiss={() => {
            setShow(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
});
