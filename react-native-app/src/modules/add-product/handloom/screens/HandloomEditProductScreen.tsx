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
import { HandloomSpecificationsSection } from '../components';
import {
  HandloomSpecifications,
  HandloomProductFormData,
} from '../types';
import { validateHandloomProduct } from '../validations';
import { handloomProductService } from '../services';

export const HandloomEditProductScreen: React.FC = () => {
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
  } = useCommonProductForm({ storeType: 'handloom' });

  const [specifications, setSpecifications] = useState<HandloomSpecifications>({
    productType: 'Saree',
    fabricType: 'Pure Mulberry Silk',
    weavingTechnique: 'Traditional Pit Loom',
    craftType: 'Banarasi Brocade',
    originRegion: 'Varanasi, Uttar Pradesh',
    handwoven: true,
  });

  useEffect(() => {
    if (!productId) {
      setIsLoadingProduct(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await handloomProductService.getProductById(productId);
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
            gstRate: res.tax_rate || 5,
            taxType: res.tax_type || 'inclusive',
            hsnCode: res.hsn_code || '5007',
          });

          updateInventoryInfo({
            openingStock: String(res.stock_quantity || 0),
            currentStock: String(res.stock_quantity || 0),
            minimumStock: String(res.min_stock_level || 2),
            reorderLevel: String(res.reorder_level || 5),
          });

          setSpecifications({
            productType: res.product_type || 'Saree',
            fabricType: res.fabric_type || 'Pure Mulberry Silk',
            weavingTechnique: res.weaving_technique || 'Traditional Pit Loom',
            craftType: res.craft_type || 'Banarasi Brocade',
            material: res.material,
            designPattern: res.design_pattern,
            originRegion: res.origin_region,
            artisanName: res.artisan_name,
            handwoven: !!res.handwoven,
          });
        }
      } catch (err) {
        console.warn('Failed to load handloom product:', err);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleUpdateProduct = async () => {
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
      Alert.alert('Validation Error', 'Please check highlighted handloom fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await handloomProductService.updateProduct(productId, fullFormData);
      Alert.alert('Success', 'Handloom product updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to update handloom product.';
      Alert.alert('Update Failed', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await handloomProductService.deleteProduct(productId);
      Alert.alert('Deleted', 'Handloom product removed.', [
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
      storeType="handloom"
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
    </EditProductLayout>
  );
};

