import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';
import { ClothingSpecifications } from '../types';
import { CommonDropdown } from '../../common/components/CommonDropdown';
import { CommonFormCard } from '../../common/components/CommonFormCard';
import {
  GENDER_OPTIONS,
  CLOTHING_TYPE_OPTIONS,
  FABRIC_OPTIONS,
  PATTERN_OPTIONS,
  FIT_OPTIONS,
} from '../constants';

interface ClothingSpecificationsSectionProps {
  specifications: ClothingSpecifications;
  onChange: (updated: Partial<ClothingSpecifications>) => void;
  errors?: Record<string, string>;
}

export const ClothingSpecificationsSection: React.FC<ClothingSpecificationsSectionProps> = ({
  specifications,
  onChange,
  errors = {},
}) => {
  const { colors, brandColors } = useTheme();

  const currentType = specifications.clothingType || 'T-Shirt';
  const customSpecs = specifications.customSpecs || [{ name: '', value: '' }];

  const handleAddCustomSpec = () => {
    onChange({ customSpecs: [...customSpecs, { name: '', value: '' }] });
  };

  const handleRemoveCustomSpec = (idx: number) => {
    onChange({ customSpecs: customSpecs.filter((_, i) => i !== idx) });
  };

  const handleUpdateCustomSpec = (idx: number, field: 'name' | 'value', val: string) => {
    const updated = [...customSpecs];
    updated[idx][field] = val;
    onChange({ customSpecs: updated });
  };

  return (
    <CommonFormCard
      title="Smart Product Specifications"
      subtitle="Dynamic apparel specifications based on product type"
      icon="shirt-outline"
    >
      {/* 1. Specification Type Dropdown */}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Specification Type <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <CommonDropdown
            options={CLOTHING_TYPE_OPTIONS}
            selectedValue={currentType}
            onSelect={(val) => onChange({ clothingType: val })}
            placeholder="Select product type"
            error={errors.clothingType}
          />
        </View>
      </View>

      {/* 2. DYNAMIC FIELDS ACCORDING TO SPECIFICATION TYPE */}
      {/* T-SHIRT */}
      {currentType === 'T-Shirt' && (
        <>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Pattern</Text>
              <CommonDropdown
                options={PATTERN_OPTIONS}
                selectedValue={specifications.pattern}
                onSelect={(val) => onChange({ pattern: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Neck Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Round Neck, V-Neck, Polo"
                placeholderTextColor={colors.textMuted}
                value={specifications.neckType || ''}
                onChangeText={(val) => onChange({ neckType: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Sleeve Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Half Sleeve, Full Sleeve"
                placeholderTextColor={colors.textMuted}
                value={specifications.sleeveLength || ''}
                onChangeText={(val) => onChange({ sleeveLength: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fabric</Text>
              <CommonDropdown
                options={FABRIC_OPTIONS}
                selectedValue={specifications.fabric}
                onSelect={(val) => onChange({ fabric: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fit Type</Text>
              <CommonDropdown
                options={FIT_OPTIONS}
                selectedValue={specifications.fit}
                onSelect={(val) => onChange({ fit: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Navy Blue, Jet Black"
                placeholderTextColor={colors.textMuted}
                value={specifications.color || ''}
                onChangeText={(val) => onChange({ color: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Material</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. 100% Cotton"
                placeholderTextColor={colors.textMuted}
                value={specifications.material || ''}
                onChangeText={(val) => onChange({ material: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Gender</Text>
              <CommonDropdown
                options={GENDER_OPTIONS}
                selectedValue={specifications.gender}
                onSelect={(val) => onChange({ gender: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Occasion</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Casual, Sports, Daily Wear"
                placeholderTextColor={colors.textMuted}
                value={specifications.occasion || ''}
                onChangeText={(val) => onChange({ occasion: val })}
              />
            </View>
          </View>
        </>
      )}

      {/* SHIRT */}
      {currentType === 'Shirt' && (
        <>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Pattern</Text>
              <CommonDropdown
                options={PATTERN_OPTIONS}
                selectedValue={specifications.pattern}
                onSelect={(val) => onChange({ pattern: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Collar Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Regular Spread, Button-Down"
                placeholderTextColor={colors.textMuted}
                value={specifications.collarType || ''}
                onChangeText={(val) => onChange({ collarType: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Sleeve Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Full Sleeve, Half Sleeve"
                placeholderTextColor={colors.textMuted}
                value={specifications.sleeveLength || ''}
                onChangeText={(val) => onChange({ sleeveLength: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fabric</Text>
              <CommonDropdown
                options={FABRIC_OPTIONS}
                selectedValue={specifications.fabric}
                onSelect={(val) => onChange({ fabric: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fit Type</Text>
              <CommonDropdown
                options={FIT_OPTIONS}
                selectedValue={specifications.fit}
                onSelect={(val) => onChange({ fit: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Closure Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Button Down"
                placeholderTextColor={colors.textMuted}
                value={specifications.closureType || ''}
                onChangeText={(val) => onChange({ closureType: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Pocket Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Single Pocket, No Pocket"
                placeholderTextColor={colors.textMuted}
                value={specifications.pocketType || ''}
                onChangeText={(val) => onChange({ pocketType: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Sky Blue, White"
                placeholderTextColor={colors.textMuted}
                value={specifications.color || ''}
                onChangeText={(val) => onChange({ color: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Gender</Text>
              <CommonDropdown
                options={GENDER_OPTIONS}
                selectedValue={specifications.gender}
                onSelect={(val) => onChange({ gender: val })}
              />
            </View>
          </View>
        </>
      )}

      {/* JEANS */}
      {currentType === 'Jeans' && (
        <>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fit Type</Text>
              <CommonDropdown
                options={FIT_OPTIONS}
                selectedValue={specifications.fit}
                onSelect={(val) => onChange({ fit: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Waist Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Mid Rise, High Rise"
                placeholderTextColor={colors.textMuted}
                value={specifications.waistType || ''}
                onChangeText={(val) => onChange({ waistType: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Rise Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Mid Rise, High Rise"
                placeholderTextColor={colors.textMuted}
                value={specifications.riseType || ''}
                onChangeText={(val) => onChange({ riseType: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Wash Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Medium Wash, Light Wash"
                placeholderTextColor={colors.textMuted}
                value={specifications.washType || ''}
                onChangeText={(val) => onChange({ washType: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Pattern</Text>
              <CommonDropdown
                options={PATTERN_OPTIONS}
                selectedValue={specifications.pattern}
                onSelect={(val) => onChange({ pattern: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fabric</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Stretch Denim"
                placeholderTextColor={colors.textMuted}
                value={specifications.fabric || ''}
                onChangeText={(val) => onChange({ fabric: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Closure Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Button & Zip Fly"
                placeholderTextColor={colors.textMuted}
                value={specifications.closureType || ''}
                onChangeText={(val) => onChange({ closureType: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Dark Indigo Blue"
                placeholderTextColor={colors.textMuted}
                value={specifications.color || ''}
                onChangeText={(val) => onChange({ color: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Gender</Text>
              <CommonDropdown
                options={GENDER_OPTIONS}
                selectedValue={specifications.gender}
                onSelect={(val) => onChange({ gender: val })}
              />
            </View>
          </View>
        </>
      )}

      {/* PANTS / TROUSERS */}
      {(currentType === 'Pants' || currentType === 'Trousers') && (
        <>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fit Type</Text>
              <CommonDropdown
                options={FIT_OPTIONS}
                selectedValue={specifications.fit}
                onSelect={(val) => onChange({ fit: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Waist Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Mid Rise, High Rise"
                placeholderTextColor={colors.textMuted}
                value={specifications.waistType || ''}
                onChangeText={(val) => onChange({ waistType: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Length</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Full Length, Ankle Length"
                placeholderTextColor={colors.textMuted}
                value={specifications.length || ''}
                onChangeText={(val) => onChange({ length: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Pattern</Text>
              <CommonDropdown
                options={PATTERN_OPTIONS}
                selectedValue={specifications.pattern}
                onSelect={(val) => onChange({ pattern: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fabric</Text>
              <CommonDropdown
                options={FABRIC_OPTIONS}
                selectedValue={specifications.fabric}
                onSelect={(val) => onChange({ fabric: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Closure Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Zip Fly, Elasticated"
                placeholderTextColor={colors.textMuted}
                value={specifications.closureType || ''}
                onChangeText={(val) => onChange({ closureType: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Khaki, Charcoal"
                placeholderTextColor={colors.textMuted}
                value={specifications.color || ''}
                onChangeText={(val) => onChange({ color: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Gender</Text>
              <CommonDropdown
                options={GENDER_OPTIONS}
                selectedValue={specifications.gender}
                onSelect={(val) => onChange({ gender: val })}
              />
            </View>
          </View>
        </>
      )}

      {/* KURTI */}
      {currentType === 'Kurti' && (
        <>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Pattern</Text>
              <CommonDropdown
                options={PATTERN_OPTIONS}
                selectedValue={specifications.pattern}
                onSelect={(val) => onChange({ pattern: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Neck Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Round Neck, Mandarin"
                placeholderTextColor={colors.textMuted}
                value={specifications.neckType || ''}
                onChangeText={(val) => onChange({ neckType: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Sleeve Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. 3/4th Sleeve, Full Sleeve"
                placeholderTextColor={colors.textMuted}
                value={specifications.sleeveLength || ''}
                onChangeText={(val) => onChange({ sleeveLength: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Length</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Calf Length, Knee Length"
                placeholderTextColor={colors.textMuted}
                value={specifications.length || ''}
                onChangeText={(val) => onChange({ length: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fabric</Text>
              <CommonDropdown
                options={FABRIC_OPTIONS}
                selectedValue={specifications.fabric}
                onSelect={(val) => onChange({ fabric: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fit Type</Text>
              <CommonDropdown
                options={FIT_OPTIONS}
                selectedValue={specifications.fit}
                onSelect={(val) => onChange({ fit: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Work Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Embroidered, Chikankari"
                placeholderTextColor={colors.textMuted}
                value={specifications.workType || ''}
                onChangeText={(val) => onChange({ workType: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Occasion</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Festive, Casual"
                placeholderTextColor={colors.textMuted}
                value={specifications.occasion || ''}
                onChangeText={(val) => onChange({ occasion: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Mustard Yellow"
                placeholderTextColor={colors.textMuted}
                value={specifications.color || ''}
                onChangeText={(val) => onChange({ color: val })}
              />
            </View>
          </View>
        </>
      )}

      {/* SAREE */}
      {currentType === 'Saree' && (
        <>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fabric</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Pure Silk, Georgette, Chiffon"
                placeholderTextColor={colors.textMuted}
                value={specifications.fabric || ''}
                onChangeText={(val) => onChange({ fabric: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Pattern</Text>
              <CommonDropdown
                options={PATTERN_OPTIONS}
                selectedValue={specifications.pattern}
                onSelect={(val) => onChange({ pattern: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Border Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Zari Border, Broad Border"
                placeholderTextColor={colors.textMuted}
                value={specifications.borderType || ''}
                onChangeText={(val) => onChange({ borderType: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Work Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Woven, Embroidered, Handloom"
                placeholderTextColor={colors.textMuted}
                value={specifications.workType || ''}
                onChangeText={(val) => onChange({ workType: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Occasion</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Wedding, Festive, Traditional"
                placeholderTextColor={colors.textMuted}
                value={specifications.occasion || ''}
                onChangeText={(val) => onChange({ occasion: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Length</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. 5.5 Metres, 6.3 Metres"
                placeholderTextColor={colors.textMuted}
                value={specifications.length || ''}
                onChangeText={(val) => onChange({ length: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Royal Blue"
                placeholderTextColor={colors.textMuted}
                value={specifications.color || ''}
                onChangeText={(val) => onChange({ color: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Blouse Piece</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Available (Attached)"
                placeholderTextColor={colors.textMuted}
                value={specifications.blousePiece || ''}
                onChangeText={(val) => onChange({ blousePiece: val })}
              />
            </View>
          </View>
        </>
      )}

      {/* DRESS */}
      {currentType === 'Dress' && (
        <>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Dress Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Maxi Dress, Midi Dress, Bodycon"
                placeholderTextColor={colors.textMuted}
                value={specifications.dressType || ''}
                onChangeText={(val) => onChange({ dressType: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Neck Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Round Neck, V-Neck"
                placeholderTextColor={colors.textMuted}
                value={specifications.neckType || ''}
                onChangeText={(val) => onChange({ neckType: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Sleeve Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Sleeveless, Short Sleeve"
                placeholderTextColor={colors.textMuted}
                value={specifications.sleeveLength || ''}
                onChangeText={(val) => onChange({ sleeveLength: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Length</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Knee Length, Maxi Length"
                placeholderTextColor={colors.textMuted}
                value={specifications.length || ''}
                onChangeText={(val) => onChange({ length: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Pattern</Text>
              <CommonDropdown
                options={PATTERN_OPTIONS}
                selectedValue={specifications.pattern}
                onSelect={(val) => onChange({ pattern: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fabric</Text>
              <CommonDropdown
                options={FABRIC_OPTIONS}
                selectedValue={specifications.fabric}
                onSelect={(val) => onChange({ fabric: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fit Type</Text>
              <CommonDropdown
                options={FIT_OPTIONS}
                selectedValue={specifications.fit}
                onSelect={(val) => onChange({ fit: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Occasion</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Casual, Party"
                placeholderTextColor={colors.textMuted}
                value={specifications.occasion || ''}
                onChangeText={(val) => onChange({ occasion: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Lavender, Maroon"
                placeholderTextColor={colors.textMuted}
                value={specifications.color || ''}
                onChangeText={(val) => onChange({ color: val })}
              />
            </View>
          </View>
        </>
      )}

      {/* JACKET */}
      {currentType === 'Jacket' && (
        <>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fit Type</Text>
              <CommonDropdown
                options={FIT_OPTIONS}
                selectedValue={specifications.fit}
                onSelect={(val) => onChange({ fit: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Closure Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Zipper, Button Down"
                placeholderTextColor={colors.textMuted}
                value={specifications.closureType || ''}
                onChangeText={(val) => onChange({ closureType: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fabric</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Denim, Leather, Fleece"
                placeholderTextColor={colors.textMuted}
                value={specifications.fabric || ''}
                onChangeText={(val) => onChange({ fabric: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Pattern</Text>
              <CommonDropdown
                options={PATTERN_OPTIONS}
                selectedValue={specifications.pattern}
                onSelect={(val) => onChange({ pattern: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Sleeve Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Full Sleeve, Sleeveless"
                placeholderTextColor={colors.textMuted}
                value={specifications.sleeveLength || ''}
                onChangeText={(val) => onChange({ sleeveLength: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Jet Black, Olive"
                placeholderTextColor={colors.textMuted}
                value={specifications.color || ''}
                onChangeText={(val) => onChange({ color: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Gender</Text>
              <CommonDropdown
                options={GENDER_OPTIONS}
                selectedValue={specifications.gender}
                onSelect={(val) => onChange({ gender: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Occasion</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Casual, Winter"
                placeholderTextColor={colors.textMuted}
                value={specifications.occasion || ''}
                onChangeText={(val) => onChange({ occasion: val })}
              />
            </View>
          </View>
        </>
      )}

      {/* SHORTS */}
      {currentType === 'Shorts' && (
        <>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fit Type</Text>
              <CommonDropdown
                options={FIT_OPTIONS}
                selectedValue={specifications.fit}
                onSelect={(val) => onChange({ fit: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Waist Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Elasticated with Drawstring"
                placeholderTextColor={colors.textMuted}
                value={specifications.waistType || ''}
                onChangeText={(val) => onChange({ waistType: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Length</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Above Knee, Mid-Thigh"
                placeholderTextColor={colors.textMuted}
                value={specifications.length || ''}
                onChangeText={(val) => onChange({ length: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fabric</Text>
              <CommonDropdown
                options={FABRIC_OPTIONS}
                selectedValue={specifications.fabric}
                onSelect={(val) => onChange({ fabric: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Pattern</Text>
              <CommonDropdown
                options={PATTERN_OPTIONS}
                selectedValue={specifications.pattern}
                onSelect={(val) => onChange({ pattern: val })}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Navy Blue"
                placeholderTextColor={colors.textMuted}
                value={specifications.color || ''}
                onChangeText={(val) => onChange({ color: val })}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Gender</Text>
              <CommonDropdown
                options={GENDER_OPTIONS}
                selectedValue={specifications.gender}
                onSelect={(val) => onChange({ gender: val })}
              />
            </View>
          </View>
        </>
      )}

      {/* OTHER (CUSTOM SPECIFICATIONS) */}
      {currentType === 'Other' && (
        <View style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Custom Specifications</Text>
            <TouchableOpacity onPress={handleAddCustomSpec} style={[styles.addSpecBtn, { borderColor: brandColors.primary }]}>
              <Text style={[styles.addSpecText, { color: brandColors.primary }]}>+ Add Specification</Text>
            </TouchableOpacity>
          </View>

          {customSpecs.map((item, idx) => (
            <View key={idx} style={styles.customRow}>
              <TextInput
                style={[styles.input, styles.customInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Spec Name (e.g. Embroidery)"
                placeholderTextColor={colors.textMuted}
                value={item.name}
                onChangeText={(val) => handleUpdateCustomSpec(idx, 'name', val)}
              />
              <TextInput
                style={[styles.input, styles.customInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Value (e.g. Hand Crafted)"
                placeholderTextColor={colors.textMuted}
                value={item.value}
                onChangeText={(val) => handleUpdateCustomSpec(idx, 'value', val)}
              />
              {customSpecs.length > 1 && (
                <TouchableOpacity onPress={() => handleRemoveCustomSpec(idx)} style={styles.removeBtn}>
                  <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
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
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  customRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
  },
  removeBtn: {
    width: 36,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSpecBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addSpecText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
