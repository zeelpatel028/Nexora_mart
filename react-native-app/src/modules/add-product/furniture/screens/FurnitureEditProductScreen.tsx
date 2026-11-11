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
import { FurnitureSpecificationsSection } from '../components';
import {
  FurnitureSpecifications,
  FurnitureProductFormData,
} from '../types';
import { validateFurnitureProduct } from '../validations';
import { furnitureProductService } from '../services';

export const FurnitureEditProductScreen: React.FC = () => {
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

  useEffect(() => {
    if (!productId) {
      setIsLoadingProduct(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await furnitureProductService.getProductById(productId);
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
            hsnCode: res.hsn_code || '9403',
          });

          updateInventoryInfo({
            openingStock: String(res.stock_quantity || 0),
            currentStock: String(res.stock_quantity || 0),
            minimumStock: String(res.min_stock_level || 1),
            reorderLevel: String(res.reorder_level || 3),
          });

          setSpecifications({
            furnitureType: res.furniture_type || 'Sofa & Couch',
            material: res.material || 'Solid Teak Wood',
            woodType: res.wood_type,
            finishType: res.finish_type || 'Walnut Finish',
            color: res.color,
            seatingCapacity: res.seating_capacity ? String(res.seating_capacity) : undefined,
            length: res.length,
            width: res.width,
            height: res.height,
            dimensionUnit: res.dimension_unit || 'inch',
            weight: res.weight,
            weightUnit: res.weight_unit || 'kg',
            assemblyRequired: !!res.assembly_required,
            storageAvailable: !!res.storage_available,
            warrantyPeriod: res.warranty_period || 36,
            warrantyUnit: res.warranty_unit || 'Months',
          });
        }
      } catch (err) {
        console.warn('Failed to load furniture product:', err);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleUpdateProduct = async () => {
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
      Alert.alert('Validation Error', 'Please check highlighted furniture fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await furnitureProductService.updateProduct(productId, fullFormData);
      Alert.alert('Success', 'Furniture product updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to update furniture product.';
      Alert.alert('Update Failed', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await furnitureProductService.deleteProduct(productId);
      Alert.alert('Deleted', 'Furniture product removed.', [
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
      storeType="furniture"
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
    </EditProductLayout>
  );
};

