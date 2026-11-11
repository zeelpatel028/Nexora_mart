import React from 'react';
import { View, Text, StyleSheet, TextInput, Switch } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { FurnitureSpecifications } from '../types';
import { CommonFormCard } from '../../common/components/CommonFormCard';
import { CommonDropdown } from '../../common/components/CommonDropdown';
import {
  FURNITURE_TYPE_OPTIONS,
  MATERIAL_OPTIONS,
  FINISH_TYPE_OPTIONS,
  SEATING_CAPACITY_OPTIONS,
  UPHOLSTERY_OPTIONS,
} from '../constants';

interface FurnitureSpecificationsSectionProps {
  specifications: FurnitureSpecifications;
  onChange: (updated: Partial<FurnitureSpecifications>) => void;
  errors?: Record<string, string>;
}

export const FurnitureSpecificationsSection: React.FC<FurnitureSpecificationsSectionProps> = ({
  specifications,
  onChange,
  errors = {},
}) => {
  const { colors, brandColors } = useTheme();

  return (
    <CommonFormCard
      title="Furniture & Carpentry Specifications"
      subtitle="Wood type, finish, dimensions L×W×H, upholstery, and warranty"
      icon="business-outline"
    >
      <View style={styles.row}>
        {/* Furniture Type */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Furniture Type <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <CommonDropdown
            options={FURNITURE_TYPE_OPTIONS}
            selectedValue={specifications.furnitureType}
            onSelect={(val) => onChange({ furnitureType: val })}
            error={errors.furnitureType}
          />
        </View>

        {/* Primary Material */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Construction Material <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <CommonDropdown
            options={MATERIAL_OPTIONS}
            selectedValue={specifications.material}
            onSelect={(val) => onChange({ material: val })}
            error={errors.material}
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Finish Type */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Surface Finish</Text>
          <CommonDropdown
            options={FINISH_TYPE_OPTIONS}
            selectedValue={specifications.finishType}
            onSelect={(val) => onChange({ finishType: val })}
          />
        </View>

        {/* Seating Capacity */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Seating Capacity</Text>
          <CommonDropdown
            options={SEATING_CAPACITY_OPTIONS}
            selectedValue={specifications.seatingCapacity}
            onSelect={(val) => onChange({ seatingCapacity: val })}
            placeholder="Select seats"
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Upholstery */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Upholstery Fabric</Text>
          <CommonDropdown
            options={UPHOLSTERY_OPTIONS}
            selectedValue={specifications.upholsteryType}
            onSelect={(val) => onChange({ upholsteryType: val })}
          />
        </View>

        {/* Color Finish */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Color Shade</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. Dark Walnut, Warm Honey"
            placeholderTextColor={colors.textMuted}
            value={specifications.color || ''}
            onChangeText={(val) => onChange({ color: val })}
          />
        </View>
      </View>

      {/* Dimensions L x W x H */}
      <Text style={[styles.subheading, { color: colors.textPrimary }]}>Finished Dimensions (Inches)</Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Length (in)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 72"
            placeholderTextColor={colors.textMuted}
            value={specifications.length || ''}
            onChangeText={(val) => onChange({ length: val })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Width / Depth (in)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 36"
            placeholderTextColor={colors.textMuted}
            value={specifications.width || ''}
            onChangeText={(val) => onChange({ width: val })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Height (in)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 30"
            placeholderTextColor={colors.textMuted}
            value={specifications.height || ''}
            onChangeText={(val) => onChange({ height: val })}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Warranty Months */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Warranty Period (Months)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="36"
            placeholderTextColor={colors.textMuted}
            value={specifications.warrantyPeriod ? String(specifications.warrantyPeriod) : '36'}
            onChangeText={(val) => onChange({ warrantyPeriod: parseInt(val, 10) || 0 })}
            keyboardType="number-pad"
          />
        </View>

        {/* Product Weight */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Approx. Weight (kg)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 45 kg"
            placeholderTextColor={colors.textMuted}
            value={specifications.weight || ''}
            onChangeText={(val) => onChange({ weight: val })}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Assembly Required Switch */}
      <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
        <View style={styles.switchInfo}>
          <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Carpenter / DIY Assembly Required</Text>
          <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
            Enable if delivered knocked-down (flat-pack)
          </Text>
        </View>
        <Switch
          value={specifications.assemblyRequired}
          onValueChange={(val) => onChange({ assemblyRequired: val })}
          trackColor={{ false: colors.border, true: brandColors.primaryLight }}
          thumbColor={specifications.assemblyRequired ? brandColors.primary : '#FFFFFF'}
        />
      </View>

      {/* In-built Storage Switch */}
      <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
        <View style={styles.switchInfo}>
          <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>In-built Storage Space</Text>
          <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
            Hydraulic / drawer / box storage compartments
          </Text>
        </View>
        <Switch
          value={specifications.storageAvailable}
          onValueChange={(val) => onChange({ storageAvailable: val })}
          trackColor={{ false: colors.border, true: brandColors.primaryLight }}
          thumbColor={specifications.storageAvailable ? brandColors.primary : '#FFFFFF'}
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

