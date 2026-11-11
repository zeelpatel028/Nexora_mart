import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../hooks/useTheme';
import { ProductVariantItem } from '../../common/types';
import { CommonFormCard } from '../../common/components/CommonFormCard';
import { CommonMultiSelect } from '../../common/components/CommonMultiSelect';
import { CommonVariantTable } from '../../common/components/CommonVariantTable';
import { STANDARD_SIZES, STANDARD_COLORS } from '../constants';
import { generateVariantMatrix } from '../../common/utils/variantGenerator';

interface ClothingVariantSectionProps {
  selectedSizes: string[];
  onChangeSizes: (sizes: string[]) => void;
  selectedColors: string[];
  onChangeColors: (colors: string[]) => void;
  variants: ProductVariantItem[];
  onChangeVariants: (variants: ProductVariantItem[]) => void;
  baseSku?: string;
  basePurchasePrice?: string;
  baseSellingPrice?: string;
  baseMrp?: string;
}

export const ClothingVariantSection: React.FC<ClothingVariantSectionProps> = ({
  selectedSizes,
  onChangeSizes,
  selectedColors,
  onChangeColors,
  variants,
  onChangeVariants,
  baseSku = 'CLTH-001',
  basePurchasePrice = '0',
  baseSellingPrice = '0',
  baseMrp = '0',
}) => {
  const { brandColors } = useTheme();

  const handleGenerateVariants = () => {
    if (selectedSizes.length === 0 && selectedColors.length === 0) return;

    const sizesToUse = selectedSizes.length > 0 ? selectedSizes : ['Free Size'];
    const colorsToUse = selectedColors.length > 0 ? selectedColors : ['Standard'];

    const matrix = generateVariantMatrix(
      sizesToUse,
      colorsToUse,
      baseSku,
      basePurchasePrice,
      baseSellingPrice,
      baseMrp
    );
    onChangeVariants(matrix);
  };

  const handleAddManualVariant = () => {
    const nextIdx = variants.length + 1;
    const manual: ProductVariantItem = {
      size: 'Custom',
      color: 'Custom',
      sku: `${baseSku}-VAR${nextIdx}`,
      purchase_price: basePurchasePrice,
      selling_price: baseSellingPrice,
      mrp: baseMrp,
      stock_quantity: '0',
    };
    onChangeVariants([...variants, manual]);
  };

  return (
    <CommonFormCard
      title="Size & Color Variants Matrix"
      subtitle="Select available sizes and colors to generate individual SKUs and barcodes"
      icon="grid-outline"
    >
      {/* Sizes Selection */}
      <View style={styles.section}>
        <CommonMultiSelect
          label="Available Sizes"
          options={STANDARD_SIZES}
          selectedValues={selectedSizes}
          onChange={onChangeSizes}
          placeholder="Tap to select sizes"
        />
      </View>

      {/* Colors Selection */}
      <View style={styles.section}>
        <CommonMultiSelect
          label="Available Colors"
          options={STANDARD_COLORS}
          selectedValues={selectedColors}
          onChange={onChangeColors}
          placeholder="Tap to select colors"
        />
      </View>

      {/* Generate Button */}
      {(selectedSizes.length > 0 || selectedColors.length > 0) && (
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: brandColors.primary }]}
          onPress={handleGenerateVariants}
        >
          <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          <Text style={styles.generateButtonText}>
            Generate Matrix (
            {(selectedSizes.length || 1) * (selectedColors.length || 1)} Variants)
          </Text>
        </TouchableOpacity>
      )}

      {/* Variants Table */}
      <CommonVariantTable
        variants={variants}
        onChangeVariants={onChangeVariants}
        basePurchasePrice={basePurchasePrice}
        baseSellingPrice={baseSellingPrice}
        baseMrp={baseMrp}
        onAddManualVariant={handleAddManualVariant}
        title="Apparel Variant Inventory"
      />
    </CommonFormCard>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 16,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
