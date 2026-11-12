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
  ClothingSpecificationsSection,
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

export const ClothingEditProductScreen: React.FC = () => {
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
  } = useCommonProductForm({ storeType: 'clothing' });

  const [specifications, setSpecifications] = useState<ClothingSpecifications>({
    gender: 'men',
    clothingType: 't-shirt',
    fabric: 'pure-cotton',
    pattern: 'solid',
    fit: 'regular',
  });

  const [measurements, setMeasurements] = useState<ClothingMeasurements>({});
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariantItem[]>([]);

  useEffect(() => {
    if (!productId) {
      setIsLoadingProduct(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await clothingProductService.getProductById(productId);
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
            gstRate: res.tax_rate || 0,
            taxType: res.tax_type || 'inclusive',
            hsnCode: res.hsn_code || '',
          });

          updateInventoryInfo({
            openingStock: String(res.stock_quantity || 0),
            currentStock: String(res.stock_quantity || 0),
            minimumStock: String(res.min_stock_level || 5),
            reorderLevel: String(res.reorder_level || 10),
          });

          setSpecifications({
            gender: res.gender || 'men',
            clothingType: res.clothing_type || 't-shirt',
            fabric: res.fabric_type || 'pure-cotton',
            pattern: res.pattern || 'solid',
            fit: res.fit_type || 'regular',
            neckType: res.neck_type,
            sleeveLength: res.sleeve_type,
            occasion: res.occasion,
            careInstructions: res.detail?.care_instructions,
          });

          if (res.detail) {
            setMeasurements({
              chest: res.detail.chest_measure,
              waist: res.detail.waist_measure,
              hip: res.detail.hip_measure,
              length: res.detail.length_measure,
              shoulder: res.detail.shoulder_measure,
              sleeve: res.detail.sleeve_measure,
              inseam: res.detail.inseam_measure,
            });
          }

          if (res.variants && res.variants.length > 0) {
            setVariants(
              res.variants.map((v: any) => ({
                id: v.id,
                size: v.size,
                color: v.color,
                sku: v.sku,
                barcode: v.barcode,
                purchase_price: String(v.purchase_price || ''),
                selling_price: String(v.selling_price || ''),
                mrp: String(v.mrp || ''),
                stock_quantity: String(v.stock_quantity || 0),
              }))
            );
          }
        }
      } catch (err) {
        console.warn('Failed to load clothing product:', err);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleUpdateProduct = async () => {
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
      await clothingProductService.updateProduct(productId, fullFormData);
      Alert.alert('Success', 'Clothing product updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to update clothing product.';
      Alert.alert('Update Failed', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await clothingProductService.deleteProduct(productId);
      Alert.alert('Deleted', 'Clothing product removed.', [
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
      storeType="clothing"
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
        skuPrefix="CLTH"
      />

      <ClothingSpecificationsSection
        specifications={specifications}
        onChange={(up) => setSpecifications((p) => ({ ...p, ...up }))}
        errors={errors}
      />

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

