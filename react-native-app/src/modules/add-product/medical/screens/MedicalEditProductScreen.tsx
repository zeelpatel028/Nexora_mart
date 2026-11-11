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
  MedicalSpecificationsSection,
  MedicalPackagingSection,
  MedicalBatchSection,
} from '../components';
import {
  MedicalSpecifications,
  MedicalPackagingDetails,
  MedicalProductFormData,
} from '../types';
import { ProductBatchItem } from '../../common/types';
import { validateMedicalProduct } from '../validations';
import { medicalProductService } from '../services';

export const MedicalEditProductScreen: React.FC = () => {
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
  } = useCommonProductForm({ storeType: 'medical' });

  const [specifications, setSpecifications] = useState<MedicalSpecifications>({
    medicineType: 'Prescription Medicine',
    composition: '',
    strength: '500',
    strengthUnit: 'mg',
    dosageForm: 'Tablet',
    routeOfAdministration: 'Oral',
    prescriptionRequired: false,
    scheduleType: 'Schedule H',
  });

  const [packaging, setPackaging] = useState<MedicalPackagingDetails>({
    packSize: '10 Tablets / Strip',
    stripsPerBox: 10,
    tabletsPerStrip: 10,
    keepRefrigerated: false,
    lightSensitive: false,
  });

  const [batches, setBatches] = useState<ProductBatchItem[]>([]);

  useEffect(() => {
    if (!productId) {
      setIsLoadingProduct(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await medicalProductService.getProductById(productId);
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
            minimumStock: String(res.min_stock_level || 10),
            reorderLevel: String(res.reorder_level || 20),
          });

          setSpecifications({
            genericName: res.generic_name,
            medicineType: res.medicine_type || 'Prescription Medicine',
            composition: res.composition || '',
            strength: res.strength || '',
            strengthUnit: res.strength_unit || 'mg',
            dosageForm: res.dosage_form || 'Tablet',
            routeOfAdministration: res.route_of_administration || 'Oral',
            prescriptionRequired: !!res.prescription_required,
            scheduleType: res.schedule_type || 'Schedule H',
            therapeuticCategory: res.therapeutic_category,
            drugLicenseNumber: res.drug_license_number,
            storageCondition: res.storage_condition,
          });

          if (res.detail) {
            setPackaging({
              packSize: res.detail.pack_size,
              stripsPerBox: res.detail.strips_per_box,
              tabletsPerStrip: res.detail.tablets_per_strip,
              keepRefrigerated: !!res.detail.keep_refrigerated,
              lightSensitive: !!res.detail.light_sensitive,
              manufacturer: res.detail.manufacturer,
              sideEffects: res.detail.side_effects,
            });
          }

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
        console.warn('Failed to load medical product:', err);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleUpdateProduct = async () => {
    const isCommonValid = validateCommonForm();
    const fullFormData: MedicalProductFormData = {
      basic: basicInfo,
      pricing: pricingInfo,
      inventory: inventoryInfo,
      units: unitInfo,
      specifications,
      packaging,
      batches,
    };

    const storeValidation = validateMedicalProduct(fullFormData);
    if (!isCommonValid || !storeValidation.isValid) {
      setErrors((prev) => ({ ...prev, ...storeValidation.errors }));
      Alert.alert('Validation Error', 'Please check the required pharmacy fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await medicalProductService.updateProduct(productId, fullFormData);
      Alert.alert('Success', 'Medicine updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to update medicine.';
      Alert.alert('Update Failed', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await medicalProductService.deleteProduct(productId);
      Alert.alert('Deleted', 'Medicine record removed.', [
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
      storeType="medical"
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
        skuPrefix="MED"
      />

      <MedicalSpecificationsSection
        specifications={specifications}
        onChange={(up) => setSpecifications((p) => ({ ...p, ...up }))}
        errors={errors}
      />

      <MedicalPackagingSection
        packaging={packaging}
        onChange={(up) => setPackaging((p) => ({ ...p, ...up }))}
      />

      <MedicalBatchSection
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
    </EditProductLayout>
  );
};

