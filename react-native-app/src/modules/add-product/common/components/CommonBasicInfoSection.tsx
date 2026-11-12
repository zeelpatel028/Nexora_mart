import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { BaseProductBasicInfo } from '../types';
import { generateProductSku } from '../utils/skuGenerator';
import { Category, Brand } from '../../../../models/types';

interface CommonBasicInfoSectionProps {
  data: BaseProductBasicInfo;
  onChange: (updated: Partial<BaseProductBasicInfo>) => void;
  categories?: Category[];
  brands?: Brand[];
  errors?: Record<string, string>;
  storeCode?: string;
  skuPrefix?: string;
}

/**
 * Ultra-clean, modern basic info section.
 * Streamlined: only Product Name, SKU (with auto-generator), and Active toggle.
 */
export const CommonBasicInfoSection: React.FC<CommonBasicInfoSectionProps> = ({
  data,
  onChange,
  errors = {},
  storeCode = 'STR001',
  skuPrefix = 'PRD',
}) => {
  const { colors, brandColors } = useTheme();

  const handleGenerateSku = () => {
    const newSku = generateProductSku(skuPrefix, storeCode);
    onChange({ sku: newSku });
  };

  return (
    <View style={styles.container}>
      {/* Product Name */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Product Name <Text style={{ color: brandColors.error }}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: errors.productName ? brandColors.error : colors.border,
              color: colors.textPrimary,
            },
          ]}
          placeholder="e.g. Premium Cotton Shirt, Basmati Rice 1kg"
          placeholderTextColor={colors.textMuted}
          value={data.productName}
          onChangeText={(val) => onChange({ productName: val })}
        />
        {errors.productName ? (
          <Text style={[styles.errorText, { color: brandColors.error }]}>
            {errors.productName}
          </Text>
        ) : null}
      </View>

      {/* SKU & Auto Generate in one sleek card */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Product SKU / Item Code</Text>
          <TouchableOpacity onPress={handleGenerateSku} activeOpacity={0.7} style={styles.autoSkuBtn}>
            <Text style={[styles.actionLink, { color: brandColors.primary }]}>⚡ Auto Generate</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          ]}
          placeholder="e.g. PRD-001234"
          placeholderTextColor={colors.textMuted}
          value={data.sku}
          onChangeText={(val) => onChange({ sku: val })}
          autoCapitalize="characters"
        />
      </View>

      {/* Product Status Switch */}
      <View style={[styles.switchRow, { borderTopColor: colors.border }]}>
        <View style={styles.switchInfo}>
          <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Active Status</Text>
          <Text style={[styles.switchHint, { color: colors.textSecondary }]}>
            Enable to make this product immediately active for sales and POS
          </Text>
        </View>
        <Switch
          value={data.status === 'active'}
          onValueChange={(val) => onChange({ status: val ? 'active' : 'inactive' })}
          thumbColor={data.status === 'active' ? brandColors.primary : '#ccc'}
          trackColor={{ false: '#767577', true: brandColors.primaryLight }}
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
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  autoSkuBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  actionLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
  },
  switchInfo: {
    flex: 1,
    paddingRight: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  switchHint: {
    fontSize: 12,
    marginTop: 2,
  },
});
