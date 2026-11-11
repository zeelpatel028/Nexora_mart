import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';

interface CommonDatePickerProps {
  label: string;
  value?: string;
  onChange: (dateStr: string) => void;
  required?: boolean;
}

export const CommonDatePicker: React.FC<CommonDatePickerProps> = ({
  label,
  value,
  onChange,
  required = false,
}) => {
  const { colors, brandColors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState(
    value || new Date().toISOString().split('T')[0]
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label} {required ? <Text style={{ color: brandColors.error }}>*</Text> : null}
      </Text>

      <TouchableOpacity
        style={[
          styles.field,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.fieldText, { color: value ? colors.textPrimary : colors.textMuted }]}>
          {value || 'YYYY-MM-DD'}
        </Text>
        <Text style={{ fontSize: 16 }}>📅</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <SafeAreaView style={styles.overlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{label}</Text>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Enter date in format: YYYY-MM-DD
            </Text>

            <TextInput
              style={[
                styles.dateInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              value={tempDate}
              onChangeText={setTempDate}
              placeholder="2026-12-31"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: brandColors.primary }]}
                onPress={() => {
                  onChange(tempDate);
                  setModalVisible(false);
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Set Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  field: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldText: {
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    marginBottom: 14,
  },
  dateInput: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

