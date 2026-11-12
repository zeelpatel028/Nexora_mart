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
  ClothingSpecificationsSection,
  ClothingMeasurementSection,
  ClothingVariantSection,
} from '../components';
import {
  ClothingSpecifications,
  ClothingMeasurements,
  ClothingProductFormData,
} from '../types';
import { ProductVariantItem } from '../../common/types';
import { validateClothingProduct } from '../validations';
import { clothingProductService } from '../services';

export const ClothingAddProductScreen: React.FC = () => {
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
  } = useCommonProductForm({ storeType: 'clothing' });

  // 2. Clothing-specific state
  const [specifications, setSpecifications] = useState<ClothingSpecifications>({
    gender: 'men',
    clothingType: 't-shirt',
    fabric: 'pure-cotton',
    pattern: 'solid',
    fit: 'regular',
    neckType: 'Round Neck',
    sleeveLength: 'Half Sleeve',
    occasion: 'Casual',
    careInstructions: 'machine-wash-cold',
  });

  const [measurements, setMeasurements] = useState<ClothingMeasurements>({});
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L', 'XL']);
  const [selectedColors, setSelectedColors] = useState<string[]>(['Black', 'Navy Blue', 'White']);
  const [variants, setVariants] = useState<ProductVariantItem[]>([]);

  // Update handlers
  const handleUpdateSpecs = (updated: Partial<ClothingSpecifications>) => {
    setSpecifications((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateMeasurements = (updated: Partial<ClothingMeasurements>) => {
    setMeasurements((prev) => ({ ...prev, ...updated }));
  };

  // Submit Handler
  const handleSaveProduct = async () => {
    const isCommonValid = validateCommonForm();
    const fullFormData: ClothingProductFormData = {
      basic: basicInfo,
      pricing: pricingInfo,
      inventory: inventoryInfo,
      units: unitInfo,
      specifications,
      measurements,
      selectedSizes,
      selectedColors,
      variants,
    };

    const storeValidation = validateClothingProduct(fullFormData);
    if (!isCommonValid || !storeValidation.isValid) {
      setErrors((prev) => ({ ...prev, ...storeValidation.errors }));
      Alert.alert('Validation Error', 'Please correct the highlighted fields before saving.');
      return;
    }

    try {
      setIsSubmitting(true);
      await clothingProductService.createProduct(fullFormData);
      Alert.alert('Success', 'Clothing product created successfully with all variants!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to create clothing product.';
      Alert.alert('Save Failed', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AddProductLayout
      storeType="clothing"
      title="Add Apparel Product"
      subtitle="Configure clothing specifications, fabric, and size-color variants"
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
        skuPrefix="CLTH"
      />

      {/* 2. Apparel Specifications */}
      <ClothingSpecificationsSection
        specifications={specifications}
        onChange={handleUpdateSpecs}
        errors={errors}
      />

      {/* 3. Size & Color Variant Matrix */}
      <ClothingVariantSection
        selectedSizes={selectedSizes}
        onChangeSizes={setSelectedSizes}
        selectedColors={selectedColors}
        onChangeColors={setSelectedColors}
        variants={variants}
        onChangeVariants={setVariants}
        baseSku={basicInfo.sku}
        basePurchasePrice={pricingInfo.purchasePrice}
        baseSellingPrice={pricingInfo.sellingPrice}
        baseMrp={pricingInfo.mrp}
      />

      {/* 4. Pricing & Taxes */}
      <CommonPricingSection
        data={pricingInfo}
        onChange={updatePricingInfo}
        errors={errors}
      />

      {/* 6. Inventory & Stock */}
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

