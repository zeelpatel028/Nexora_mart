import React from 'react';
import { View, Text, StyleSheet, TextInput, Switch } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { GrocerySpecifications } from '../types';
import { CommonFormCard } from '../../common/components/CommonFormCard';
import { CommonDropdown } from '../../common/components/CommonDropdown';
import {
  FOOD_TYPE_OPTIONS,
  ITEM_TYPE_OPTIONS,
  PACKAGING_TYPE_OPTIONS,
  STORAGE_TYPE_OPTIONS,
} from '../constants';

interface GrocerySpecificationsSectionProps {
  specifications: GrocerySpecifications;
  onChange: (updated: Partial<GrocerySpecifications>) => void;
  errors?: Record<string, string>;
}

export const GrocerySpecificationsSection: React.FC<GrocerySpecificationsSectionProps> = ({
  specifications,
  onChange,
  errors = {},
}) => {
  const { colors, brandColors } = useTheme();

  return (
    <CommonFormCard
      title="Food & Grocery Specifications"
      subtitle="Dietary classification, packaging, FSSAI compliance, and shelf life"
      icon="basket-outline"
    >
      <View style={styles.row}>
        {/* Food Category / Item Type */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Grocery Item Type</Text>
          <CommonDropdown
            options={ITEM_TYPE_OPTIONS}
            selectedValue={specifications.itemType}
            onSelect={(val) => onChange({ itemType: val })}
          />
        </View>

        {/* Dietary / Food Type */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Dietary Classification</Text>
          <CommonDropdown
            options={FOOD_TYPE_OPTIONS}
            selectedValue={specifications.foodType}
            onSelect={(val) => {
              const isVeg = val === 'Vegetarian' || val === 'Vegan';
              onChange({ foodType: val, isVegetarian: isVeg });
            }}
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Packaging Type */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Packaging Type <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <CommonDropdown
            options={PACKAGING_TYPE_OPTIONS}
            selectedValue={specifications.packagingType}
            onSelect={(val) => onChange({ packagingType: val })}
            error={errors.packagingType}
          />
        </View>

        {/* Storage Recommendation */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Storage Condition</Text>
          <CommonDropdown
            options={STORAGE_TYPE_OPTIONS}
            selectedValue={specifications.storageType}
            onSelect={(val) => onChange({ storageType: val })}
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Net Weight */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Net Content / Weight</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 500 g, 1 kg, 5 Litres"
            placeholderTextColor={colors.textMuted}
            value={specifications.netWeight || ''}
            onChangeText={(val) => onChange({ netWeight: val })}
          />
        </View>

        {/* Shelf Life in Days */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Shelf Life (Days)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 90, 180, 365"
            placeholderTextColor={colors.textMuted}
            value={specifications.shelfLifeDays || ''}
            onChangeText={(val) => onChange({ shelfLifeDays: val })}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* FSSAI License Number */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>FSSAI License No. (14 digits)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.fssaiLicense ? brandColors.error : colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 10019022009845"
            placeholderTextColor={colors.textMuted}
            value={specifications.fssaiLicense || ''}
            onChangeText={(val) => onChange({ fssaiLicense: val })}
            keyboardType="number-pad"
            maxLength={14}
          />
          {errors.fssaiLicense ? (
            <Text style={[styles.errorText, { color: brandColors.error }]}>{errors.fssaiLicense}</Text>
          ) : null}
        </View>

        {/* Manufacturer */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Brand / Producer</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. ITC, Nestle, Amul"
            placeholderTextColor={colors.textMuted}
            value={specifications.manufacturer || ''}
            onChangeText={(val) => onChange({ manufacturer: val })}
          />
        </View>
      </View>

      {/* Organic Switch */}
      <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
        <View style={styles.switchInfo}>
          <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Certified Organic Food</Text>
          <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
            Display Jaivik Bharat / USDA Organic certification badge
          </Text>
        </View>
        <Switch
          value={specifications.isOrganic}
          onValueChange={(val) => onChange({ isOrganic: val })}
          trackColor={{ false: colors.border, true: brandColors.primaryLight }}
          thumbColor={specifications.isOrganic ? brandColors.primary : '#FFFFFF'}
        />
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

