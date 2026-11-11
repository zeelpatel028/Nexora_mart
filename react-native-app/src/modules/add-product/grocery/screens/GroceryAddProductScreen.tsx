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
  GrocerySpecificationsSection,
  GroceryBatchSection,
} from '../components';
import {
  GrocerySpecifications,
  GroceryProductFormData,
} from '../types';
import { ProductBatchItem } from '../../common/types';
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
    shelfLifeDays: '180',
    isVegetarian: true,
    isOrganic: false,
    storageType: 'Cool & Dry Place',
  });

  const [batches, setBatches] = useState<ProductBatchItem[]>([]);

  const handleSaveProduct = async () => {
    const isCommonValid = validateCommonForm();
    const fullFormData: GroceryProductFormData = {
      basic: basicInfo,
      pricing: pricingInfo,
      inventory: inventoryInfo,
      units: unitInfo,
      specifications,
      batches,
    };

    const storeValidation = validateGroceryProduct(fullFormData);
    if (!isCommonValid || !storeValidation.isValid) {
      setErrors((prev) => ({ ...prev, ...storeValidation.errors }));
      Alert.alert('Validation Error', 'Please check highlighted grocery fields.');
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
      subtitle="Register FMCG, staples, food items with weights and shelf life"
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

      <GroceryBatchSection
        batches={batches}
        onChangeBatches={setBatches}
        basePurchasePrice={pricingInfo.purchasePrice}
        baseSellingPrice={pricingInfo.sellingPrice}
        baseMrp={pricingInfo.mrp}
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

