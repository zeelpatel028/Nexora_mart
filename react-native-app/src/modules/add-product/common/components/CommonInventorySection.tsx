import React from 'react';
import { View, Text, StyleSheet, TextInput, Switch } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { BaseProductInventoryInfo } from '../types';

interface CommonInventorySectionProps {
  data: BaseProductInventoryInfo;
  onChange: (updated: Partial<BaseProductInventoryInfo>) => void;
  errors?: Record<string, string>;
}

export const CommonInventorySection: React.FC<CommonInventorySectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const { colors, brandColors } = useTheme();

  return (
    <View>
      {/* Opening & Current Stock Row */}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Opening Stock Qty</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: errors.openingStock ? brandColors.error : colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            value={data.openingStock}
            onChangeText={(val) => onChange({ openingStock: val, currentStock: val })}
            keyboardType="numeric"
          />
          {errors.openingStock && (
            <Text style={[styles.errorText, { color: brandColors.error }]}>
              {errors.openingStock}
            </Text>
          )}
        </View>

        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Current Available</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            value={data.currentStock}
            onChangeText={(val) => onChange({ currentStock: val })}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Min Alert & Max Stock */}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Low Stock Alert</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="5"
            placeholderTextColor={colors.textMuted}
            value={data.minimumStock}
            onChangeText={(val) => onChange({ minimumStock: val })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Reorder Level</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="10"
            placeholderTextColor={colors.textMuted}
            value={data.reorderLevel}
            onChangeText={(val) => onChange({ reorderLevel: val })}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Warehouse / Shelf Location */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Warehouse Rack / Bin</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          ]}
          placeholder="e.g. Rack B, Shelf 3, Bin 102"
          placeholderTextColor={colors.textMuted}
          value={data.warehouseLocation || ''}
          onChangeText={(val) => onChange({ warehouseLocation: val })}
        />
      </View>

      {/* Toggles */}
      <View style={styles.switchRow}>
        <View>
          <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Track Inventory</Text>
          <Text style={[styles.switchHint, { color: colors.textSecondary }]}>
            Automatically deduct stock on sales and alert on low stock
          </Text>
        </View>
        <Switch
          value={data.trackInventory}
          onValueChange={(val) => onChange({ trackInventory: val })}
          thumbColor={data.trackInventory ? brandColors.primary : '#ccc'}
          trackColor={{ false: '#767577', true: brandColors.primaryLight }}
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
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
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

