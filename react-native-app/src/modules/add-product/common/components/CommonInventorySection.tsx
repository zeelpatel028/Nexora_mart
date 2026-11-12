import React from 'react';
import { View, Text, StyleSheet, TextInput, Switch } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { BaseProductInventoryInfo } from '../types';

interface CommonInventorySectionProps {
  data: BaseProductInventoryInfo;
  onChange: (updated: Partial<BaseProductInventoryInfo>) => void;
  errors?: Record<string, string>;
}

/**
 * Modern, streamlined inventory section with:
 * - Available Stock Quantity
 * - Smart Low Stock Alert On/Off Toggle
 * - Smart Expiry Alert On/Off Toggle
 */
export const CommonInventorySection: React.FC<CommonInventorySectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const { colors, brandColors } = useTheme();

  const isLowStockOn = Boolean(data.enableLowStockAlert);
  const isExpiryOn = Boolean(data.enableExpiryAlert);

  return (
    <View style={styles.container}>
      {/* 1. Main Available Stock Quantity */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Available Stock Quantity <Text style={{ color: brandColors.error }}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            styles.stockInput,
            {
              backgroundColor: colors.surface,
              borderColor: errors.currentStock ? brandColors.error : colors.border,
              color: colors.textPrimary,
            },
          ]}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          value={data.currentStock}
          onChangeText={(val) =>
            onChange({
              currentStock: val,
              openingStock: val,
            })
          }
          keyboardType="numeric"
        />
        {errors.currentStock ? (
          <Text style={[styles.errorText, { color: brandColors.error }]}>
            {errors.currentStock}
          </Text>
        ) : null}
      </View>

      {/* 2. Smart Alerts Section */}
      <View style={[styles.alertsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Smart Stock & Expiry Alerts</Text>

        {/* Low Stock Alert Toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Low Stock Alert</Text>
            <Text style={[styles.toggleSubtitle, { color: colors.textMuted }]}>
              Receive an alert notification when item stock drops below threshold
            </Text>
          </View>
          <Switch
            value={isLowStockOn}
            onValueChange={(val) => {
              onChange({
                enableLowStockAlert: val,
                minimumStock: val ? (data.minimumStock || '5') : '',
              });
            }}
            trackColor={{ false: colors.border, true: brandColors.primaryLight }}
            thumbColor={isLowStockOn ? brandColors.primary : '#FFFFFF'}
          />
        </View>

        {/* Conditional Low Stock Input */}
        {isLowStockOn && (
          <View style={[styles.conditionalField, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Alert when stock drops below <Text style={{ color: brandColors.error }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.minimumStock ? brandColors.error : colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. 5 or 10 units"
              placeholderTextColor={colors.textMuted}
              value={data.minimumStock}
              onChangeText={(val) => onChange({ minimumStock: val })}
              keyboardType="numeric"
            />
            {errors.minimumStock ? (
              <Text style={[styles.errorText, { color: brandColors.error }]}>
                {errors.minimumStock}
              </Text>
            ) : null}
          </View>
        )}

        {/* Expiry Alert Toggle */}
        <View style={[styles.toggleRow, styles.borderTop, { borderTopColor: colors.border }]}>
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Expiry Alert</Text>
            <Text style={[styles.toggleSubtitle, { color: colors.textMuted }]}>
              Notify when product approaches or reaches expiry / best before
            </Text>
          </View>
          <Switch
            value={isExpiryOn}
            onValueChange={(val) => {
              onChange({
                enableExpiryAlert: val,
                expiryDate: val ? (data.expiryDate || '') : '',
              });
            }}
            trackColor={{ false: colors.border, true: brandColors.primaryLight }}
            thumbColor={isExpiryOn ? brandColors.primary : '#FFFFFF'}
          />
        </View>

        {/* Conditional Expiry Input */}
        {isExpiryOn && (
          <View style={[styles.conditionalField, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Expiry Date or Days <Text style={{ color: brandColors.error }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.expiryDate ? brandColors.error : colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. 2026-12-31 or 180 days"
              placeholderTextColor={colors.textMuted}
              value={data.expiryDate || ''}
              onChangeText={(val) => onChange({ expiryDate: val })}
            />
            {errors.expiryDate ? (
              <Text style={[styles.errorText, { color: brandColors.error }]}>
                {errors.expiryDate}
              </Text>
            ) : null}
          </View>
        )}
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
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  stockInput: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  alertsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  borderTop: {
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 12,
  },
  toggleInfo: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  conditionalField: {
    marginTop: 8,
    marginBottom: 6,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
});
