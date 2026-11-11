import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../hooks/useTheme';
import { ProductBatchItem } from '../types';

interface CommonBatchTableProps {
  batches: ProductBatchItem[];
  onChangeBatches: (updated: ProductBatchItem[]) => void;
  basePurchasePrice?: string;
  baseSellingPrice?: string;
  baseMrp?: string;
  showRackLocation?: boolean;
}

export const CommonBatchTable: React.FC<CommonBatchTableProps> = ({
  batches,
  onChangeBatches,
  basePurchasePrice = '0',
  baseSellingPrice = '0',
  baseMrp = '0',
  showRackLocation = true,
}) => {
  const { colors, brandColors } = useTheme();

  const handleUpdateBatch = (index: number, field: keyof ProductBatchItem, value: any) => {
    const updated = [...batches];
    updated[index] = { ...updated[index], [field]: value };
    onChangeBatches(updated);
  };

  const handleDeleteBatch = (index: number) => {
    const updated = batches.filter((_, i) => i !== index);
    onChangeBatches(updated);
  };

  const handleAddBatch = () => {
    const nextNumber = batches.length + 1;
    const today = new Date();
    const expiry = new Date(today);
    expiry.setFullYear(today.getFullYear() + 1);

    const newBatch: ProductBatchItem = {
      batch_number: `BTH-${String(nextNumber).padStart(3, '0')}`,
      manufacturing_date: today.toISOString().split('T')[0],
      expiry_date: expiry.toISOString().split('T')[0],
      purchase_price: basePurchasePrice,
      selling_price: baseSellingPrice,
      mrp: baseMrp,
      initial_quantity: '0',
      current_quantity: '0',
      rack_location: '',
      is_active: true,
    };
    onChangeBatches([...batches, newBatch]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Batch & Expiry Management ({batches.length})
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Compliant with FEFO (First-Expiry-First-Out) dispensing
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: brandColors.primary }]}
          onPress={handleAddBatch}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Batch</Text>
        </TouchableOpacity>
      </View>

      {batches.length === 0 ? (
        <View style={[styles.emptyBox, { borderColor: colors.border }]}>
          <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No batches added yet. Click &quot;Add Batch&quot; to register inventory lots.
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.row, styles.tableHeader, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.th, { width: 110, color: colors.textSecondary }]}>Batch No.</Text>
              <Text style={[styles.th, { width: 105, color: colors.textSecondary }]}>Expiry (YYYY-MM-DD)</Text>
              <Text style={[styles.th, { width: 75, color: colors.textSecondary }]}>Qty</Text>
              <Text style={[styles.th, { width: 85, color: colors.textSecondary }]}>Cost (₹)</Text>
              <Text style={[styles.th, { width: 85, color: colors.textSecondary }]}>Sell (₹)</Text>
              <Text style={[styles.th, { width: 85, color: colors.textSecondary }]}>MRP (₹)</Text>
              {showRackLocation && (
                <Text style={[styles.th, { width: 85, color: colors.textSecondary }]}>Rack/Shelf</Text>
              )}
              <Text style={[styles.th, { width: 45, textAlign: 'center', color: colors.textSecondary }]}>Del</Text>
            </View>

            {/* Rows */}
            {batches.map((b, idx) => (
              <View
                key={b.id || b.batch_number || idx}
                style={[
                  styles.row,
                  { borderBottomColor: colors.border },
                  idx % 2 === 1 && { backgroundColor: colors.surface + '60' },
                ]}
              >
                <View style={[styles.td, { width: 110 }]}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    value={b.batch_number}
                    onChangeText={(val) => handleUpdateBatch(idx, 'batch_number', val)}
                    placeholder="BATCH01"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <View style={[styles.td, { width: 105 }]}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    value={b.expiry_date}
                    onChangeText={(val) => handleUpdateBatch(idx, 'expiry_date', val)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <View style={[styles.td, { width: 75 }]}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    value={b.current_quantity || b.initial_quantity}
                    onChangeText={(val) => {
                      handleUpdateBatch(idx, 'initial_quantity', val);
                      handleUpdateBatch(idx, 'current_quantity', val);
                    }}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.td, { width: 85 }]}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    value={b.purchase_price}
                    onChangeText={(val) => handleUpdateBatch(idx, 'purchase_price', val)}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.td, { width: 85 }]}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    value={b.selling_price}
                    onChangeText={(val) => handleUpdateBatch(idx, 'selling_price', val)}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.td, { width: 85 }]}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    value={b.mrp || ''}
                    onChangeText={(val) => handleUpdateBatch(idx, 'mrp', val)}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                {showRackLocation && (
                  <View style={[styles.td, { width: 85 }]}>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                      value={b.rack_location || ''}
                      onChangeText={(val) => handleUpdateBatch(idx, 'rack_location', val)}
                      placeholder="A-12"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                )}

                <View style={[styles.td, { width: 45, alignItems: 'center' }]}>
                  <TouchableOpacity onPress={() => handleDeleteBatch(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="trash-outline" size={17} color={brandColors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
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
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    marginTop: 6,
  },
  emptyText: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  table: {
    minWidth: 600,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableHeader: {
    paddingVertical: 10,
    borderRadius: 6,
  },
  th: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  td: {
    paddingHorizontal: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
  },
});
