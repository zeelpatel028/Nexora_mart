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
import { FurnitureSpecificationsSection } from '../components';
import {
  FurnitureSpecifications,
  FurnitureProductFormData,
} from '../types';
import { validateFurnitureProduct } from '../validations';
import { furnitureProductService } from '../services';

export const FurnitureAddProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();

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
  } = useCommonProductForm({ storeType: 'furniture' });

  const [specifications, setSpecifications] = useState<FurnitureSpecifications>({
    furnitureType: 'Sofa & Couch',
    material: 'Solid Teak Wood',
    finishType: 'Walnut Finish',
    dimensionUnit: 'inch',
    weightUnit: 'kg',
    assemblyRequired: false,
    storageAvailable: false,
    warrantyPeriod: 36,
    warrantyUnit: 'Months',
  });

  const handleSaveProduct = async () => {
    const isCommonValid = validateCommonForm();
    const fullFormData: FurnitureProductFormData = {
      basic: basicInfo,
      pricing: pricingInfo,
      inventory: inventoryInfo,
      units: unitInfo,
      specifications,
    };

    const storeValidation = validateFurnitureProduct(fullFormData);
    if (!isCommonValid || !storeValidation.isValid) {
      setErrors((prev) => ({ ...prev, ...storeValidation.errors }));
      Alert.alert('Validation Error', 'Please check the required furniture specifications.');
      return;
    }

    try {
      setIsSubmitting(true);
      await furnitureProductService.createProduct(fullFormData);
      Alert.alert('Success', 'Furniture product registered successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to create furniture product.';
      Alert.alert('Save Failed', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AddProductLayout
      storeType="furniture"
      title="Add Furniture Product"
      subtitle="Register wood craft, dimensions L×W×H, upholstery, and warranty coverage"
      isLoading={isSubmitting}
      onBack={() => navigation.goBack()}
      onSave={handleSaveProduct}
    >
      <CommonBasicInfoSection
        data={basicInfo}
        onChange={updateBasicInfo}
        categories={categories}
        brands={brands}
        errors={errors}
        skuPrefix="FURN"
      />

      <FurnitureSpecificationsSection
        specifications={specifications}
        onChange={(up) => setSpecifications((p) => ({ ...p, ...up }))}
        errors={errors}
      />

      <CommonPricingSection
        data={pricingInfo}
        onChange={updatePricingInfo}
        errors={errors}
      />

      <CommonInventorySection
        data={inventoryInfo}
        onChange={updateInventoryInfo}
        errors={errors}
      />

      <CommonUnitsSection
        data={unitInfo}
        onChange={updateUnitInfo}
        units={units}
        errors={errors}
      />
    </AddProductLayout>
  );
};

