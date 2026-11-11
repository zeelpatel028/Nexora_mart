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
  AgroProductTypeSection,
  AgroBatchSection,
} from '../components';
import {
  AgroProductType,
  AgroMedicineDetails,
  AgroCropDetails,
  AgroFertilizerDetails,
  AgroSeedDetails,
  AgroProductFormData,
} from '../types';
import { ProductBatchItem } from '../../common/types';
import { validateAgroProduct } from '../validations';
import { agroProductService } from '../services';

export const AgroAddProductScreen: React.FC = () => {
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
  } = useCommonProductForm({ storeType: 'agro' });

  // 2. Agro-specific state
  const [selectedType, setSelectedType] = useState<AgroProductType>('Crop Medicine');

  const [medicineDetails, setMedicineDetails] = useState<AgroMedicineDetails>({
    medicineType: 'Insecticide',
    activeIngredient: '',
    formulationType: 'EC',
    applicationMethod: 'Foliar Spray',
    dosageUnit: 'ml / Litre',
  });

  const [cropDetails, setCropDetails] = useState<AgroCropDetails>({
    cropCategory: 'Cereals',
    cropVariety: '',
    cropSeason: 'Kharif',
    grade: 'Grade A',
    organicCertified: false,
  });

  const [fertilizerDetails, setFertilizerDetails] = useState<AgroFertilizerDetails>({
    fertilizerType: 'Chemical Fertilizer',
    physicalForm: 'Granules',
    applicationMethod: 'Soil Application',
    nitrogenPct: '19',
    phosphorusPct: '19',
    potassiumPct: '19',
  });

  const [seedDetails, setSeedDetails] = useState<AgroSeedDetails>({
    seedType: 'Vegetable Seeds',
    cropName: '',
    seedVariety: '',
    hybridType: 'Hybrid',
    seedClass: 'Certified Seed',
    germinationRate: '85',
    physicalPurity: '98',
  });

  const [batches, setBatches] = useState<ProductBatchItem[]>([]);

  // Submit Handler
  const handleSaveProduct = async () => {
    const isCommonValid = validateCommonForm();
    const fullFormData: AgroProductFormData = {
      basic: basicInfo,
      pricing: pricingInfo,
      inventory: inventoryInfo,
      units: unitInfo,
      agroProductType: selectedType,
      medicineDetails,
      cropDetails,
      fertilizerDetails,
      seedDetails,
      batches,
    };

    const storeValidation = validateAgroProduct(fullFormData);
    if (!isCommonValid || !storeValidation.isValid) {
      setErrors((prev) => ({ ...prev, ...storeValidation.errors }));
      Alert.alert('Validation Error', 'Please check the required agro specifications.');
      return;
    }

    try {
      setIsSubmitting(true);
      await agroProductService.createProduct(fullFormData);
      Alert.alert('Success', 'Agro product registered successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to create agro product.';
      Alert.alert('Save Failed', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AddProductLayout
      storeType="agro"
      title="Add Agro Product"
      subtitle="Register crop medicines, seeds, fertilizers, or harvested crops"
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
        skuPrefix="AGRO"
      />

      {/* 2. Specialized Agro Type Switcher & Specifications */}
      <AgroProductTypeSection
        selectedType={selectedType}
        onSelectType={setSelectedType}
        medicineDetails={medicineDetails}
        onChangeMedicine={(up) => setMedicineDetails((p) => ({ ...p, ...up }))}
        cropDetails={cropDetails}
        onChangeCrop={(up) => setCropDetails((p) => ({ ...p, ...up }))}
        fertilizerDetails={fertilizerDetails}
        onChangeFertilizer={(up) => setFertilizerDetails((p) => ({ ...p, ...up }))}
        seedDetails={seedDetails}
        onChangeSeed={(up) => setSeedDetails((p) => ({ ...p, ...up }))}
        errors={errors}
      />

      {/* 3. Batches & Expiry (Crucial for Agro Medicines & Seeds) */}
      <AgroBatchSection
        batches={batches}
        onChangeBatches={setBatches}
        basePurchasePrice={pricingInfo.purchasePrice}
        baseSellingPrice={pricingInfo.sellingPrice}
        baseMrp={pricingInfo.mrp}
      />

      {/* 4. Pricing & Tax */}
      <CommonPricingSection
        data={pricingInfo}
        onChange={updatePricingInfo}
        errors={errors}
      />

      {/* 5. Inventory & Warehouse */}
      <CommonInventorySection
        data={inventoryInfo}
        onChange={updateInventoryInfo}
        errors={errors}
      />

      {/* 6. Units & Packaging */}
      <CommonUnitsSection
        data={unitInfo}
        onChange={updateUnitInfo}
        units={units}
        errors={errors}
      />
    </AddProductLayout>
  );
};

