import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { GrocerySpecifications } from '../types';
import { CommonFormCard } from '../../common/components/CommonFormCard';
import { CommonDropdown } from '../../common/components/CommonDropdown';
import {
  FOOD_TYPE_OPTIONS,
  ITEM_TYPE_OPTIONS,
  PACKAGING_TYPE_OPTIONS,
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
      subtitle="Dietary classification, item category, and packaging"
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

        {/* Net Content / Weight */}
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
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
});
