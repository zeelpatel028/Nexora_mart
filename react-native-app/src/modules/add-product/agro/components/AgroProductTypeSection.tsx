import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../hooks/useTheme';
import {
  AgroProductType,
  AgroMedicineDetails,
  AgroCropDetails,
  AgroFertilizerDetails,
  AgroSeedDetails,
} from '../types';
import { CommonFormCard } from '../../common/components/CommonFormCard';
import { CommonDropdown } from '../../common/components/CommonDropdown';
import {
  AGRO_PRODUCT_TYPE_OPTIONS,
  MEDICINE_TYPE_OPTIONS,
  FORMULATION_OPTIONS,
  TOXICITY_CLASSES,
  CROP_SEASONS,
  FERTILIZER_TYPE_OPTIONS,
  PHYSICAL_FORM_OPTIONS,
  SEED_CLASS_OPTIONS,
  SEED_TYPE_OPTIONS,
} from '../constants';

interface AgroProductTypeSectionProps {
  selectedType: AgroProductType;
  onSelectType: (type: AgroProductType) => void;
  medicineDetails: AgroMedicineDetails;
  onChangeMedicine: (up: Partial<AgroMedicineDetails>) => void;
  cropDetails: AgroCropDetails;
  onChangeCrop: (up: Partial<AgroCropDetails>) => void;
  fertilizerDetails: AgroFertilizerDetails;
  onChangeFertilizer: (up: Partial<AgroFertilizerDetails>) => void;
  seedDetails: AgroSeedDetails;
  onChangeSeed: (up: Partial<AgroSeedDetails>) => void;
  errors?: Record<string, string>;
}

