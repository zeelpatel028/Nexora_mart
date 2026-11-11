import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCommonProductForm } from '../../common/hooks/useCommonProductForm';
import {
  EditProductLayout,
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

export const ElectronicsEditProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const productId = route.params?.productId || route.params?.id;

  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(true);

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
    warrantyMonths: 12,
    warrantyType: 'Brand Carry-In',
  });

  const [serialNumbers, setSerialNumbers] = useState<ElectronicsSerialItem[]>([]);
  const isMobile = specifications.deviceType === 'Smartphone' || specifications.deviceType === 'Tablet';

  useEffect(() => {
    if (!productId) {
      setIsLoadingProduct(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await electronicsProductService.getProductById(productId);
        if (res) {
          updateBasicInfo({
            productName: res.product_name,
            sku: res.sku,
            barcode: res.barcode,
            categoryId: res.category_id,
            brandId: res.brand_id,
            description: res.description,
            status: res.status || 'active',
          });

          updatePricingInfo({
            purchasePrice: String(res.purchase_price || ''),
            sellingPrice: String(res.selling_price || ''),
            mrp: String(res.mrp || ''),
            gstRate: res.tax_rate || 18,
            taxType: res.tax_type || 'inclusive',
            hsnCode: res.hsn_code || '8517',
          });

          updateInventoryInfo({
            openingStock: String(res.stock_quantity || 0),
            currentStock: String(res.stock_quantity || 0),
            minimumStock: String(res.min_stock_level || 2),
            reorderLevel: String(res.reorder_level || 5),
          });

          setSpecifications({
            deviceType: res.device_type || 'Smartphone',
            modelName: res.model_name,
            modelNumber: res.model_number,
            color: res.color,
            ram: res.ram,
            storageCapacity: res.storage_capacity,
            processor: res.processor,
            screenSize: res.screen_size,
            batteryCapacity: res.battery_capacity,
            connectivity: res.connectivity,
            warrantyMonths: res.warranty_months || 12,
            warrantyType: res.warranty_type || 'Brand Carry-In',
          });

          if (res.serials && res.serials.length > 0) {
            setSerialNumbers(
              res.serials.map((s: any) => ({
                id: s.id,
                serialNumber: s.serial_number,
                imeiNumber: s.imei_number,
                status: s.status || 'available',
              }))
            );
          }
        }
      } catch (err) {
        console.warn('Failed to load electronics product:', err);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleUpdateProduct = async () => {
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
      Alert.alert('Validation Error', 'Please check highlighted hardware fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await electronicsProductService.updateProduct(productId, fullFormData);
      Alert.alert('Success', 'Electronics product updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to update electronics product.';
      Alert.alert('Update Failed', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await electronicsProductService.deleteProduct(productId);
      Alert.alert('Deleted', 'Electronics product removed.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Delete Failed', String(err?.message || 'Could not delete product.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6A1A" />
      </View>
    );
  }

  return (
    <EditProductLayout
      storeType="electronics"
      productName={basicInfo.productName}
      sku={basicInfo.sku}
      isLoading={isSubmitting}
      onBack={() => navigation.goBack()}
      onUpdate={handleUpdateProduct}
      onDelete={handleDelete}
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
    </EditProductLayout>
  );
};

