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
import { GrocerySpecificationsSection } from '../components';
import {
  GrocerySpecifications,
  GroceryProductFormData,
} from '../types';
import { validateGroceryProduct } from '../validations';
import { groceryProductService } from '../services';

export const GroceryAddProductScreen: React.FC = () => {
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
  } = useCommonProductForm({ storeType: 'grocery' });

  const [specifications, setSpecifications] = useState<GrocerySpecifications>({
    foodType: 'Vegetarian',
    itemType: 'Packaged Food',
    packagingType: 'Packet / Pouch',
    netWeight: '1 kg',
    shelfLifeDays: '',
    isVegetarian: true,
    isOrganic: false,
    storageType: '',
  });

  const handleSaveProduct = async () => {
    const isCommonValid = validateCommonForm();
    const fullFormData: GroceryProductFormData = {
      basic: basicInfo,
      pricing: pricingInfo,
      inventory: inventoryInfo,
      units: unitInfo,
      specifications,
      batches: [],
    };

    const storeValidation = validateGroceryProduct(fullFormData);
    if (!isCommonValid || !storeValidation.isValid) {
      setErrors((prev) => ({ ...prev, ...storeValidation.errors }));
      Alert.alert('Validation Error', 'Please check highlighted fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await groceryProductService.createProduct(fullFormData);
      Alert.alert('Success', 'Grocery product added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to create grocery product.';
      Alert.alert('Save Failed', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AddProductLayout
      storeType="grocery"
      title="Add Grocery Product"
      subtitle="Fast retail registration with smart stock & expiry alerts"
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
        skuPrefix="GROC"
      />

      <GrocerySpecificationsSection
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
