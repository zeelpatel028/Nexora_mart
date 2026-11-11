import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { BaseProductPricingInfo } from '../types';
import { CommonDropdown } from './CommonDropdown';
import { GST_RATE_OPTIONS, TAX_TREATMENT_OPTIONS } from '../constants';
import { calculateProfitMargin } from '../utils/calculations';

interface CommonPricingSectionProps {
  data: BaseProductPricingInfo;
  onChange: (updated: Partial<BaseProductPricingInfo>) => void;
  errors?: Record<string, string>;
}

export const CommonPricingSection: React.FC<CommonPricingSectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const { colors, brandColors } = useTheme();

  const marginInfo = calculateProfitMargin(data.purchasePrice, data.sellingPrice);

  return (
    <View>
      {/* Price Inputs: Purchase & Selling in a Row */}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Purchase Price (₹)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: errors.purchasePrice ? brandColors.error : colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            value={data.purchasePrice}
            onChangeText={(val) => onChange({ purchasePrice: val })}
            keyboardType="numeric"
          />
          {errors.purchasePrice ? (
            <Text style={[styles.errorText, { color: brandColors.error }]}>
              {errors.purchasePrice}
            </Text>
          ) : null}
        </View>

        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Selling Price (₹) <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: errors.sellingPrice ? brandColors.error : colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            value={data.sellingPrice}
            onChangeText={(val) => onChange({ sellingPrice: val })}
            keyboardType="numeric"
          />
          {errors.sellingPrice ? (
            <Text style={[styles.errorText, { color: brandColors.error }]}>
              {errors.sellingPrice}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Live Profit Margin Badge */}
      {parseFloat(data.sellingPrice) > 0 ? (
        <View
          style={[
            styles.profitCard,
            {
              backgroundColor:
                marginInfo.profitAmount >= 0 ? '#ECFDF5' : '#FEF2F2',
              borderColor: marginInfo.profitAmount >= 0 ? '#10B981' : '#DC2626',
            },
          ]}
        >
          <Text
            style={[
              styles.profitText,
              { color: marginInfo.profitAmount >= 0 ? '#065F46' : '#991B1B' },
            ]}
          >
            {marginInfo.profitAmount >= 0 ? '📈 Profit: ' : '📉 Loss: '}
            ₹{Math.abs(marginInfo.profitAmount)} ({marginInfo.marginPercentage}%)
          </Text>
        </View>
      ) : null}

      {/* MRP & Wholesale Price Row */}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>MRP (₹)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: errors.mrp ? brandColors.error : colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="Optional MRP"
            placeholderTextColor={colors.textMuted}
            value={data.mrp || ''}
            onChangeText={(val) => onChange({ mrp: val })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Wholesale (₹)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="B2B price"
            placeholderTextColor={colors.textMuted}
            value={data.wholesalePrice || ''}
            onChangeText={(val) => onChange({ wholesalePrice: val })}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Tax Treatment & GST Rate */}
      <View style={styles.row}>
        <View style={styles.col}>
          <CommonDropdown
            label="Tax Treatment"
            options={TAX_TREATMENT_OPTIONS}
            selectedValue={data.taxType}
            onSelect={(val) => onChange({ taxType: val })}
          />
        </View>

        <View style={styles.col}>
          <CommonDropdown
            label="GST Rate"
            options={GST_RATE_OPTIONS}
            selectedValue={data.gstRate}
            onSelect={(val) => onChange({ gstRate: Number(val) })}
          />
        </View>
      </View>

      {/* HSN Code */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>HSN / SAC Code</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          ]}
          placeholder="e.g. 6205, 1006, 3004"
          placeholderTextColor={colors.textMuted}
          value={data.hsnCode || ''}
          onChangeText={(val) => onChange({ hsnCode: val })}
          keyboardType="numeric"
        />
      </View>
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
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  profitCard: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  profitText: {
    fontSize: 13,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

