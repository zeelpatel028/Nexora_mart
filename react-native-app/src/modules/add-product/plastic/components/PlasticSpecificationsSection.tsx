import React from 'react';
import { View, Text, StyleSheet, TextInput, Switch } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { PlasticSpecifications } from '../types';
import { CommonFormCard } from '../../common/components/CommonFormCard';
import { CommonDropdown } from '../../common/components/CommonDropdown';
import {
  PLASTIC_TYPE_OPTIONS,
  MATERIAL_GRADE_OPTIONS,
  SHAPE_OPTIONS,
  CAPACITY_UNIT_OPTIONS,
} from '../constants';

interface PlasticSpecificationsSectionProps {
  specifications: PlasticSpecifications;
  onChange: (updated: Partial<PlasticSpecifications>) => void;
  errors?: Record<string, string>;
}

export const PlasticSpecificationsSection: React.FC<PlasticSpecificationsSectionProps> = ({
  specifications,
  onChange,
  errors = {},
}) => {
  const { colors, brandColors } = useTheme();

  return (
    <CommonFormCard
      title="Plastic & Polymer Specifications"
      subtitle="Polymer type, material grade, volumetric capacity, and food-grade compliance"
      icon="cube-outline"
    >
      <View style={styles.row}>
        {/* Polymer Type */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Polymer Type <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <CommonDropdown
            options={PLASTIC_TYPE_OPTIONS}
            selectedValue={specifications.plasticType}
            onSelect={(val) => onChange({ plasticType: val })}
            error={errors.plasticType}
          />
        </View>

        {/* Material Grade */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Material Grade <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <CommonDropdown
            options={MATERIAL_GRADE_OPTIONS}
            selectedValue={specifications.materialGrade}
            onSelect={(val) => onChange({ materialGrade: val })}
            error={errors.materialGrade}
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Color */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Color Finish</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. Royal Blue, Transparent, Red"
            placeholderTextColor={colors.textMuted}
            value={specifications.color || ''}
            onChangeText={(val) => onChange({ color: val })}
          />
        </View>

        {/* Shape */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Molded Shape</Text>
          <CommonDropdown
            options={SHAPE_OPTIONS}
            selectedValue={specifications.shape}
            onSelect={(val) => onChange({ shape: val })}
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Volumetric Capacity */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Volume / Capacity</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 5, 20, 500"
            placeholderTextColor={colors.textMuted}
            value={specifications.capacity || ''}
            onChangeText={(val) => onChange({ capacity: val })}
            keyboardType="numeric"
          />
        </View>

        {/* Capacity Unit */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Capacity Unit</Text>
          <CommonDropdown
            options={CAPACITY_UNIT_OPTIONS}
            selectedValue={specifications.capacityUnit}
            onSelect={(val) => onChange({ capacityUnit: val })}
          />
        </View>
      </View>

      {/* Dimensions L x W x H */}
      <Text style={[styles.subheading, { color: colors.textPrimary }]}>Physical Dimensions (cm)</Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Length (cm)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 30"
            placeholderTextColor={colors.textMuted}
            value={specifications.length || ''}
            onChangeText={(val) => onChange({ length: val })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Width (cm)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 25"
            placeholderTextColor={colors.textMuted}
            value={specifications.width || ''}
            onChangeText={(val) => onChange({ width: val })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Height (cm)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 40"
            placeholderTextColor={colors.textMuted}
            value={specifications.height || ''}
            onChangeText={(val) => onChange({ height: val })}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Wall Thickness */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Wall Thickness (mm)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 2.5 mm"
            placeholderTextColor={colors.textMuted}
            value={specifications.thickness || ''}
            onChangeText={(val) => onChange({ thickness: val })}
            keyboardType="numeric"
          />
        </View>

        {/* Product Weight */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Tare Weight (g)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 450 g"
            placeholderTextColor={colors.textMuted}
            value={specifications.weight || ''}
            onChangeText={(val) => onChange({ weight: val })}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Food Grade Compliance Switch */}
      <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
        <View style={styles.switchInfo}>
          <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Food Grade Certified (BPA Free)</Text>
          <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
            Safe for food storage, drinking water, and kitchenware use
          </Text>
        </View>
        <Switch
          value={specifications.foodGrade}
          onValueChange={(val) => onChange({ foodGrade: val })}
          trackColor={{ false: colors.border, true: brandColors.primaryLight }}
          thumbColor={specifications.foodGrade ? brandColors.primary : '#FFFFFF'}
        />
      </View>

      {/* Recyclable Switch */}
      <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
        <View style={styles.switchInfo}>
          <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>100% Recyclable Polymer</Text>
          <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
            Complies with environmental recycling standards
          </Text>
        </View>
        <Switch
          value={specifications.recyclable}
          onValueChange={(val) => onChange({ recyclable: val })}
          trackColor={{ false: colors.border, true: brandColors.primaryLight }}
          thumbColor={specifications.recyclable ? brandColors.primary : '#FFFFFF'}
        />
      </View>
    </CommonFormCard>
  );
};

const styles = StyleSheet.create({
  subheading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
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

