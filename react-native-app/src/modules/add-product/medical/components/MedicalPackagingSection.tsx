import React from 'react';
import { View, Text, StyleSheet, TextInput, Switch } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { MedicalPackagingDetails } from '../types';
import { CommonFormCard } from '../../common/components/CommonFormCard';

interface MedicalPackagingSectionProps {
  packaging: MedicalPackagingDetails;
  onChange: (updated: Partial<MedicalPackagingDetails>) => void;
}

export const MedicalPackagingSection: React.FC<MedicalPackagingSectionProps> = ({
  packaging,
  onChange,
}) => {
  const { colors, brandColors } = useTheme();

  const strips = packaging.stripsPerBox || 10;
  const tablets = packaging.tabletsPerStrip || 10;
  const totalInBox = strips * tablets;

  return (
    <CommonFormCard
      title="Packaging & Unit Multipliers"
      subtitle="Configure Box → Strip → Tablet relationships for POS unit conversions"
      icon="cube-outline"
    >
      <View style={styles.row}>
        {/* Strips per box */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Strips Per Box</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="10"
            placeholderTextColor={colors.textMuted}
            value={packaging.stripsPerBox ? String(packaging.stripsPerBox) : ''}
            onChangeText={(val) => onChange({ stripsPerBox: parseInt(val, 10) || undefined })}
            keyboardType="number-pad"
          />
        </View>

        {/* Tablets per strip */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Units / Tablets Per Strip</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="10"
            placeholderTextColor={colors.textMuted}
            value={packaging.tabletsPerStrip ? String(packaging.tabletsPerStrip) : ''}
            onChangeText={(val) => onChange({ tabletsPerStrip: parseInt(val, 10) || undefined })}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Conversion Banner */}
      <View style={[styles.conversionBadge, { backgroundColor: brandColors.primaryLight + '20', borderColor: brandColors.primary }]}>
        <Text style={[styles.conversionText, { color: brandColors.primary }]}>
          Unit Hierarchy: 1 Box = {strips} Strips = {totalInBox} Tablets / Units
        </Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Manufacturer / Pharma Company</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="e.g. Cipla, Sun Pharma, Dr. Reddy's"
          placeholderTextColor={colors.textMuted}
          value={packaging.manufacturer || ''}
          onChangeText={(val) => onChange({ manufacturer: val })}
        />
      </View>

      {/* Cold Chain Switch */}
      <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
        <View style={styles.switchInfo}>
          <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>
            Cold Chain Storage Required (2°C – 8°C)
          </Text>
          <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
            Insulin, vaccines, biopharmaceuticals
          </Text>
        </View>
        <Switch
          value={packaging.keepRefrigerated}
          onValueChange={(val) => onChange({ keepRefrigerated: val })}
          trackColor={{ false: colors.border, true: brandColors.primaryLight }}
          thumbColor={packaging.keepRefrigerated ? brandColors.primary : '#FFFFFF'}
        />
      </View>
    </CommonFormCard>
  );
};

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 12,
  },
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
  conversionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  conversionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
});

