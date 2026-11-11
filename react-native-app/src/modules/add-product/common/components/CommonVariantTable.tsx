import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../hooks/useTheme';
import { ProductVariantItem } from '../types';

interface CommonVariantTableProps {
  variants: ProductVariantItem[];
  onChangeVariants: (updated: ProductVariantItem[]) => void;
  basePurchasePrice?: string;
  baseSellingPrice?: string;
  baseMrp?: string;
  onAddManualVariant?: () => void;
  title?: string;
}

export const CommonVariantTable: React.FC<CommonVariantTableProps> = ({
  variants,
  onChangeVariants,
  basePurchasePrice = '0',
  baseSellingPrice = '0',
  baseMrp = '0',
  onAddManualVariant,
  title = 'Product Variants',
}) => {
  const { colors, brandColors } = useTheme();

  const handleUpdateItem = (index: number, field: keyof ProductVariantItem, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChangeVariants(updated);
  };

  const handleDeleteItem = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    onChangeVariants(updated);
  };

  const handleApplyBasePrices = () => {
    const updated = variants.map((v) => ({
      ...v,
      purchase_price: v.purchase_price || basePurchasePrice,
      selling_price: v.selling_price || baseSellingPrice,
      mrp: v.mrp || baseMrp,
    }));
    onChangeVariants(updated);
  };

  if (!variants || variants.length === 0) {
    return (
      <View style={[styles.emptyContainer, { borderColor: colors.border }]}>
        <Ionicons name="grid-outline" size={36} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Variants Configured</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
          Select attributes (sizes, colors, finishes) to generate variants, or add them manually.
        </Text>
        {onAddManualVariant && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: brandColors.primary }]}
            onPress={onAddManualVariant}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Single Variant</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title} ({variants.length})
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Configure prices, stock, and barcodes per variant
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bulkButton, { borderColor: brandColors.primary }]}
          onPress={handleApplyBasePrices}
        >
          <Ionicons name="flash-outline" size={14} color={brandColors.primary} />
          <Text style={[styles.bulkButtonText, { color: brandColors.primary }]}>Sync Base Prices</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={[styles.headerCell, { width: 140, color: colors.textSecondary }]}>Variant</Text>
            <Text style={[styles.headerCell, { width: 120, color: colors.textSecondary }]}>SKU</Text>
            <Text style={[styles.headerCell, { width: 90, color: colors.textSecondary }]}>Cost (₹)</Text>
            <Text style={[styles.headerCell, { width: 90, color: colors.textSecondary }]}>Sell (₹)</Text>
            <Text style={[styles.headerCell, { width: 90, color: colors.textSecondary }]}>MRP (₹)</Text>
            <Text style={[styles.headerCell, { width: 80, color: colors.textSecondary }]}>Stock</Text>
            <Text style={[styles.headerCell, { width: 50, textAlign: 'center', color: colors.textSecondary }]}>Act</Text>
          </View>

          {/* Table Body */}
          {variants.map((item, index) => {
            const displayName =
              item.variant_name ||
              (item.size && item.color ? `${item.color} - ${item.size}` : item.size || item.color || `Variant #${index + 1}`);

            return (
              <View
                key={item.id || item.sku || index}
                style={[
                  styles.tableRow,
                  { borderBottomColor: colors.border },
                  index % 2 === 1 && { backgroundColor: colors.surface + '60' },
                ]}
              >
                {/* Variant Label */}
                <View style={[styles.cell, { width: 140 }]}>
                  <Text style={[styles.variantLabel, { color: colors.textPrimary }]} numberOfLines={1}>
                    {displayName}
                  </Text>
                  {item.barcode ? (
                    <Text style={[styles.barcodeLabel, { color: colors.textMuted }]} numberOfLines={1}>
                      {item.barcode}
                    </Text>
                  ) : null}
                </View>

                {/* SKU */}
                <View style={[styles.cell, { width: 120 }]}>
                  <TextInput
                    style={[styles.cellInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    value={item.sku}
                    onChangeText={(val) => handleUpdateItem(index, 'sku', val)}
                    placeholder="SKU"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                {/* Purchase Price */}
                <View style={[styles.cell, { width: 90 }]}>
                  <TextInput
                    style={[styles.cellInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    value={item.purchase_price}
                    onChangeText={(val) => handleUpdateItem(index, 'purchase_price', val)}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                {/* Selling Price */}
                <View style={[styles.cell, { width: 90 }]}>
                  <TextInput
                    style={[styles.cellInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    value={item.selling_price}
                    onChangeText={(val) => handleUpdateItem(index, 'selling_price', val)}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                {/* MRP */}
                <View style={[styles.cell, { width: 90 }]}>
                  <TextInput
                    style={[styles.cellInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    value={item.mrp || ''}
                    onChangeText={(val) => handleUpdateItem(index, 'mrp', val)}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                {/* Stock Quantity */}
                <View style={[styles.cell, { width: 80 }]}>
                  <TextInput
                    style={[styles.cellInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    value={item.stock_quantity}
                    onChangeText={(val) => handleUpdateItem(index, 'stock_quantity', val)}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                {/* Delete Action */}
                <View style={[styles.cell, { width: 50, alignItems: 'center' }]}>
                  <TouchableOpacity onPress={() => handleDeleteItem(index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="trash-outline" size={18} color={brandColors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {onAddManualVariant && (
        <TouchableOpacity
          style={[styles.addSecondaryButton, { borderColor: brandColors.primary }]}
          onPress={onAddManualVariant}
        >
          <Ionicons name="add" size={16} color={brandColors.primary} />
          <Text style={[styles.addSecondaryText, { color: brandColors.primary }]}>Add Another Variant</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bulkButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  table: {
    minWidth: 660,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableHeader: {
    paddingVertical: 10,
    borderRadius: 6,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 6,
  },
  cell: {
    paddingHorizontal: 6,
  },
  variantLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  barcodeLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  cellInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
  },
  addSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
  },
  addSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
