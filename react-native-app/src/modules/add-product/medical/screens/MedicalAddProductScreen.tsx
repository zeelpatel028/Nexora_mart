import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCommonProductForm } from '../../common/hooks/useCommonProductForm';
import {
  AddProductLayout,
  CommonBasicInfoSection,
  CommonPricingSection,
  CommonInventorySection,
  CommonUnitsSection,
} from '../../common/components';
import {
  MedicalSpecificationsSection,
  MedicalPackagingSection,
  MedicalBatchSection,
} from '../components';
import {
  MedicalSpecifications,
  MedicalPackagingDetails,
  MedicalProductFormData,
} from '../types';
import { ProductBatchItem } from '../../common/types';
import { validateMedicalProduct } from '../validations';
import { medicalProductService } from '../services';

export const MedicalAddProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // 1. Shared common form hook
  const {
    basicInfo,
    pricingInfo,
    inventoryInfo,
    unitInfo,
    errors,
    setErrors,
    categories,
    brands,
    units,
    updateBasicInfo,
    updatePricingInfo,
    updateInventoryInfo,
    updateUnitInfo,
    validateCommonForm,
    isSubmitting,
    setIsSubmitting,
  } = useCommonProductForm({ storeType: 'medical' });

  // 2. Pharmacy-specific state
  const [specifications, setSpecifications] = useState<MedicalSpecifications>({
    medicineType: 'Prescription Medicine',
    composition: '',
    strength: '500',
    strengthUnit: 'mg',
    dosageForm: 'Tablet',
    routeOfAdministration: 'Oral',
    prescriptionRequired: false,
    scheduleType: 'Schedule H',
    storageCondition: 'Cool & Dry Place',
  });

  const [packaging, setPackaging] = useState<MedicalPackagingDetails>({
    packSize: '10 Tablets / Strip',
    stripsPerBox: 10,
    tabletsPerStrip: 10,
    keepRefrigerated: false,
    lightSensitive: false,
  });

  const [batches, setBatches] = useState<ProductBatchItem[]>([]);

  // Submit Handler
  const handleSaveProduct = async () => {
    const isCommonValid = validateCommonForm();
    const fullFormData: MedicalProductFormData = {
      basic: basicInfo,
      pricing: pricingInfo,
      inventory: inventoryInfo,
      units: unitInfo,
      specifications,
      packaging,
      batches,
    };

    const storeValidation = validateMedicalProduct(fullFormData);
    if (!isCommonValid || !storeValidation.isValid) {
      setErrors((prev) => ({ ...prev, ...storeValidation.errors }));
      Alert.alert('Validation Error', 'Please check the required pharmacy and drug compliance fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await medicalProductService.createProduct(fullFormData);
      Alert.alert('Success', 'Medicine registered successfully with batch lots!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to create medicine.';
      Alert.alert('Save Failed', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AddProductLayout
      storeType="medical"
      title="Add Pharmacy Product"
      subtitle="Register medicine details, drug schedule, and batch expiry tracking"
      isLoading={isSubmitting}
      onBack={() => navigation.goBack()}
      onSave={handleSaveProduct}
    >
      {/* 1. Basic Information */}
      <CommonBasicInfoSection
        data={basicInfo}
        onChange={updateBasicInfo}
        categories={categories}
        brands={brands}
        errors={errors}
        skuPrefix="MED"
      />

      {/* 2. Pharmacy Specifications */}
      <MedicalSpecificationsSection
        specifications={specifications}
        onChange={(up) => setSpecifications((p) => ({ ...p, ...up }))}
        errors={errors}
      />

      {/* 3. Packaging & Unit Conversions */}
      <MedicalPackagingSection
        packaging={packaging}
        onChange={(up) => setPackaging((p) => ({ ...p, ...up }))}
      />

      {/* 4. Batch & Expiry Tracking (FEFO) */}
      <MedicalBatchSection
        batches={batches}
        onChangeBatches={setBatches}
        basePurchasePrice={pricingInfo.purchasePrice}
        baseSellingPrice={pricingInfo.sellingPrice}
        baseMrp={pricingInfo.mrp}
      />

      {/* 5. Pricing & Taxes */}
      <CommonPricingSection
        data={pricingInfo}
        onChange={updatePricingInfo}
        errors={errors}
      />

      {/* 6. Inventory & Warehouse */}
      <CommonInventorySection
        data={inventoryInfo}
        onChange={updateInventoryInfo}
        errors={errors}
      />

      {/* 7. Units & Packaging */}
      <CommonUnitsSection
        data={unitInfo}
        onChange={updateUnitInfo}
        units={units}
        errors={errors}
      />
    </AddProductLayout>
  );
};

