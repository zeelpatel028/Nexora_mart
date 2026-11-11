import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { BaseProductBasicInfo } from '../types';
import { CommonDropdown } from './CommonDropdown';
import { CommonImagePicker } from './CommonImagePicker';
import { generateProductSku, generateBarcode } from '../utils/skuGenerator';
import { Category, Brand } from '../../../../models/types';

interface CommonBasicInfoSectionProps {
  data: BaseProductBasicInfo;
  onChange: (updated: Partial<BaseProductBasicInfo>) => void;
  categories: Category[];
  brands: Brand[];
  errors?: Record<string, string>;
  storeCode?: string;
  skuPrefix?: string;
}

export const CommonBasicInfoSection: React.FC<CommonBasicInfoSectionProps> = ({
  data,
  onChange,
  categories,
  brands,
  errors = {},
  storeCode = 'STR001',
  skuPrefix = 'PRD',
}) => {
  const { colors, brandColors } = useTheme();

  const handleGenerateSku = () => {
    const newSku = generateProductSku(skuPrefix, storeCode);
    onChange({ sku: newSku });
  };

  const handleGenerateBarcode = () => {
    const newBarcode = generateBarcode();
    onChange({ barcode: newBarcode });
  };

  return (
    <View>
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
          placeholder="e.g. Premium Cotton T-Shirt, Basmati Rice"
          placeholderTextColor={colors.textMuted}
          value={data.productName}
          onChangeText={(val) => onChange({ productName: val })}
        />
        {errors.productName && (
          <Text style={[styles.errorText, { color: brandColors.error }]}>
            {errors.productName}
          </Text>
        )}
      </View>

      {/* SKU & Auto Generate */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Product SKU</Text>
          <TouchableOpacity onPress={handleGenerateSku}>
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

      {/* Barcode & Auto Generate */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Barcode / EAN</Text>
          <TouchableOpacity onPress={handleGenerateBarcode}>
            <Text style={[styles.actionLink, { color: brandColors.primary }]}>⚡ Generate</Text>
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
          placeholder="Scan or enter barcode"
          placeholderTextColor={colors.textMuted}
          value={data.barcode || ''}
          onChangeText={(val) => onChange({ barcode: val })}
          keyboardType="numeric"
        />
      </View>

      {/* Category Dropdown */}
      <CommonDropdown
        label="Category"
        placeholder="Select category..."
        options={categories.map((c) => ({ label: c.name, value: c.id }))}
        selectedValue={data.categoryId}
        onSelect={(val) => onChange({ categoryId: val })}
      />

      {/* Brand Dropdown */}
      <CommonDropdown
        label="Brand / Manufacturer"
        placeholder="Select brand..."
        options={brands.map((b) => ({ label: b.name, value: b.id }))}
        selectedValue={data.brandId}
        onSelect={(val) => onChange({ brandId: val })}
      />

      {/* Images */}
      <CommonImagePicker
        images={data.images}
        onChange={(imgs) => onChange({ images: imgs })}
      />

      {/* Short Description */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Short Tagline</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          ]}
          placeholder="Brief highlight or summary"
          placeholderTextColor={colors.textMuted}
          value={data.shortDescription || ''}
          onChangeText={(val) => onChange({ shortDescription: val })}
        />
      </View>

      {/* Full Description */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          ]}
          placeholder="Detailed product features, materials, care, and usage instructions..."
          placeholderTextColor={colors.textMuted}
          value={data.description || ''}
          onChangeText={(val) => onChange({ description: val })}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Product Status Switch */}
      <View style={styles.switchRow}>
        <View>
          <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Active Status</Text>
          <Text style={[styles.switchHint, { color: colors.textSecondary }]}>
            Enable to make this product visible in store catalog and POS billing
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
  fieldGroup: {
    marginBottom: 12,
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
  textArea: {
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  switchHint: {
    fontSize: 12,
    marginTop: 2,
    maxWidth: 240,
  },
});

