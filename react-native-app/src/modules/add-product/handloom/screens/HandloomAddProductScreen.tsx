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
import { HandloomSpecificationsSection } from '../components';
import {
  HandloomSpecifications,
  HandloomProductFormData,
} from '../types';
import { validateHandloomProduct } from '../validations';
import { handloomProductService } from '../services';

export const HandloomAddProductScreen: React.FC = () => {
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
  } = useCommonProductForm({ storeType: 'handloom' });

  const [specifications, setSpecifications] = useState<HandloomSpecifications>({
    productType: 'Saree',
    fabricType: 'Pure Mulberry Silk',
    weavingTechnique: 'Traditional Pit Loom',
    craftType: 'Banarasi Brocade',
    originRegion: 'Varanasi, Uttar Pradesh',
    handwoven: true,
  });

  const handleSaveProduct = async () => {
    const isCommonValid = validateCommonForm();
    const fullFormData: HandloomProductFormData = {
      basic: basicInfo,
      pricing: pricingInfo,
      inventory: inventoryInfo,
      units: unitInfo,
      specifications,
    };

    const storeValidation = validateHandloomProduct(fullFormData);
    if (!isCommonValid || !storeValidation.isValid) {
      setErrors((prev) => ({ ...prev, ...storeValidation.errors }));
      Alert.alert('Validation Error', 'Please check highlighted handloom specifications.');
      return;
    }

    try {
      setIsSubmitting(true);
      await handloomProductService.createProduct(fullFormData);
      Alert.alert('Success', 'Handloom craft product registered successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to create handloom product.';
      Alert.alert('Save Failed', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AddProductLayout
      storeType="handloom"
      title="Add Handloom Product"
      subtitle="Register handwoven textiles, sarees, GI crafts, and artisan heritage"
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
        skuPrefix="HNDL"
      />

      <HandloomSpecificationsSection
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

