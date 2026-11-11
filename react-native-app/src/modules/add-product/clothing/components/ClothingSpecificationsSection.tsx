import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { ClothingSpecifications } from '../types';
import { CommonDropdown } from '../../common/components/CommonDropdown';
import { CommonFormCard } from '../../common/components/CommonFormCard';
import {
  GENDER_OPTIONS,
  CLOTHING_TYPE_OPTIONS,
  FABRIC_OPTIONS,
  PATTERN_OPTIONS,
  FIT_OPTIONS,
  CARE_INSTRUCTION_OPTIONS,
} from '../constants';

interface ClothingSpecificationsSectionProps {
  specifications: ClothingSpecifications;
  onChange: (updated: Partial<ClothingSpecifications>) => void;
  errors?: Record<string, string>;
}

export const ClothingSpecificationsSection: React.FC<ClothingSpecificationsSectionProps> = ({
  specifications,
  onChange,
  errors = {},
}) => {
  const { colors, brandColors } = useTheme();

  return (
    <CommonFormCard
      title="Apparel Specifications"
      subtitle="Style, fabric, cut, and target gender attributes"
      icon="shirt-outline"
    >
      <View style={styles.row}>
        {/* Gender */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Gender / Target <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <CommonDropdown
            options={GENDER_OPTIONS}
            selectedValue={specifications.gender}
            onSelect={(val) => onChange({ gender: val })}
            placeholder="Select gender"
            error={errors.gender}
          />
        </View>

        {/* Clothing Type */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Apparel Type <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <CommonDropdown
            options={CLOTHING_TYPE_OPTIONS}
            selectedValue={specifications.clothingType}
            onSelect={(val) => onChange({ clothingType: val })}
            placeholder="e.g. T-Shirt, Jeans"
            error={errors.clothingType}
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Fabric */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Primary Fabric <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <CommonDropdown
            options={FABRIC_OPTIONS}
            selectedValue={specifications.fabric}
            onSelect={(val) => onChange({ fabric: val })}
            placeholder="Select fabric"
            error={errors.fabric}
          />
        </View>

        {/* Pattern */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Pattern / Print</Text>
          <CommonDropdown
            options={PATTERN_OPTIONS}
            selectedValue={specifications.pattern}
            onSelect={(val) => onChange({ pattern: val })}
            placeholder="Select pattern"
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Fit */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Fit Style</Text>
          <CommonDropdown
            options={FIT_OPTIONS}
            selectedValue={specifications.fit}
            onSelect={(val) => onChange({ fit: val })}
            placeholder="Select fit"
          />
        </View>

        {/* Care Instructions */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Care Instructions</Text>
          <CommonDropdown
            options={CARE_INSTRUCTION_OPTIONS}
            selectedValue={specifications.careInstructions}
            onSelect={(val) => onChange({ careInstructions: val })}
            placeholder="Washing instructions"
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Neck Type */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Neck / Collar Type</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. Round Neck, Polo, Mandarin"
            placeholderTextColor={colors.textMuted}
            value={specifications.neckType || ''}
            onChangeText={(val) => onChange({ neckType: val })}
          />
        </View>

        {/* Sleeve Length */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Sleeve Length</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. Half Sleeve, Full Sleeve"
            placeholderTextColor={colors.textMuted}
            value={specifications.sleeveLength || ''}
            onChangeText={(val) => onChange({ sleeveLength: val })}
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

