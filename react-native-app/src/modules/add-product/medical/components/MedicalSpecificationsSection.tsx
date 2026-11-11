import React from 'react';
import { View, Text, StyleSheet, TextInput, Switch } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { MedicalSpecifications } from '../types';
import { CommonFormCard } from '../../common/components/CommonFormCard';
import { CommonDropdown } from '../../common/components/CommonDropdown';
import {
  MEDICINE_TYPE_OPTIONS,
  DOSAGE_FORM_OPTIONS,
  SCHEDULE_TYPE_OPTIONS,
  STRENGTH_UNIT_OPTIONS,
  STORAGE_CONDITION_OPTIONS,
} from '../constants';

interface MedicalSpecificationsSectionProps {
  specifications: MedicalSpecifications;
  onChange: (updated: Partial<MedicalSpecifications>) => void;
  errors?: Record<string, string>;
}

export const MedicalSpecificationsSection: React.FC<MedicalSpecificationsSectionProps> = ({
  specifications,
  onChange,
  errors = {},
}) => {
  const { colors, brandColors } = useTheme();

  return (
    <CommonFormCard
      title="Pharmacy & Drug Details"
      subtitle="Salt composition, dosage form, schedule, and prescription requirements"
      icon="medkit-outline"
    >
      <View style={styles.row}>
        {/* Medicine Type */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Medicine Classification</Text>
          <CommonDropdown
            options={MEDICINE_TYPE_OPTIONS}
            selectedValue={specifications.medicineType}
            onSelect={(val) => onChange({ medicineType: val })}
          />
        </View>

        {/* Dosage Form */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Dosage Form <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <CommonDropdown
            options={DOSAGE_FORM_OPTIONS}
            selectedValue={specifications.dosageForm}
            onSelect={(val) => onChange({ dosageForm: val })}
            error={errors.dosageForm}
          />
        </View>
      </View>

      {/* Composition / Salt */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Generic / Salt Composition <Text style={{ color: brandColors.error }}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: errors.composition ? brandColors.error : colors.border,
              color: colors.textPrimary,
            },
          ]}
          placeholder="e.g. Paracetamol 500mg, Amoxicillin 500mg + Clavulanic Acid 125mg"
          placeholderTextColor={colors.textMuted}
          value={specifications.composition}
          onChangeText={(val) => onChange({ composition: val })}
        />
        {errors.composition ? (
          <Text style={[styles.errorText, { color: brandColors.error }]}>{errors.composition}</Text>
        ) : null}
      </View>

      <View style={styles.row}>
        {/* Strength Value */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Strength / Potency</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 500, 250/5, 10"
            placeholderTextColor={colors.textMuted}
            value={specifications.strength || ''}
            onChangeText={(val) => onChange({ strength: val })}
          />
        </View>

        {/* Strength Unit */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Strength Unit</Text>
          <CommonDropdown
            options={STRENGTH_UNIT_OPTIONS}
            selectedValue={specifications.strengthUnit}
            onSelect={(val) => onChange({ strengthUnit: val })}
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Schedule Type */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Drug Schedule</Text>
          <CommonDropdown
            options={SCHEDULE_TYPE_OPTIONS}
            selectedValue={specifications.scheduleType}
            onSelect={(val) => {
              const requiresRx = ['Schedule H', 'Schedule H1', 'Schedule X'].includes(val);
              onChange({
                scheduleType: val,
                prescriptionRequired: requiresRx ? true : specifications.prescriptionRequired,
              });
            }}
          />
        </View>

        {/* Storage Condition */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Storage Condition</Text>
          <CommonDropdown
            options={STORAGE_CONDITION_OPTIONS}
            selectedValue={specifications.storageCondition}
            onSelect={(val) => onChange({ storageCondition: val })}
          />
        </View>
      </View>

      {/* Prescription Required Switch */}
      <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
        <View style={styles.switchInfo}>
          <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>
            Prescription Required (Rx Drug)
          </Text>
          <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
            Mandatory for Schedule H, H1, and Schedule X pharmaceuticals
          </Text>
        </View>
        <Switch
          value={specifications.prescriptionRequired}
          onValueChange={(val) => onChange({ prescriptionRequired: val })}
          trackColor={{ false: colors.border, true: brandColors.primaryLight }}
          thumbColor={specifications.prescriptionRequired ? brandColors.primary : '#FFFFFF'}
        />
      </View>
    </CommonFormCard>
  );
};

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  errorText: {
    fontSize: 11,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});

