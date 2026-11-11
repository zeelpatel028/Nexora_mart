import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { ClothingMeasurements } from '../types';
import { CommonFormCard } from '../../common/components/CommonFormCard';

interface ClothingMeasurementSectionProps {
  measurements: ClothingMeasurements;
  onChange: (updated: Partial<ClothingMeasurements>) => void;
}

export const ClothingMeasurementSection: React.FC<ClothingMeasurementSectionProps> = ({
  measurements,
  onChange,
}) => {
  const { colors } = useTheme();

  return (
    <CommonFormCard
      title="Size Chart & Garment Measurements"
      subtitle="Standard finished garment dimensions in inches (optional)"
      icon="resize-outline"
    >
      <View style={styles.grid}>
        <View style={styles.gridCol}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Chest / Bust (in)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 40"
            placeholderTextColor={colors.textMuted}
            value={measurements.chest || ''}
            onChangeText={(val) => onChange({ chest: val })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.gridCol}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Waist (in)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 32"
            placeholderTextColor={colors.textMuted}
            value={measurements.waist || ''}
            onChangeText={(val) => onChange({ waist: val })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.gridCol}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Length (in)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 28"
            placeholderTextColor={colors.textMuted}
            value={measurements.length || ''}
            onChangeText={(val) => onChange({ length: val })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.gridCol}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Shoulder (in)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 17.5"
            placeholderTextColor={colors.textMuted}
            value={measurements.shoulder || ''}
            onChangeText={(val) => onChange({ shoulder: val })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.gridCol}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Sleeve (in)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 8.5"
            placeholderTextColor={colors.textMuted}
            value={measurements.sleeve || ''}
            onChangeText={(val) => onChange({ sleeve: val })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.gridCol}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Inseam (in)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. 30"
            placeholderTextColor={colors.textMuted}
            value={measurements.inseam || ''}
            onChangeText={(val) => onChange({ inseam: val })}
            keyboardType="numeric"
          />
        </View>
      </View>
    </CommonFormCard>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCol: {
    width: '31%',
    minWidth: 100,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
});

