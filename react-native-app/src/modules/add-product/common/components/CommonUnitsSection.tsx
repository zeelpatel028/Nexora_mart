import React from 'react';
import { View, Text, StyleSheet, TextInput, Switch } from 'react-native';
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

export const CommonUnitsSection: React.FC<CommonUnitsSectionProps> = ({
  data,
  onChange,
  units = DEFAULT_PRODUCT_UNITS,
  errors = {},
  allowSecondaryUnit = true,
}) => {
  const { colors, brandColors } = useTheme();

  const unitDropdownItems = units.map((u) => ({
    label: `${u.unitName} (${u.unitCode})`,
    value: u.unitCode,
  }));

  const selectedPrimaryUnit = units.find((u) => u.unitCode === data.primaryUnit);
  const selectedSecondaryUnit = units.find((u) => u.unitCode === data.secondaryUnit);

  return (
    <View>
      <View style={styles.row}>
        {/* Primary Unit */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Primary Unit <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <CommonDropdown
            options={unitDropdownItems}
            selectedValue={data.primaryUnit}
            onSelect={(val) => {
              const u = units.find((x) => x.unitCode === val);
              onChange({
                primaryUnit: val,
                allowDecimal: u ? u.allowDecimal : data.allowDecimal,
              });
            }}
            placeholder="Select unit"
            error={errors.primaryUnit}
          />
        </View>

        {/* HSN Code */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>HSN / SAC Code</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: errors.hsnCode ? brandColors.error : colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="e.g. 5208, 3004"
            placeholderTextColor={colors.textMuted}
            value={data.hsnCode || ''}
            onChangeText={(val) => onChange({ hsnCode: val })}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Allow Decimal Quantity Switch */}
      <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
        <View style={styles.switchInfo}>
          <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Allow Decimal Quantities</Text>
          <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
            Enable for products sold in fractional units (e.g. 1.5 kg, 2.25 meters)
          </Text>
        </View>
        <Switch
          value={data.allowDecimal}
          onValueChange={(val) => onChange({ allowDecimal: val })}
          trackColor={{ false: colors.border, true: brandColors.primaryLight }}
          thumbColor={data.allowDecimal ? brandColors.primary : '#FFFFFF'}
        />
      </View>

      {/* Secondary Unit Configuration */}
      {allowSecondaryUnit && (
        <View style={styles.secondaryContainer}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Secondary Unit (Packaging)</Text>
              <CommonDropdown
                options={[{ label: 'None (Only Primary Unit)', value: '' }, ...unitDropdownItems]}
                selectedValue={data.secondaryUnit || ''}
                onSelect={(val) => onChange({ secondaryUnit: val || undefined })}
                placeholder="Select packaging unit"
              />
            </View>

            {!!data.secondaryUnit && (
              <View style={styles.col}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Conversion Factor <Text style={{ color: brandColors.error }}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      borderColor: errors.conversionFactor ? brandColors.error : colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="e.g. 10"
                  placeholderTextColor={colors.textMuted}
                  value={data.conversionFactor ? String(data.conversionFactor) : ''}
                  onChangeText={(val) => onChange({ conversionFactor: parseFloat(val) || undefined })}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          {!!data.secondaryUnit && !!data.conversionFactor && (
            <View style={[styles.conversionBadge, { backgroundColor: brandColors.primaryLight + '25', borderColor: brandColors.primary }]}>
              <Text style={[styles.conversionText, { color: brandColors.primary }]}>
                Formula: 1 {selectedSecondaryUnit?.unitName || data.secondaryUnit} = {data.conversionFactor}{' '}
                {selectedPrimaryUnit?.unitName || data.primaryUnit}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
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
  secondaryContainer: {
    marginTop: 4,
  },
  conversionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 8,
  },
  conversionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
