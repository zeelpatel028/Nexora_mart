import React from 'react';
import { View, Text, StyleSheet, TextInput, Switch } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { HandloomSpecifications } from '../types';
import { CommonFormCard } from '../../common/components/CommonFormCard';
import { CommonDropdown } from '../../common/components/CommonDropdown';
import {
  HANDLOOM_PRODUCT_TYPE_OPTIONS,
  FABRIC_TYPE_OPTIONS,
  WEAVING_TECHNIQUE_OPTIONS,
  CRAFT_TYPE_OPTIONS,
  ORIGIN_REGION_OPTIONS,
} from '../constants';

interface HandloomSpecificationsSectionProps {
  specifications: HandloomSpecifications;
  onChange: (updated: Partial<HandloomSpecifications>) => void;
  errors?: Record<string, string>;
}

export const HandloomSpecificationsSection: React.FC<HandloomSpecificationsSectionProps> = ({
  specifications,
  onChange,
  errors = {},
}) => {
  const { colors, brandColors } = useTheme();

  return (
    <CommonFormCard
      title="Authentic Handloom & Artisan Craft"
      subtitle="Weaving technique, artisan origin cluster, GI tag, and silk/cotton yarn details"
      icon="color-palette-outline"
    >
      <View style={styles.row}>
        {/* Product Type */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Handloom Article</Text>
          <CommonDropdown
            options={HANDLOOM_PRODUCT_TYPE_OPTIONS}
            selectedValue={specifications.productType}
            onSelect={(val) => onChange({ productType: val })}
          />
        </View>

        {/* Fabric Type */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Fabric / Yarn <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <CommonDropdown
            options={FABRIC_TYPE_OPTIONS}
            selectedValue={specifications.fabricType}
            onSelect={(val) => onChange({ fabricType: val })}
            error={errors.fabricType}
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Weaving Technique */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Weaving Technique <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <CommonDropdown
            options={WEAVING_TECHNIQUE_OPTIONS}
            selectedValue={specifications.weavingTechnique}
            onSelect={(val) => onChange({ weavingTechnique: val })}
            error={errors.weavingTechnique}
          />
        </View>

        {/* Craft / Art Form */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Craft / Art Form</Text>
          <CommonDropdown
            options={CRAFT_TYPE_OPTIONS}
            selectedValue={specifications.craftType}
            onSelect={(val) => onChange({ craftType: val })}
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Geographic Origin Region */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Origin Cluster / Region</Text>
          <CommonDropdown
            options={ORIGIN_REGION_OPTIONS}
            selectedValue={specifications.originRegion}
            onSelect={(val) => onChange({ originRegion: val })}
          />
        </View>

        {/* Artisan Name */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Master Weaver / Artisan</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. Ramprasad Weaver Society"
            placeholderTextColor={colors.textMuted}
            value={specifications.artisanName || ''}
            onChangeText={(val) => onChange({ artisanName: val })}
          />
        </View>
      </View>

      <View style={styles.row}>
        {/* Design Motifs */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Motif / Design Pattern</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. Temple Border, Peacock Buta, Zari Pallu"
            placeholderTextColor={colors.textMuted}
            value={specifications.designPattern || ''}
            onChangeText={(val) => onChange({ designPattern: val })}
          />
        </View>
      </View>

      {/* 100% Handwoven Switch */}
      <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
        <View style={styles.switchInfo}>
          <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>100% Handwoven (India Handloom Brand)</Text>
          <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
            Woven entirely on traditional manual looms without power assistance
          </Text>
        </View>
        <Switch
          value={specifications.handwoven}
          onValueChange={(val) => onChange({ handwoven: val })}
          trackColor={{ false: colors.border, true: brandColors.primaryLight }}
          thumbColor={specifications.handwoven ? brandColors.primary : '#FFFFFF'}
        />
      </View>
    </CommonFormCard>
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
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

