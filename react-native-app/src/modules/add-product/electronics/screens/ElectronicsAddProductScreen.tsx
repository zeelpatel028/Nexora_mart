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
  ElectronicsSpecificationsSection,
  ElectronicsSerialSection,
} from '../components';
import {
  ElectronicsSpecifications,
  ElectronicsSerialItem,
  ElectronicsProductFormData,
} from '../types';
import { validateElectronicsProduct } from '../validations';
import { electronicsProductService } from '../services';

export const ElectronicsAddProductScreen: React.FC = () => {
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
  } = useCommonProductForm({ storeType: 'electronics' });

  const [specifications, setSpecifications] = useState<ElectronicsSpecifications>({
    deviceType: 'Smartphone',
    modelName: '',
    modelNumber: '',
    color: 'Midnight Black',
    ram: '8 GB',
    storageCapacity: '128 GB',
    warrantyMonths: 12,
    warrantyType: 'Brand Carry-In',
  });

  const [serialNumbers, setSerialNumbers] = useState<ElectronicsSerialItem[]>([]);

  const isMobile = specifications.deviceType === 'Smartphone' || specifications.deviceType === 'Tablet';

  const handleSaveProduct = async () => {
    const isCommonValid = validateCommonForm();
    const fullFormData: ElectronicsProductFormData = {
      basic: basicInfo,
      pricing: pricingInfo,
      inventory: {
        ...inventoryInfo,
        openingStock: serialNumbers.length > 0 ? String(serialNumbers.length) : inventoryInfo.openingStock,
      },
      units: unitInfo,
      specifications,
      serialNumbers,
    };

    const storeValidation = validateElectronicsProduct(fullFormData);
    if (!isCommonValid || !storeValidation.isValid) {
      setErrors((prev) => ({ ...prev, ...storeValidation.errors }));
      Alert.alert('Validation Error', 'Please check the hardware specifications and serial numbers.');
      return;
    }

    try {
      setIsSubmitting(true);
      await electronicsProductService.createProduct(fullFormData);
      Alert.alert('Success', 'Electronics product registered successfully with serial numbers!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to create electronics product.';
      Alert.alert('Save Failed', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AddProductLayout
      storeType="electronics"
      title="Add Electronics Product"
      subtitle="Configure hardware specs, IMEI/Serial numbers, and warranty"
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
        skuPrefix="ELEC"
      />

      <ElectronicsSpecificationsSection
        specifications={specifications}
        onChange={(up) => setSpecifications((p) => ({ ...p, ...up }))}
        errors={errors}
      />

      <ElectronicsSerialSection
        serialNumbers={serialNumbers}
        onChangeSerials={setSerialNumbers}
        isMobileDevice={isMobile}
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

