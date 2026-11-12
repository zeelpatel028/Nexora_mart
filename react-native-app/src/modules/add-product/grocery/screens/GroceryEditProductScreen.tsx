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
  GrocerySpecificationsSection,
} from '../components';
import {
  GrocerySpecifications,
  GroceryProductFormData,
} from '../types';
import { ProductBatchItem } from '../../common/types';
import { validateGroceryProduct } from '../validations';
import { groceryProductService } from '../services';

export const GroceryEditProductScreen: React.FC = () => {
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
  } = useCommonProductForm({ storeType: 'grocery' });

  const [specifications, setSpecifications] = useState<GrocerySpecifications>({
    foodType: 'Vegetarian',
    itemType: 'Packaged Food',
    packagingType: 'Packet / Pouch',
    isVegetarian: true,
    isOrganic: false,
  });

  const [batches, setBatches] = useState<ProductBatchItem[]>([]);

  useEffect(() => {
    if (!productId) {
      setIsLoadingProduct(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await groceryProductService.getProductById(productId);
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
            foodType: res.food_type || 'Vegetarian',
            itemType: res.item_type || 'Packaged Food',
            packagingType: res.packaging_type || 'Packet / Pouch',
            netWeight: res.net_weight,
            grossWeight: res.gross_weight,
            shelfLifeDays: res.shelf_life_days ? String(res.shelf_life_days) : undefined,
            isVegetarian: !!res.is_vegetarian,
            isOrganic: !!res.is_organic,
            storageType: res.storage_type,
            fssaiLicense: res.fssai_license,
            ingredients: res.detail?.ingredients,
            allergenInfo: res.detail?.allergen_info,
            manufacturer: res.detail?.manufacturer,
          });

          if (res.batches && res.batches.length > 0) {
            setBatches(
              res.batches.map((b: any) => ({
                id: b.id,
                batch_number: b.batch_number,
                manufacturing_date: b.manufacturing_date,
                expiry_date: b.expiry_date,
                purchase_price: String(b.purchase_price || ''),
                selling_price: String(b.selling_price || ''),
                mrp: String(b.mrp || ''),
                current_quantity: String(b.current_quantity || 0),
                initial_quantity: String(b.initial_quantity || 0),
                rack_location: b.rack_location,
              }))
            );
          }
        }
      } catch (err) {
        console.warn('Failed to load grocery product:', err);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleUpdateProduct = async () => {
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
      await groceryProductService.updateProduct(productId, fullFormData);
      Alert.alert('Success', 'Grocery product updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to update grocery product.';
      Alert.alert('Update Failed', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await groceryProductService.deleteProduct(productId);
      Alert.alert('Deleted', 'Grocery product removed.', [
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
      storeType="grocery"
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
    </EditProductLayout>
  );
};

