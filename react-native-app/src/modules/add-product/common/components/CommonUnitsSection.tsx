import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { BaseProductUnitInfo, ProductUnitOption } from '../types';
import { CommonDropdown } from './CommonDropdown';
import { DEFAULT_PRODUCT_UNITS } from '../constants';

interface CommonUnitsSectionProps {
  data: BaseProductUnitInfo;
  onChange: (updated: Partial<BaseProductUnitInfo>) => void;
  units?: ProductUnitOption[];
  errors?: Record<string, string>;
  allowSecondaryUnit?: boolean;
}

/**
 * Streamlined Units Section.
 * Clean: Primary Unit selection.
 */
export const CommonUnitsSection: React.FC<CommonUnitsSectionProps> = ({
  data,
  onChange,
  units = DEFAULT_PRODUCT_UNITS,
  errors = {},
}) => {
  const { colors, brandColors } = useTheme();

  const unitDropdownItems = units.map((u) => ({
    label: `${u.unitName} (${u.unitCode})`,
    value: u.unitCode,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Measurement Unit <Text style={{ color: brandColors.error }}>*</Text>
        </Text>
        <CommonDropdown
          options={unitDropdownItems}
          selectedValue={data.primaryUnit || 'PCS'}
          onSelect={(val) => {
            const u = units.find((x) => x.unitCode === val);
            onChange({
              primaryUnit: val,
              allowDecimal: u ? u.allowDecimal : false,
            });
          }}
          placeholder="Select unit (e.g. PCS, KG, PACK)"
          error={errors.primaryUnit}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
});
