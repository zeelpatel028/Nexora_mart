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
import { PlasticSpecificationsSection } from '../components';
import {
  PlasticSpecifications,
  PlasticProductFormData,
} from '../types';
import { validatePlasticProduct } from '../validations';
import { plasticProductService } from '../services';

export const PlasticAddProductScreen: React.FC = () => {
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
  } = useCommonProductForm({ storeType: 'plastic' });

  const [specifications, setSpecifications] = useState<PlasticSpecifications>({
    plasticType: 'Polypropylene (PP)',
    materialGrade: '100% Virgin Grade',
    shape: 'Round',
    capacityUnit: 'L',
    foodGrade: false,
    recyclable: true,
    uvResistant: false,
  });

  const handleSaveProduct = async () => {
    const isCommonValid = validateCommonForm();
    const fullFormData: PlasticProductFormData = {
      basic: basicInfo,
      pricing: pricingInfo,
      inventory: inventoryInfo,
      units: unitInfo,
      specifications,
    };

    const storeValidation = validatePlasticProduct(fullFormData);
    if (!isCommonValid || !storeValidation.isValid) {
      setErrors((prev) => ({ ...prev, ...storeValidation.errors }));
      Alert.alert('Validation Error', 'Please check the required polymer & plastic specifications.');
      return;
    }

    try {
      setIsSubmitting(true);
      await plasticProductService.createProduct(fullFormData);
      Alert.alert('Success', 'Plastic product registered successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to create plastic product.';
      Alert.alert('Save Failed', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AddProductLayout
      storeType="plastic"
      title="Add Plastic Product"
      subtitle="Register molded plastics, containers, polymer grades, and dimensions"
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
        skuPrefix="PLAS"
      />

      <PlasticSpecificationsSection
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

