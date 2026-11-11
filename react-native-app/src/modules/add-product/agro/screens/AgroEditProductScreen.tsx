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
  AgroProductTypeSection,
  AgroBatchSection,
} from '../components';
import {
  AgroProductType,
  AgroMedicineDetails,
  AgroCropDetails,
  AgroFertilizerDetails,
  AgroSeedDetails,
  AgroProductFormData,
} from '../types';
import { ProductBatchItem } from '../../common/types';
import { validateAgroProduct } from '../validations';
import { agroProductService } from '../services';

export const AgroEditProductScreen: React.FC = () => {
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
  } = useCommonProductForm({ storeType: 'agro' });

  const [selectedType, setSelectedType] = useState<AgroProductType>('Crop Medicine');
  const [medicineDetails, setMedicineDetails] = useState<AgroMedicineDetails>({
    medicineType: 'Insecticide',
    activeIngredient: '',
    formulationType: 'EC',
    applicationMethod: 'Foliar Spray',
  });
  const [cropDetails, setCropDetails] = useState<AgroCropDetails>({
    cropCategory: 'Cereals',
    cropVariety: '',
    cropSeason: 'Kharif',
    grade: 'Grade A',
    organicCertified: false,
  });
  const [fertilizerDetails, setFertilizerDetails] = useState<AgroFertilizerDetails>({
    fertilizerType: 'Chemical Fertilizer',
    physicalForm: 'Granules',
    applicationMethod: 'Soil Application',
  });
  const [seedDetails, setSeedDetails] = useState<AgroSeedDetails>({
    seedType: 'Vegetable Seeds',
    cropName: '',
    seedVariety: '',
    hybridType: 'Hybrid',
    seedClass: 'Certified Seed',
  });
  const [batches, setBatches] = useState<ProductBatchItem[]>([]);

  useEffect(() => {
    if (!productId) {
      setIsLoadingProduct(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await agroProductService.getProductById(productId);
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

          if (res.agro_product_type) {
            setSelectedType(res.agro_product_type as AgroProductType);
          }

          if (res.medicine_detail) {
            setMedicineDetails({
              medicineType: res.medicine_detail.medicine_type || 'Insecticide',
              activeIngredient: res.medicine_detail.active_ingredient || '',
              formulationType: res.medicine_detail.formulation_type || 'EC',
              applicationMethod: res.medicine_detail.application_method || 'Spray',
              targetPest: res.medicine_detail.target_pest,
              recommendedDosage: res.medicine_detail.recommended_dosage,
              waitingPeriodPhi: res.medicine_detail.waiting_period_phi,
              toxicityClass: res.medicine_detail.toxicity_class,
              registrationNumber: res.medicine_detail.registration_number,
            });
          }

          if (res.crop_detail) {
            setCropDetails({
              cropCategory: res.crop_detail.crop_category || 'Cereals',
              cropVariety: res.crop_detail.crop_variety || '',
              cropSeason: res.crop_detail.crop_season || 'Kharif',
              grade: res.crop_detail.grade || 'Grade A',
              moistureContent: res.crop_detail.moisture_content,
              organicCertified: !!res.crop_detail.organic_certified,
            });
          }

          if (res.fertilizer_detail) {
            setFertilizerDetails({
              fertilizerType: res.fertilizer_detail.fertilizer_type || 'Chemical Fertilizer',
              physicalForm: res.fertilizer_detail.physical_form || 'Granules',
              applicationMethod: res.fertilizer_detail.application_method || 'Soil Application',
              nitrogenPct: String(res.fertilizer_detail.nitrogen_pct || ''),
              phosphorusPct: String(res.fertilizer_detail.phosphorus_pct || ''),
              potassiumPct: String(res.fertilizer_detail.potassium_pct || ''),
            });
          }

          if (res.seed_detail) {
            setSeedDetails({
              seedType: res.seed_detail.seed_type || 'Vegetable Seeds',
              cropName: res.seed_detail.crop_name || '',
              seedVariety: res.seed_detail.seed_variety || '',
              hybridType: res.seed_detail.hybrid_type || 'Hybrid',
              seedClass: res.seed_detail.seed_class || 'Certified Seed',
              germinationRate: String(res.seed_detail.germination_rate || ''),
              physicalPurity: String(res.seed_detail.physical_purity || ''),
              lotNumber: res.seed_detail.lot_number,
              daysToMaturity: String(res.seed_detail.days_to_maturity || ''),
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
        console.warn('Failed to load agro product:', err);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleUpdateProduct = async () => {
    const isCommonValid = validateCommonForm();
    const fullFormData: AgroProductFormData = {
      basic: basicInfo,
      pricing: pricingInfo,
      inventory: inventoryInfo,
      units: unitInfo,
      agroProductType: selectedType,
      medicineDetails,
      cropDetails,
      fertilizerDetails,
      seedDetails,
      batches,
    };

    const storeValidation = validateAgroProduct(fullFormData);
    if (!isCommonValid || !storeValidation.isValid) {
      setErrors((prev) => ({ ...prev, ...storeValidation.errors }));
      Alert.alert('Validation Error', 'Please check the required agro specifications.');
      return;
    }

    try {
      setIsSubmitting(true);
      await agroProductService.updateProduct(productId, fullFormData);
      Alert.alert('Success', 'Agro product updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to update agro product.';
      Alert.alert('Update Failed', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await agroProductService.deleteProduct(productId);
      Alert.alert('Deleted', 'Agro product removed.', [
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
      storeType="agro"
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
        skuPrefix="AGRO"
      />

      <AgroProductTypeSection
        selectedType={selectedType}
        onSelectType={setSelectedType}
        medicineDetails={medicineDetails}
        onChangeMedicine={(up) => setMedicineDetails((p) => ({ ...p, ...up }))}
        cropDetails={cropDetails}
        onChangeCrop={(up) => setCropDetails((p) => ({ ...p, ...up }))}
        fertilizerDetails={fertilizerDetails}
        onChangeFertilizer={(up) => setFertilizerDetails((p) => ({ ...p, ...up }))}
        seedDetails={seedDetails}
        onChangeSeed={(up) => setSeedDetails((p) => ({ ...p, ...up }))}
        errors={errors}
      />

      <AgroBatchSection
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

