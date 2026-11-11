import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { ElectronicsSpecifications } from '../types';
import { CommonFormCard } from '../../common/components/CommonFormCard';
import { CommonDropdown } from '../../common/components/CommonDropdown';
import {
  DEVICE_TYPE_OPTIONS,
  RAM_OPTIONS,
  STORAGE_OPTIONS,
  WARRANTY_PERIOD_OPTIONS,
  WARRANTY_TYPE_OPTIONS,
} from '../constants';

interface ElectronicsSpecificationsSectionProps {
  specifications: ElectronicsSpecifications;
  onChange: (updated: Partial<ElectronicsSpecifications>) => void;
  errors?: Record<string, string>;
}

export const ElectronicsSpecificationsSection: React.FC<ElectronicsSpecificationsSectionProps> = ({
  specifications,
  onChange,
  errors = {},
}) => {
  const { colors, brandColors } = useTheme();

  return (
    <CommonFormCard
      title="Hardware & Electronics Specifications"
      subtitle="Device specs, model info, RAM/storage capacity, and warranty policy"
      icon="hardware-chip-outline"
    >
      <View style={styles.row}>
        {/* Device Type */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Device Category <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <CommonDropdown
            options={DEVICE_TYPE_OPTIONS}
            selectedValue={specifications.deviceType}
            onSelect={(val) => onChange({ deviceType: val })}
            error={errors.deviceType}
          />
        </View>

        {/* Model Number */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Model Number / Code</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.modelNumber ? brandColors.error : colors.border, color: colors.textPrimary }]}
            placeholder="e.g. SM-S928B, A3106"
            placeholderTextColor={colors.textMuted}
            value={specifications.modelNumber || ''}
            onChangeText={(val) => onChange({ modelNumber: val })}
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Model Name */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Commercial Model Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. Galaxy S24 Ultra, iPhone 15 Pro"
            placeholderTextColor={colors.textMuted}
            value={specifications.modelName || ''}
            onChangeText={(val) => onChange({ modelName: val })}
          />
        </View>

        {/* Color Finish */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Color Finish</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. Titanium Grey, Midnight Black"
            placeholderTextColor={colors.textMuted}
            value={specifications.color || ''}
            onChangeText={(val) => onChange({ color: val })}
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* RAM */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>RAM Memory</Text>
          <CommonDropdown
            options={RAM_OPTIONS}
            selectedValue={specifications.ram}
            onSelect={(val) => onChange({ ram: val })}
            placeholder="Select RAM"
          />
        </View>

        {/* Storage */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Internal Storage</Text>
          <CommonDropdown
            options={STORAGE_OPTIONS}
            selectedValue={specifications.storageCapacity}
            onSelect={(val) => onChange({ storageCapacity: val })}
            placeholder="Select Storage"
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Processor */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Processor / Chipset</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. Snapdragon 8 Gen 3, M3 Pro"
            placeholderTextColor={colors.textMuted}
            value={specifications.processor || ''}
            onChangeText={(val) => onChange({ processor: val })}
          />
        </View>

        {/* Battery */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Battery Capacity</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 5000 mAh"
            placeholderTextColor={colors.textMuted}
            value={specifications.batteryCapacity || ''}
            onChangeText={(val) => onChange({ batteryCapacity: val })}
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Warranty Period */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Warranty Period</Text>
          <CommonDropdown
            options={WARRANTY_PERIOD_OPTIONS}
            selectedValue={specifications.warrantyMonths}
            onSelect={(val) => onChange({ warrantyMonths: Number(val) })}
          />
        </View>

        {/* Warranty Type */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Warranty Service Type</Text>
          <CommonDropdown
            options={WARRANTY_TYPE_OPTIONS}
            selectedValue={specifications.warrantyType}
            onSelect={(val) => onChange({ warrantyType: val })}
          />
        </View>
      </View>
    </CommonFormCard>
  );
};

const styles = StyleSheet.create({
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
});