export const AgroProductTypeSection: React.FC<AgroProductTypeSectionProps> = ({
  selectedType,
  onSelectType,
  medicineDetails,
  onChangeMedicine,
  cropDetails,
  onChangeCrop,
  fertilizerDetails,
  onChangeFertilizer,
  seedDetails,
  onChangeSeed,
  errors = {},
}) => {
  const { colors, brandColors } = useTheme();

  return (
    <CommonFormCard
      title="Agro Product Category"
      subtitle="Select agro classification to load specialized crop specifications"
      icon="leaf-outline"
    >
      {/* 4 Segmented Category Selector */}
      <View style={styles.typeSelectorRow}>
        {AGRO_PRODUCT_TYPE_OPTIONS.map((opt) => {
          const isSelected = selectedType === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.typeCard,
                {
                  backgroundColor: isSelected ? brandColors.primary + '15' : colors.surfaceSubtle,
                  borderColor: isSelected ? brandColors.primary : colors.border,
                },
              ]}
              onPress={() => onSelectType(opt.value)}
            >
              <Ionicons
                name={opt.icon as any}
                size={20}
                color={isSelected ? brandColors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeCardText,
                  {
                    color: isSelected ? brandColors.primary : colors.textPrimary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Dynamic Sub-form 1: Crop Medicine */}
      {selectedType === 'Crop Medicine' && (
        <View style={styles.subForm}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Medicine Type</Text>
              <CommonDropdown
                options={MEDICINE_TYPE_OPTIONS}
                selectedValue={medicineDetails.medicineType}
                onSelect={(val) => onChangeMedicine({ medicineType: val })}
              />
            </View>

            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Active Ingredient <Text style={{ color: brandColors.error }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.activeIngredient ? brandColors.error : colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Chlorpyrifos 50% + Cypermethrin 5%"
                placeholderTextColor={colors.textMuted}
                value={medicineDetails.activeIngredient}
                onChangeText={(val) => onChangeMedicine({ activeIngredient: val })}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Formulation</Text>
              <CommonDropdown
                options={FORMULATION_OPTIONS}
                selectedValue={medicineDetails.formulationType}
                onSelect={(val) => onChangeMedicine({ formulationType: val })}
              />
            </View>

            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Toxicity Level</Text>
              <CommonDropdown
                options={TOXICITY_CLASSES}
                selectedValue={medicineDetails.toxicityClass}
                onSelect={(val) => onChangeMedicine({ toxicityClass: val })}
                placeholder="Select toxicity tag"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Target Pest / Disease</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Aphids, Jassids, Bollworms"
                placeholderTextColor={colors.textMuted}
                value={medicineDetails.targetPest || ''}
                onChangeText={(val) => onChangeMedicine({ targetPest: val })}
              />
            </View>

            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Recommended Dosage</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. 2 ml / Litre or 400 ml/Acre"
                placeholderTextColor={colors.textMuted}
                value={medicineDetails.recommendedDosage || ''}
                onChangeText={(val) => onChangeMedicine({ recommendedDosage: val })}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Waiting Period / PHI (Days)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. 14 Days"
                placeholderTextColor={colors.textMuted}
                value={medicineDetails.waitingPeriodPhi || ''}
                onChangeText={(val) => onChangeMedicine({ waitingPeriodPhi: val })}
              />
            </View>

            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>CIB&RC Reg. Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. CIR-14283/2019"
                placeholderTextColor={colors.textMuted}
                value={medicineDetails.registrationNumber || ''}
                onChangeText={(val) => onChangeMedicine({ registrationNumber: val })}
              />
            </View>
          </View>
        </View>
      )}

      {/* Dynamic Sub-form 2: Crops / Harvest Produce */}
      {selectedType === 'Crop' && (
        <View style={styles.subForm}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Crop Season</Text>
              <CommonDropdown
                options={CROP_SEASONS}
                selectedValue={cropDetails.cropSeason}
                onSelect={(val) => onChangeCrop({ cropSeason: val })}
              />
            </View>

            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Crop Variety <Text style={{ color: brandColors.error }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.cropVariety ? brandColors.error : colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Sharbati Wheat, Basmati 1121"
                placeholderTextColor={colors.textMuted}
                value={cropDetails.cropVariety}
                onChangeText={(val) => onChangeCrop({ cropVariety: val })}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Quality Grade</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Grade A / Premium / Export"
                placeholderTextColor={colors.textMuted}
                value={cropDetails.grade}
                onChangeText={(val) => onChangeCrop({ grade: val })}
              />
            </View>

            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Moisture Content (%)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. 12%"
                placeholderTextColor={colors.textMuted}
                value={cropDetails.moistureContent || ''}
                onChangeText={(val) => onChangeCrop({ moistureContent: val })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Organic Certified Produce</Text>
              <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
                Certified according to NPOP / Jaivik Bharat standards
              </Text>
            </View>
            <Switch
              value={cropDetails.organicCertified}
              onValueChange={(val) => onChangeCrop({ organicCertified: val })}
              trackColor={{ false: colors.border, true: brandColors.primaryLight }}
              thumbColor={cropDetails.organicCertified ? brandColors.primary : '#FFFFFF'}
            />
          </View>
        </View>
      )}

      {/* Dynamic Sub-form 3: Fertilizers */}
      {selectedType === 'Fertilizer' && (
        <View style={styles.subForm}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Fertilizer Type</Text>
              <CommonDropdown
                options={FERTILIZER_TYPE_OPTIONS}
                selectedValue={fertilizerDetails.fertilizerType}
                onSelect={(val) => onChangeFertilizer({ fertilizerType: val })}
              />
            </View>

            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Physical Form</Text>
              <CommonDropdown
                options={PHYSICAL_FORM_OPTIONS}
                selectedValue={fertilizerDetails.physicalForm}
                onSelect={(val) => onChangeFertilizer({ physicalForm: val })}
              />
            </View>
          </View>

          {/* N-P-K Ratio Inputs */}
          <Text style={[styles.subheading, { color: colors.textPrimary }]}>Primary Nutrient Ratio (N - P - K %)</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Nitrogen (N %)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="19"
                placeholderTextColor={colors.textMuted}
                value={fertilizerDetails.nitrogenPct || ''}
                onChangeText={(val) => onChangeFertilizer({ nitrogenPct: val })}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Phosphorus (P %)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="19"
                placeholderTextColor={colors.textMuted}
                value={fertilizerDetails.phosphorusPct || ''}
                onChangeText={(val) => onChangeFertilizer({ phosphorusPct: val })}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Potassium (K %)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="19"
                placeholderTextColor={colors.textMuted}
                value={fertilizerDetails.potassiumPct || ''}
                onChangeText={(val) => onChangeFertilizer({ potassiumPct: val })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Application Method</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Soil Broadcast / Fertigation / Foliar"
                placeholderTextColor={colors.textMuted}
                value={fertilizerDetails.applicationMethod}
                onChangeText={(val) => onChangeFertilizer({ applicationMethod: val })}
              />
            </View>
          </View>
        </View>
      )}

      {/* Dynamic Sub-form 4: Seeds */}
      {selectedType === 'Seeds' && (
        <View style={styles.subForm}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Seed Category</Text>
              <CommonDropdown
                options={SEED_TYPE_OPTIONS}
                selectedValue={seedDetails.seedType}
                onSelect={(val) => onChangeSeed({ seedType: val })}
              />
            </View>

            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Certification Class</Text>
              <CommonDropdown
                options={SEED_CLASS_OPTIONS}
                selectedValue={seedDetails.seedClass}
                onSelect={(val) => onChangeSeed({ seedClass: val })}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Seed Variety <Text style={{ color: brandColors.error }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.seedVariety ? brandColors.error : colors.border, color: colors.textPrimary }]}
                placeholder="e.g. Mahyco Hybrid Tomato, Pioneer Maize"
                placeholderTextColor={colors.textMuted}
                value={seedDetails.seedVariety}
                onChangeText={(val) => onChangeSeed({ seedVariety: val })}
              />
            </View>

            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Germination Rate (%)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.germinationRate ? brandColors.error : colors.border, color: colors.textPrimary }]}
                placeholder="e.g. 85%"
                placeholderTextColor={colors.textMuted}
                value={seedDetails.germinationRate || ''}
                onChangeText={(val) => onChangeSeed({ germinationRate: val })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Lot / Test Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. LOT-2026-904"
                placeholderTextColor={colors.textMuted}
                value={seedDetails.lotNumber || ''}
                onChangeText={(val) => onChangeSeed({ lotNumber: val })}
              />
            </View>

            <View style={styles.col}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Maturity Duration (Days)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="e.g. 110 Days"
                placeholderTextColor={colors.textMuted}
                value={seedDetails.daysToMaturity || ''}
                onChangeText={(val) => onChangeSeed({ daysToMaturity: val })}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      )}
    </CommonFormCard>
  );
};

const styles = StyleSheet.create({
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  typeCardText: {
    fontSize: 11,
    textAlign: 'center',
  },
  subForm: {
    marginTop: 8,
  },
  subheading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  switchSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
});

